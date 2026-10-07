import { inject, injectable } from 'tsyringe';
import type {
  BikeRepository,
  ComponentRepository,
} from '../../../domain/repositories/inventory/BikeRepository.js';
import type { ActivityRepository } from '../../../domain/repositories/activity/ActivityRepository.js';
import type { Component } from '../../../domain/entities/inventory/Bike.js';

export interface WearAlert {
  component_id: string;
  bike_id: string;
  bike_name: string;
  component_name: string;
  category: string;
  wear_km: number;
  expected_lifespan_km: number | null;
  wear_percent: number | null;
  remaining_km: number | null;
  level: 'critical' | 'warning' | 'info';
  estimated_due_date: string | null;
}

/** Share of the expected lifespan at which a component turns critical (>=90%). */
const CRITICAL_WEAR_RATIO = 0.9;
/** Share of the expected lifespan at which a component turns a warning (>=70%). */
const WARNING_WEAR_RATIO = 0.7;
/** Look-back window for the ride-rate used to project the due date. */
const RATE_WINDOW_DAYS = 28;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Wear alerts are ranked worst-first so a truncated list still shows the most
 * urgent component.
 */
const LEVEL_RANK: Record<WearAlert['level'], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

/**
 * Build a severity-ranked, flat list of per-component wear alerts across all of
 * a user's bikes.
 *
 * The thresholds mirror two existing sources so server and client never
 * disagree: `SupabaseBikeRepository.findMaintenanceAlertCounts` (>=90% of
 * lifespan or `status === 'failed'` is critical) and the client's
 * `lifespanStatus` percentage bands (>=70% is a warning).
 *
 * There is no server-side equivalent of the client's `wear-projection.ts`, so
 * the ride rate is re-implemented here from the user's recent activities: the
 * kilometres ridden in the last 4 weeks divided by 4 gives km/week, and
 * `remaining_km / rate` gives the weeks until the component reaches its
 * expected lifespan.
 */
@injectable()
export class GetWearAlerts {
  constructor(
    @inject('BikeRepository') private bikeRepo: BikeRepository,
    @inject('ComponentRepository') private componentRepo: ComponentRepository,
    @inject('ActivityRepository') private activityRepo: ActivityRepository,
  ) {}

  async execute(userId: string): Promise<WearAlert[]> {
    const bikes = await this.bikeRepo.findByUserId(userId);
    if (bikes.length === 0) return [];

    const today = new Date();
    const windowStart = new Date(today.getTime() - RATE_WINDOW_DAYS * MS_PER_DAY);
    const activities = await this.activityRepo.findByUserId(userId, {
      startDate: windowStart.toISOString().slice(0, 10),
    });

    // Whole km/week, matching the client's `weeklyKmRate` (last 4 weeks). A bike
    // is assumed to share the rider's overall rate; Veloer does not track
    // per-bike usage windows.
    const windowKm = activities.reduce((sum, a) => sum + (Number(a.distance) || 0), 0) / 1000;
    const rateKmPerWeek = windowKm > 0 ? windowKm / (RATE_WINDOW_DAYS / 7) : null;

    const alerts: WearAlert[] = [];
    for (const bike of bikes) {
      const components = await this.componentRepo.findActiveByBikeId(bike.id);
      for (const component of components) {
        const alert = this.toAlert(component, bike.id, bike.name, rateKmPerWeek, today);
        if (alert) alerts.push(alert);
      }
    }

    return alerts.sort(
      (a, b) =>
        LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || (b.wear_percent ?? 0) - (a.wear_percent ?? 0),
    );
  }

  private toAlert(
    component: Component,
    bikeId: string,
    bikeName: string,
    rateKmPerWeek: number | null,
    today: Date,
  ): WearAlert | null {
    const wearKm = Math.max(0, Number(component.current_km) - Number(component.install_km ?? 0));
    const lifespan = component.expected_lifespan_km;
    const hasLifespan = lifespan != null && lifespan > 0;
    const wearPercent = hasLifespan ? Math.min(100, (wearKm / lifespan) * 100) : null;
    const remainingKm = hasLifespan ? lifespan - wearKm : null;

    const isFailed = component.status === 'failed';
    const isCriticalWear = hasLifespan && wearKm / lifespan >= CRITICAL_WEAR_RATIO;
    const isWarningWear = hasLifespan && wearKm / lifespan >= WARNING_WEAR_RATIO;

    if (!isFailed && !isWarningWear) return null;

    const level: WearAlert['level'] = isFailed || isCriticalWear ? 'critical' : 'warning';

    let estimatedDueDate: string | null = null;
    if (remainingKm != null && remainingKm > 0 && rateKmPerWeek != null && rateKmPerWeek > 0) {
      const weeksRemaining = remainingKm / rateKmPerWeek;
      const due = new Date(today.getTime() + Math.round(weeksRemaining * 7) * MS_PER_DAY);
      estimatedDueDate = due.toISOString().slice(0, 10);
    }

    return {
      component_id: component.id,
      bike_id: bikeId,
      bike_name: bikeName,
      component_name: component.name,
      category: component.category,
      wear_km: Math.round(wearKm * 10) / 10,
      expected_lifespan_km: hasLifespan ? lifespan : null,
      wear_percent: wearPercent == null ? null : Math.round(wearPercent * 10) / 10,
      remaining_km: remainingKm == null ? null : Math.round(remainingKm * 10) / 10,
      level,
      estimated_due_date: estimatedDueDate,
    };
  }
}
