import type { MaintenanceSchedule } from '../types/maintenance';

export type ScheduleBand = 'unscheduled' | 'ok' | 'soon' | 'due' | 'overdue';

export interface ScheduleProgress {
  band: ScheduleBand;
  /** 0..1 along the rail, or null when there is no trigger to measure against. */
  progress: number | null;
  /** Kilometres left before due; negative when overdue. Null when not km-based. */
  remainingKm: number | null;
  /** Whole days left before due; negative when overdue. Null when not date-based. */
  remainingDays: number | null;
}

/** A reminder counts as "soon" within this share of its interval. */
const SOON_RATIO = 0.15;
/** Days ahead that count as "soon" for a date-only reminder. */
const SOON_DAYS = 3;
const MS_PER_DAY = 86_400_000;

/**
 * How far along a reminder is, and which band it sits in.
 *
 * Distance is preferred over date when both are present: for a bike, wear is
 * driven by kilometres, so that is the honest measure of "how close".
 */
export function scheduleProgress(
  schedule: MaintenanceSchedule,
  currentKm: number,
  today: Date = new Date(),
): ScheduleProgress {
  const hasKm = schedule.next_due_km != null;
  const hasDate = schedule.next_due_date != null;

  if (!hasKm && !hasDate) {
    return { band: 'unscheduled', progress: null, remainingKm: null, remainingDays: null };
  }

  if (hasKm) {
    const dueKm = Number(schedule.next_due_km);
    const remainingKm = dueKm - currentKm;

    // The rail starts at the last service, or one interval back when the start
    // is unknown, so the fill still means something.
    const startKm =
      schedule.last_performed_km != null
        ? Number(schedule.last_performed_km)
        : schedule.interval_km != null
          ? dueKm - Number(schedule.interval_km)
          : currentKm;

    const span = dueKm - startKm;
    const progress = span > 0 ? clamp01((currentKm - startKm) / span) : 1;

    return {
      band: kmBand(remainingKm, schedule.interval_km),
      progress,
      remainingKm,
      remainingDays: null,
    };
  }

  const due = new Date(`${String(schedule.next_due_date).slice(0, 10)}T00:00:00Z`);
  const startOfToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const remainingDays = Math.round((due.getTime() - startOfToday.getTime()) / MS_PER_DAY);

  const intervalDays = schedule.interval_days != null ? Number(schedule.interval_days) : null;
  const startDays = schedule.last_performed_date
    ? Math.round(
        (due.getTime() -
          new Date(`${schedule.last_performed_date.slice(0, 10)}T00:00:00Z`).getTime()) /
          MS_PER_DAY,
      )
    : intervalDays;

  const progress =
    startDays != null && startDays > 0 ? clamp01((startDays - remainingDays) / startDays) : null;

  return {
    band: dateBand(remainingDays),
    progress,
    remainingKm: null,
    remainingDays,
  };
}

function kmBand(remainingKm: number, intervalKm: number | null): ScheduleBand {
  if (remainingKm < 0) return 'overdue';
  if (remainingKm === 0) return 'due';
  if (intervalKm != null && remainingKm <= Number(intervalKm) * SOON_RATIO) return 'soon';
  return 'ok';
}

function dateBand(remainingDays: number): ScheduleBand {
  if (remainingDays < 0) return 'overdue';
  if (remainingDays === 0) return 'due';
  if (remainingDays <= SOON_DAYS) return 'soon';
  return 'ok';
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
