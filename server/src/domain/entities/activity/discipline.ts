/** The two training disciplines Veloer tracks. */
export type Discipline = 'cycling' | 'strength';

/**
 * Strava activity types treated as strength training. Kept as a list so the
 * mapping is one edit when Strava adds another lifting type.
 */
export const STRENGTH_STRAVA_TYPES: readonly string[] = ['WeightTraining', 'Workout', 'Crossfit'];

/**
 * Map a Strava activity type to a discipline. Anything not listed is cycling,
 * which keeps the default behaviour identical to before this change.
 */
export function disciplineForStravaType(type: string): Discipline {
  return STRENGTH_STRAVA_TYPES.includes(type) ? 'strength' : 'cycling';
}
