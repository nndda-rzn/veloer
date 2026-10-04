import { describe, expect, it } from 'vitest';
import { isStrength } from './discipline';

describe('isStrength', () => {
  it('is true for a strength session', () => {
    expect(isStrength({ discipline: 'strength' })).toBe(true);
  });

  it('is false for a cycling session', () => {
    expect(isStrength({ discipline: 'cycling' })).toBe(false);
  });

  it('treats a row with no discipline as cycling (pre-PR data)', () => {
    expect(isStrength({})).toBe(false);
  });
});
