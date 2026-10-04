import { describe, expect, it } from 'vitest';
import { cyclingWeeklyHours } from './weekly-hours.js';

const windowDates = ['2026-10-01', '2026-10-02', '2026-10-03'];

describe('cyclingWeeklyHours', () => {
  it('excludes strength sessions from weekly cycling hours', () => {
    const activities = [
      { start_date: '2026-10-01T08:00:00Z', moving_time: 3600, discipline: 'cycling' },
      { start_date: '2026-10-02T08:00:00Z', moving_time: 3600, discipline: 'strength' },
    ];
    expect(cyclingWeeklyHours(activities, windowDates)).toBe(1);
  });

  it('sums cycling hours inside the window only', () => {
    const activities = [
      { start_date: '2026-10-01T08:00:00Z', moving_time: 5400, discipline: 'cycling' },
      { start_date: '2026-09-20T08:00:00Z', moving_time: 3600, discipline: 'cycling' },
    ];
    expect(cyclingWeeklyHours(activities, windowDates)).toBe(1.5);
  });

  it('treats a missing discipline as cycling', () => {
    const activities = [{ start_date: '2026-10-01T08:00:00Z', moving_time: 7200 }];
    expect(cyclingWeeklyHours(activities, windowDates)).toBe(2);
  });
});
