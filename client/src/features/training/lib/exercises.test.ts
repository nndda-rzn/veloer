import { describe, expect, it } from 'vitest';
import { cleanExercises, emptyExercise, formatExercise } from './exercises';

describe('cleanExercises', () => {
  it('returns null for an empty list (the list is optional)', () => {
    expect(cleanExercises([])).toBeNull();
  });

  it('drops rows with a blank name', () => {
    const rows = [
      { name: '  ', sets: 3, reps: 5, weight_kg: 60 },
      { name: 'Squat', sets: 5, reps: 5, weight_kg: 100 },
    ];
    expect(cleanExercises(rows)).toEqual([{ name: 'Squat', sets: 5, reps: 5, weight_kg: 100 }]);
  });

  it('returns null when every row is blank', () => {
    expect(cleanExercises([{ name: '', sets: 3, reps: 5, weight_kg: null }])).toBeNull();
  });

  it('trims the name', () => {
    const out = cleanExercises([{ name: '  Bench  ', sets: 4, reps: 8, weight_kg: 60 }]);
    expect(out?.[0].name).toBe('Bench');
  });
});

describe('formatExercise', () => {
  it('formats name, sets x reps and weight', () => {
    expect(formatExercise({ name: 'Squat', sets: 5, reps: 5, weight_kg: 100 })).toBe(
      'Squat · 5×5 · 100 kg',
    );
  });

  it('omits the weight when it is null', () => {
    expect(formatExercise({ name: 'Plank', sets: 3, reps: 1, weight_kg: null })).toBe(
      'Plank · 3×1',
    );
  });
});

describe('emptyExercise', () => {
  it('starts a blank row with sensible defaults', () => {
    expect(emptyExercise()).toEqual({ name: '', sets: 3, reps: 8, weight_kg: null });
  });
});
