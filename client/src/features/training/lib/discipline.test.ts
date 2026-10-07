import { describe, expect, it } from 'vitest';
import { disciplineOf, isStrengthType, STRENGTH_WORKOUT_TYPES } from './discipline';

describe('disciplineOf', () => {
  it('classifies the five strength types as strength', () => {
    for (const t of STRENGTH_WORKOUT_TYPES) {
      expect(disciplineOf(t)).toBe('strength');
    }
  });

  it('classifies cycling intensity types as cycling', () => {
    expect(disciplineOf('endurance')).toBe('cycling');
    expect(disciplineOf('vo2max')).toBe('cycling');
    expect(disciplineOf('recovery')).toBe('cycling');
  });

  it('agrees with isStrengthType', () => {
    expect(isStrengthType('lower')).toBe(true);
    expect(isStrengthType('threshold')).toBe(false);
  });
});
