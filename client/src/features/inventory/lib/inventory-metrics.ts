import type { Bike, Component } from '../types/inventory';
import { wearKm, wearPercent } from './lifespan';

/** Cost per kilometre in IDR, or null when price or distance is unknown. */
export function costPerKm(purchasePrice: number | null, currentKm: number): number | null {
  if (purchasePrice == null || purchasePrice <= 0) return null;
  if (currentKm <= 0) return null;
  return purchasePrice / currentKm;
}

export interface GearSummary {
  activeCount: number;
  totalCount: number;
  totalKm: number;
  /** Sum of purchase price across bikes that have one recorded. */
  totalValue: number;
  /** Bikes with at least one maintenance alert. */
  bikesWithAlerts: number;
}

export function summarizeGear(bikes: Bike[]): GearSummary {
  let totalKm = 0;
  let totalValue = 0;
  let activeCount = 0;
  let bikesWithAlerts = 0;

  for (const b of bikes) {
    totalKm += Number(b.current_km) || 0;
    if (b.purchase_price != null) totalValue += Number(b.purchase_price) || 0;
    if (b.status === 'active') activeCount += 1;
    if ((b.maintenance_alert_count ?? 0) > 0) bikesWithAlerts += 1;
  }

  return {
    activeCount,
    totalCount: bikes.length,
    totalKm,
    totalValue,
    bikesWithAlerts,
  };
}

export type WearBand = 'good' | 'warning' | 'danger' | 'overdue' | 'unknown';

/** Band a component falls into based on how much of its lifespan it has used. */
export function wearBand(
  currentKm: number,
  installKm: number,
  expectedLifespanKm: number | null,
): WearBand {
  const pct = wearPercent(currentKm, installKm, expectedLifespanKm);
  if (pct === null) return 'unknown';
  if (pct >= 100) return 'overdue';
  if (pct >= 90) return 'danger';
  if (pct >= 70) return 'warning';
  return 'good';
}

export interface WearSummary {
  total: number;
  overdue: number;
  /** Components at or past 90% of their expected lifespan. */
  dueSoon: number;
}

export function summarizeWear(components: Component[]): WearSummary {
  let overdue = 0;
  let dueSoon = 0;

  for (const c of components) {
    if (c.status === 'replaced') continue;
    const band = wearBand(c.current_km, c.install_km, c.expected_lifespan_km);
    if (band === 'overdue') overdue += 1;
    else if (band === 'danger') dueSoon += 1;
  }

  return { total: components.length, overdue, dueSoon };
}

/** Components sorted by remaining lifespan ascending (most worn first). */
export function sortByWear(components: Component[]): Component[] {
  return [...components].sort((a, b) => {
    const pa = wearPercent(a.current_km, a.install_km, a.expected_lifespan_km) ?? -1;
    const pb = wearPercent(b.current_km, b.install_km, b.expected_lifespan_km) ?? -1;
    return pb - pa;
  });
}

export { wearKm };
