import { lifespanStatus } from '@/shared/lib/utils';

export type LifespanStatus = ReturnType<typeof lifespanStatus>;

/** Bar fill for a lifespan progress track. */
export const lifespanBar: Record<LifespanStatus, string> = {
  good: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-orange-500',
  overdue: 'bg-red-600',
};

/** Text colour for a lifespan percentage label. */
export const lifespanText: Record<LifespanStatus, string> = {
  good: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-orange-700',
  overdue: 'text-red-700',
};

/**
 * Kilometres accumulated since the component was installed.
 *
 * Components carry two odometer readings: `installKm` (bike km at install) and
 * `currentKm` (bike km now). Wear is the difference, never the raw odometer.
 */
export function wearKm(currentKm: number, installKm: number): number {
  return Math.max(0, currentKm - installKm);
}

/**
 * Wear as a percentage of the expected lifespan, capped at 100.
 * Returns null when no lifespan is configured.
 */
export function wearPercent(
  currentKm: number,
  installKm: number,
  expectedLifespanKm: number | null,
): number | null {
  if (!expectedLifespanKm || expectedLifespanKm <= 0) return null;
  return Math.min(100, (wearKm(currentKm, installKm) / expectedLifespanKm) * 100);
}

/**
 * Kilometres left before the component reaches its expected lifespan.
 * Negative when already overdue. Null when no lifespan is configured.
 */
export function remainingKm(
  currentKm: number,
  installKm: number,
  expectedLifespanKm: number | null,
): number | null {
  if (!expectedLifespanKm || expectedLifespanKm <= 0) return null;
  return expectedLifespanKm - wearKm(currentKm, installKm);
}

/** Progress-bar fill colour for a component, based on its wear. */
export function lifespanBarColor(
  currentKm: number,
  installKm: number,
  expectedLifespanKm: number | null,
): string {
  const pct = wearPercent(currentKm, installKm, expectedLifespanKm);
  if (pct === null) return 'bg-emerald-500';
  return lifespanBar[lifespanStatus(pct)];
}

/** Text colour for a component's wear percentage. */
export function lifespanTextColor(
  currentKm: number,
  installKm: number,
  expectedLifespanKm: number | null,
): string {
  const pct = wearPercent(currentKm, installKm, expectedLifespanKm);
  if (pct === null) return 'text-muted-foreground';
  return lifespanText[lifespanStatus(pct)];
}
