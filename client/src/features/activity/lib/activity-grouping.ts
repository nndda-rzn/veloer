import type { Activity } from '../types/activity';
import { addDays, isoDateOnly } from '@/shared/lib/metrics';

export interface ActivityGroup {
  key: string;
  label: string;
  activities: Activity[];
}

/**
 * Group activities into relative date buckets: Today, Yesterday, This week,
 * Earlier. Assumes `activities` are already sorted newest first.
 */
export function groupByRelativeDate(
  activities: Activity[],
  today: Date = new Date(),
): ActivityGroup[] {
  const todayIso = isoDateOnly(today);
  const yesterdayIso = isoDateOnly(addDays(today, -1));
  const weekStartIso = isoDateOnly(addDays(today, -((today.getDay() + 6) % 7)));

  const buckets: ActivityGroup[] = [
    { key: 'today', label: 'Today', activities: [] },
    { key: 'yesterday', label: 'Yesterday', activities: [] },
    { key: 'week', label: 'This week', activities: [] },
    { key: 'earlier', label: 'Earlier', activities: [] },
  ];
  const [todayG, yesterdayG, weekG, earlierG] = buckets;

  for (const a of activities) {
    const day = a.start_date.slice(0, 10);
    if (day === todayIso) todayG.activities.push(a);
    else if (day === yesterdayIso) yesterdayG.activities.push(a);
    else if (day >= weekStartIso) weekG.activities.push(a);
    else earlierG.activities.push(a);
  }

  return buckets.filter((b) => b.activities.length > 0);
}

export type TssTone = 'light' | 'moderate' | 'hard' | 'veryHard';

/** Rough training-stress buckets, aligned with common TSS bands. */
export function tssTone(tss: number): TssTone {
  if (tss < 100) return 'light';
  if (tss < 200) return 'moderate';
  if (tss < 300) return 'hard';
  return 'veryHard';
}

export const tssToneClass: Record<TssTone, string> = {
  light: 'bg-secondary text-muted-foreground',
  moderate: 'bg-emerald-50 text-emerald-800',
  hard: 'bg-amber-50 text-amber-800',
  veryHard: 'bg-red-50 text-red-700',
};
