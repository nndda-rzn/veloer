/**
 * Cycling hours inside a set of days. Strength sessions are excluded: the
 * recommendation engine gates its intensity prescriptions on weekly cycling
 * hours, so a gym session must not push the rider past that gate.
 */
export function cyclingWeeklyHours(
  activities: { start_date: string; moving_time: number; discipline?: string | null }[],
  windowDates: string[],
): number {
  const window = new Set(windowDates);
  let seconds = 0;
  for (const a of activities) {
    if ((a.discipline ?? 'cycling') !== 'cycling') continue;
    if (!window.has(a.start_date.split('T')[0])) continue;
    seconds += a.moving_time;
  }
  return seconds / 3600;
}
