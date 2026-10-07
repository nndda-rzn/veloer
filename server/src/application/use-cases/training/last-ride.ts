/** Days since the most recent cycling activity; 999 when there is none. */
export function daysSinceLastRide(
  activities: { start_date: string; discipline?: string | null }[],
  today: Date,
): number {
  let last: number | null = null;
  for (const a of activities) {
    if ((a.discipline ?? 'cycling') !== 'cycling') continue;
    const t = new Date(a.start_date.split('T')[0]).getTime();
    if (last === null || t > last) last = t;
  }
  if (last === null) return 999;
  const start = new Date(today.toISOString().split('T')[0]).getTime();
  return Math.floor((start - last) / 86_400_000);
}
