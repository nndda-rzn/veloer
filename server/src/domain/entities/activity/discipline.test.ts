import { describe, expect, it } from 'vitest';
import { disciplineForStravaType, STRENGTH_STRAVA_TYPES } from './discipline.js';

describe('disciplineForStravaType', () => {
  it('classifies WeightTraining as strength', () => {
    expect(disciplineForStravaType('WeightTraining')).toBe('strength');
  });

  it('classifies every declared strength type as strength', () => {
    for (const type of STRENGTH_STRAVA_TYPES) {
      expect(disciplineForStravaType(type)).toBe('strength');
    }
  });

  it('classifies ride types as cycling', () => {
    expect(disciplineForStravaType('Ride')).toBe('cycling');
    expect(disciplineForStravaType('VirtualRide')).toBe('cycling');
  });

  it('classifies an unknown type as cycling', () => {
    expect(disciplineForStravaType('SomethingNew')).toBe('cycling');
  });

  it('is case-sensitive and does not guess from substrings', () => {
    expect(disciplineForStravaType('weighttraining')).toBe('cycling');
  });
});
