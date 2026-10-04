/**
 * Narrow a fetched activity list to those that can be linked to a workout of the
 * given discipline. A strength workout can only be matched by a strength
 * session, and a cycling workout by a ride (a row without a discipline predates
 * the column and counts as cycling).
 */
export function filterLinkable<T extends { discipline?: string | null }>(
  activities: T[],
  workoutIsStrength: boolean,
): T[] {
  return activities.filter((a) =>
    workoutIsStrength ? a.discipline === 'strength' : (a.discipline ?? 'cycling') !== 'strength',
  );
}
