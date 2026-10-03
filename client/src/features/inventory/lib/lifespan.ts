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

export function lifespanBarColor(currentKm: number, expectedLifespanKm: number | null): string {
  if (!expectedLifespanKm || expectedLifespanKm === 0) return 'bg-emerald-500';
  const pct = Math.min(100, (currentKm / expectedLifespanKm) * 100);
  return lifespanBar[lifespanStatus(pct)];
}
