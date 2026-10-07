import type { WorkoutExercise } from '../types/training';

export function emptyExercise(): WorkoutExercise {
  return { name: '', sets: 3, reps: 8, weight_kg: null };
}

/** Drop blank rows and return null when nothing is left (the list is optional). */
export function cleanExercises(rows: WorkoutExercise[]): WorkoutExercise[] | null {
  const cleaned = rows.map((r) => ({ ...r, name: r.name.trim() })).filter((r) => r.name.length > 0);
  return cleaned.length > 0 ? cleaned : null;
}

export function formatExercise(e: WorkoutExercise): string {
  const base = `${e.name} · ${e.sets}×${e.reps}`;
  return e.weight_kg != null ? `${base} · ${e.weight_kg} kg` : base;
}
