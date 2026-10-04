import type { Discipline, WorkoutType } from '../types/training';

export type { Discipline };

/** Workout types that belong to the strength discipline. */
export const STRENGTH_WORKOUT_TYPES: readonly WorkoutType[] = [
  'lower',
  'upper',
  'full_body',
  'core',
  'mobility',
];

export function isStrengthType(t: WorkoutType): boolean {
  return STRENGTH_WORKOUT_TYPES.includes(t);
}

export function disciplineOf(t: WorkoutType): Discipline {
  return isStrengthType(t) ? 'strength' : 'cycling';
}
