import type { Activity } from '@/features/activity';
import { addDays, isoDateOnly } from '@/shared/lib/metrics';

/**
 * Average kilometres ridden per week over the last `weeks` weeks.
 * Returns null when there is no distance in the window.
 */
export function weeklyKmRate(
  activities: Activity[],
  weeks = 4,
  today: Date = new Date(),
): number | null {
  const from = isoDateOnly(addDays(today, -(weeks * 7 - 1)));
  let meters = 0;
  for (const a of activities) {
    if (a.start_date.slice(0, 10) >= from) meters += Number(a.distance) || 0;
  }
  const km = meters / 1000;
  return km > 0 ? km / weeks : null;
}

export interface WearProjection {
  /** Average km/week used for the estimate. */
  rateKmPerWeek: number;
  /** Whole weeks until the component reaches its expected lifespan. */
  weeksRemaining: number;
  /** Estimated calendar date of reaching the lifespan. */
  date: Date;
}

/**
 * Project when a component will reach the end of its expected lifespan, based
 * on the recent riding rate. Returns null when there is no rate or no lifespan.
 */
export function projectWear(
  remainingKm: number,
  rateKmPerWeek: number | null,
  today: Date = new Date(),
): WearProjection | null {
  if (rateKmPerWeek == null || rateKmPerWeek <= 0) return null;
  if (remainingKm <= 0) return null;
  const weeksRemaining = remainingKm / rateKmPerWeek;
  const date = addDays(today, Math.round(weeksRemaining * 7));
  return { rateKmPerWeek, weeksRemaining, date };
}
