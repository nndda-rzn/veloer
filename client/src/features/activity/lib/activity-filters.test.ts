import { describe, expect, it } from 'vitest';
import { ALL, filterActivities, summarizeActivities, type ActivityQuery } from './activity-filters';
import type { Activity } from '../types/activity';

function activity(overrides: Partial<Activity>): Activity {
  return {
    id: 'a1',
    user_id: 'u1',
    strava_id: 1,
    name: 'Session',
    type: 'Ride',
    discipline: 'cycling',
    start_date: '2026-10-01T08:00:00Z',
    distance: 10000,
    moving_time: 3600,
    elapsed_time: 3600,
    total_elevation_gain: 100,
    avg_speed: 5,
    max_speed: 8,
    avg_hr: 140,
    max_hr: 170,
    polyline: null,
    bike_id: null,
    avg_cadence: 85,
    max_cadence: 100,
    avg_watts: 200,
    max_watts: 400,
    weighted_avg_watts: 210,
    kilojoules: 500,
    device_watts: true,
    avg_temp: 20,
    calories: 600,
    elev_high: 200,
    elev_low: 100,
    tss: 80,
    created_at: '2026-10-01T09:00:00Z',
    updated_at: '2026-10-01T09:00:00Z',
    ...overrides,
  };
}

const baseQuery: ActivityQuery = {
  preset: 'all',
  range: { start: '', end: '' },
  type: ALL,
  bikeId: ALL,
  discipline: ALL,
};

describe('summarizeActivities', () => {
  it('counts cycling only, ignoring strength sessions', () => {
    const rows = [
      activity({ id: 'r1', discipline: 'cycling', distance: 10000 }),
      activity({ id: 's1', discipline: 'strength', distance: null, type: 'WeightTraining' }),
    ];
    const summary = summarizeActivities(rows);
    expect(summary.distance).toBe(10000);
    expect(summary.count).toBe(1);
  });

  it('sums two rides', () => {
    const rows = [activity({ id: 'r1', distance: 10000 }), activity({ id: 'r2', distance: 5000 })];
    const summary = summarizeActivities(rows);
    expect(summary.distance).toBe(15000);
    expect(summary.count).toBe(2);
  });

  it('reports zero for a range with only strength sessions', () => {
    const rows = [activity({ discipline: 'strength', distance: null, type: 'WeightTraining' })];
    const summary = summarizeActivities(rows);
    expect(summary.distance).toBe(0);
    expect(summary.count).toBe(0);
  });

  it('treats a pre-PR row (no discipline) as cycling', () => {
    const rows = [activity({ discipline: undefined, distance: 8000 })];
    expect(summarizeActivities(rows).count).toBe(1);
  });
});

describe('filterActivities · discipline', () => {
  const rows = [
    activity({ id: 'r1', discipline: 'cycling' }),
    activity({ id: 's1', discipline: 'strength', type: 'WeightTraining' }),
  ];

  it('returns only strength rows when filtering strength', () => {
    const out = filterActivities(rows, { ...baseQuery, discipline: 'strength' });
    expect(out.rows.map((r) => r.id)).toEqual(['s1']);
  });

  it('returns only cycling rows when filtering cycling', () => {
    const out = filterActivities(rows, { ...baseQuery, discipline: 'cycling' });
    expect(out.rows.map((r) => r.id)).toEqual(['r1']);
  });

  it('returns everything for ALL', () => {
    const out = filterActivities(rows, baseQuery);
    expect(out.rows).toHaveLength(2);
  });

  it('includes a pre-PR row (no discipline) in the cycling filter', () => {
    const withLegacy = [activity({ id: 'legacy', discipline: undefined })];
    const out = filterActivities(withLegacy, { ...baseQuery, discipline: 'cycling' });
    expect(out.rows.map((r) => r.id)).toEqual(['legacy']);
  });
});
