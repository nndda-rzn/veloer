import type { Activity } from '../types/activity';
import { addDays, isoDateOnly } from '@/shared/lib/metrics';

export interface WeeklyVolume {
  /** ISO date (YYYY-MM-DD) of the Monday starting the week. */
  weekStart: string;
  /** Short label, e.g. "12 May". */
  label: string;
  distance: number;
  count: number;
}

/** Monday 00:00 of the week containing `date`. */
function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  return addDays(d, -day);
}

/**
 * Bucket activities into the last `weeks` calendar weeks (Monday-based),
 * oldest first. Weeks with no rides are included as zeros so the sparkline
 * keeps a steady rhythm.
 */
export function weeklyVolume(
  activities: Activity[],
  weeks = 12,
  today: Date = new Date(),
): WeeklyVolume[] {
  const thisWeek = startOfWeek(today);
  const buckets: WeeklyVolume[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = addDays(thisWeek, -7 * i);
    const startIso = isoDateOnly(weekStart);
    const endIso = isoDateOnly(addDays(weekStart, 6));

    const inWeek = activities.filter((a) => {
      const day = a.start_date.slice(0, 10);
      return day >= startIso && day <= endIso;
    });

    buckets.push({
      weekStart: startIso,
      label: weekStart.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      distance: inWeek.reduce((sum, a) => sum + (Number(a.distance) || 0), 0),
      count: inWeek.length,
    });
  }

  return buckets;
}
