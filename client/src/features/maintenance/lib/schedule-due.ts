import type { MaintenanceSchedule } from '../types/maintenance';

export interface NextDue {
  next_due_km: number | null;
  next_due_date: string | null;
}

/**
 * Where the next service falls, given the one just performed.
 *
 * Both triggers advance from the service that actually happened, not from the
 * old due values: if a rider services late, the next interval starts from today,
 * which is what a real maintenance schedule does.
 */
export function nextDueFrom(
  schedule: MaintenanceSchedule,
  performedKm: number,
  performedDate: string,
): NextDue {
  const intervalKm = schedule.interval_km != null ? Number(schedule.interval_km) : null;
  const intervalDays = schedule.interval_days != null ? Number(schedule.interval_days) : null;

  return {
    next_due_km: intervalKm != null ? performedKm + intervalKm : null,
    next_due_date: intervalDays != null ? addDays(performedDate, intervalDays) : null,
  };
}

/**
 * Add whole days to an ISO date (YYYY-MM-DD). Works in UTC so a timezone offset
 * cannot shift the resulting day.
 */
function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}
