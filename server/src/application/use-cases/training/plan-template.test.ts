import { describe, expect, it } from 'vitest';
import { buildWorkoutPayload, getWeeklyPattern } from './GeneratePlanFromTemplate.js';

const MIXED = ['STRENGTH_FOCUS_4W', 'BALANCED_6W', 'ENDURANCE_STRENGTH_6W'] as const;

describe('mixed templates', () => {
  it.each(MIXED)('%s has both disciplines every week', (key) => {
    const week = getWeeklyPattern(key, 1);
    expect(week.some((p) => p.discipline === 'strength')).toBe(true);
    expect(week.some((p) => p.discipline === 'cycling')).toBe(true);
  });

  it.each(MIXED)('%s strength sessions carry exercises and no cycling targets', (key) => {
    for (let week = 1; week <= 6; week++) {
      for (const p of getWeeklyPattern(key, week)) {
        if (p.discipline !== 'strength') continue;
        expect(p.tss).toBeNull();
        expect(p.exercises && p.exercises.length).toBeGreaterThan(0);
        expect(p.intervals_count ?? null).toBeNull();
      }
    }
  });

  it('progresses strength sets across the cycle and deloads on week 4', () => {
    const w1 = getWeeklyPattern('STRENGTH_FOCUS_4W', 1).find((p) => p.discipline === 'strength');
    const w3 = getWeeklyPattern('STRENGTH_FOCUS_4W', 3).find((p) => p.discipline === 'strength');
    const w4 = getWeeklyPattern('STRENGTH_FOCUS_4W', 4).find((p) => p.discipline === 'strength');
    const sets = (p?: { exercises?: { sets: number }[] | null }) =>
      (p?.exercises ?? []).reduce((s, e) => s + e.sets, 0);
    expect(sets(w3)).toBeGreaterThan(sets(w1));
    expect(sets(w4)).toBeLessThan(sets(w3));
  });

  it('keeps cycling sessions unchanged', () => {
    const p = getWeeklyPattern('BASE_BUILD_4W', 1);
    expect(p.every((x) => x.discipline === 'cycling')).toBe(true);
    expect(p.every((x) => typeof x.tss === 'number')).toBe(true);
  });
});

describe('buildWorkoutPayload', () => {
  it('never writes cycling targets onto a strength workout', () => {
    const p = getWeeklyPattern('BALANCED_6W', 1).find((x) => x.discipline === 'strength')!;
    const payload = buildWorkoutPayload('plan', 'user', '2026-10-05', p, 250);
    expect(payload.discipline).toBe('strength');
    expect(payload.target_avg_power).toBeNull();
    expect(payload.target_cadence_min).toBeNull();
    expect(payload.target_cadence_max).toBeNull();
    expect(payload.target_tss).toBeNull();
    expect(payload.intervals_count).toBeNull();
    expect(payload.exercises && payload.exercises.length).toBeGreaterThan(0);
  });

  it('still writes cycling targets onto a ride', () => {
    const p = getWeeklyPattern('BALANCED_6W', 1).find((x) => x.discipline === 'cycling')!;
    const payload = buildWorkoutPayload('plan', 'user', '2026-10-05', p, 250);
    expect(payload.discipline).toBe('cycling');
    expect(payload.target_cadence_min).toBe(85);
    expect(payload.target_cadence_max).toBe(95);
    expect(payload.exercises).toBeNull();
  });
});
