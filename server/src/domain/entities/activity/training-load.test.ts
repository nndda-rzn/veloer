import { describe, expect, it } from 'vitest';
import { computeStrengthTss } from './training-load.js';

describe('computeStrengthTss', () => {
  it('returns null when there is no heart rate', () => {
    expect(
      computeStrengthTss({ moving_time: 3600, avg_hr: null, max_hr: null, lthr: 165 }),
    ).toBeNull();
  });

  it('returns null when there is no usable LTHR', () => {
    expect(
      computeStrengthTss({ moving_time: 3600, avg_hr: 120, max_hr: null, lthr: null }),
    ).toBeNull();
  });

  it('returns null for a zero-duration session', () => {
    expect(computeStrengthTss({ moving_time: 0, avg_hr: 120, max_hr: 180, lthr: 160 })).toBeNull();
  });

  it('uses the stored LTHR when present', () => {
    // hrIF = 160/160 = 1.0; TSS = 1h * 1^2 * 100 = 100
    expect(
      computeStrengthTss({ moving_time: 3600, avg_hr: 160, max_hr: 190, lthr: 160 }),
    ).toBeCloseTo(100, 5);
  });

  it('falls back to 88% of max HR when LTHR is absent', () => {
    // effectiveLthr = round(180 * 0.88) = 158; hrIF = 158/158 = 1.0 -> 100
    expect(
      computeStrengthTss({ moving_time: 3600, avg_hr: 158, max_hr: 180, lthr: null }),
    ).toBeCloseTo(100, 5);
  });

  it('scales with duration and intensity', () => {
    // 30 min at hrIF 0.5 -> 0.5 * 0.25 * 100 = 12.5
    expect(
      computeStrengthTss({ moving_time: 1800, avg_hr: 80, max_hr: 180, lthr: 160 }),
    ).toBeCloseTo(12.5, 5);
  });
});
