import type { Bike, Component } from '../types/inventory';
import { wearPercent } from './lifespan';
import { wearBand, type WearBand } from './inventory-metrics';

/** Category display order for the condition rail. */
export const CATEGORY_ORDER: Component['category'][] = [
  'drivetrain',
  'braking',
  'wheel',
  'cockpit',
  'frame',
  'other',
];

export interface CategoryWear {
  category: Component['category'];
  band: WearBand;
  /** Wear of the most-worn component in the category, capped at 100. */
  percent: number | null;
  /** Number of live (non-replaced) components in the category. */
  count: number;
}

/**
 * One entry per component category, in display order. A category with no live
 * components has `percent: null` and `count: 0` so the rail can render an
 * empty track.
 */
export function categoryWear(components: Component[]): CategoryWear[] {
  return CATEGORY_ORDER.map((category) => {
    const live = components.filter((c) => c.category === category && c.status !== 'replaced');
    let worstPercent = -1;
    let band: WearBand = 'unknown';

    for (const c of live) {
      const pct = wearPercent(c.current_km, c.install_km, c.expected_lifespan_km);
      // A failed component is treated as fully worn regardless of its km.
      const effective = c.status === 'failed' ? 100 : (pct ?? -1);
      if (effective > worstPercent) {
        worstPercent = effective;
        band =
          c.status === 'failed'
            ? 'overdue'
            : wearBand(c.current_km, c.install_km, c.expected_lifespan_km);
      }
    }

    return {
      category,
      band,
      percent: worstPercent < 0 ? null : worstPercent,
      count: live.length,
    };
  });
}

export interface BikeHealth {
  overdue: number;
  dueSoon: number;
  ok: number;
  /** Live components (excludes replaced). */
  activeComponents: number;
  /** The single most-worn component, for the alert line. */
  worst: { component: Component; percent: number } | null;
}

export function bikeHealth(components: Component[]): BikeHealth {
  let overdue = 0;
  let dueSoon = 0;
  let ok = 0;
  let activeComponents = 0;
  let worst: BikeHealth['worst'] = null;

  for (const c of components) {
    if (c.status === 'replaced') continue;
    activeComponents += 1;

    const pct = wearPercent(c.current_km, c.install_km, c.expected_lifespan_km);
    const effective = c.status === 'failed' ? 100 : (pct ?? -1);
    const band =
      c.status === 'failed'
        ? 'overdue'
        : wearBand(c.current_km, c.install_km, c.expected_lifespan_km);

    if (band === 'overdue') overdue += 1;
    else if (band === 'danger') dueSoon += 1;
    else if (band === 'warning') dueSoon += 1;
    else if (band === 'good') ok += 1;

    if (effective > (worst?.percent ?? -1)) {
      worst = { component: c, percent: effective };
    }
  }

  return { overdue, dueSoon, ok, activeComponents, worst };
}

export interface FleetAlert {
  bikeId: string;
  bikeName: string;
  componentId: string;
  componentName: string;
  percent: number;
  band: 'overdue' | 'danger';
}

export interface FleetHealth {
  overdue: number;
  dueSoon: number;
  ok: number;
  /** Every alerting component, worst first. */
  alerts: FleetAlert[];
}

/**
 * Aggregate component wear across the whole garage. Used by the fleet health
 * strip at the top of the list page.
 */
export function fleetHealth(
  bikes: Bike[],
  componentsByBike: Record<string, Component[]>,
): FleetHealth {
  const alerts: FleetAlert[] = [];
  let overdue = 0;
  let dueSoon = 0;
  let ok = 0;

  for (const bike of bikes) {
    for (const c of componentsByBike[bike.id] ?? []) {
      if (c.status === 'replaced') continue;

      const pct = wearPercent(c.current_km, c.install_km, c.expected_lifespan_km);
      const band =
        c.status === 'failed'
          ? 'overdue'
          : wearBand(c.current_km, c.install_km, c.expected_lifespan_km);

      if (band === 'overdue') {
        overdue += 1;
        alerts.push(toAlert(bike, c, c.status === 'failed' ? 100 : (pct ?? 0), 'overdue'));
      } else if (band === 'danger') {
        dueSoon += 1;
        alerts.push(toAlert(bike, c, pct ?? 0, 'danger'));
      } else if (band === 'warning') {
        dueSoon += 1;
      } else if (band === 'good') {
        ok += 1;
      }
    }
  }

  alerts.sort((a, b) => b.percent - a.percent);
  return { overdue, dueSoon, ok, alerts };
}

function toAlert(
  bike: Bike,
  component: Component,
  percent: number,
  band: 'overdue' | 'danger',
): FleetAlert {
  return {
    bikeId: bike.id,
    bikeName: bike.name,
    componentId: component.id,
    componentName: component.name,
    percent: Math.round(percent),
    band,
  };
}
