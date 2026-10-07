import { describe, expect, it } from 'vitest';
import { isCycling } from './cycling-filter.js';

describe('isCycling', () => {
  it('treats an explicit cycling row as cycling', () => {
    expect(isCycling({ discipline: 'cycling' })).toBe(true);
  });

  it('treats a strength row as not cycling', () => {
    expect(isCycling({ discipline: 'strength' })).toBe(false);
  });

  it('treats a missing discipline (pre-migration row) as cycling', () => {
    expect(isCycling({})).toBe(true);
  });
});
