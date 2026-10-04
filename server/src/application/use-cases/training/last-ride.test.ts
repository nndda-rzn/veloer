import { describe, expect, it } from 'vitest';
import { daysSinceLastRide } from './last-ride.js';

const today = new Date('2026-10-04T00:00:00Z');

describe('daysSinceLastRide', () => {
  it('ignores strength sessions when measuring days since the last ride', () => {
    const activities = [
      { start_date: '2026-10-01T08:00:00Z', discipline: 'cycling' },
      { start_date: '2026-10-04T08:00:00Z', discipline: 'strength' },
    ];
    expect(daysSinceLastRide(activities, today)).toBe(3);
  });

  it('returns 999 when there are no rides at all', () => {
    const activities = [{ start_date: '2026-10-04T08:00:00Z', discipline: 'strength' }];
    expect(daysSinceLastRide(activities, today)).toBe(999);
  });

  it('measures from the most recent ride', () => {
    const activities = [
      { start_date: '2026-09-30T08:00:00Z', discipline: 'cycling' },
      { start_date: '2026-10-02T08:00:00Z', discipline: 'cycling' },
    ];
    expect(daysSinceLastRide(activities, today)).toBe(2);
  });
});
