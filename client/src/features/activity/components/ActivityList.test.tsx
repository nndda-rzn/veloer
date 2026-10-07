// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ActivityList } from './ActivityList';
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

function renderList(activities: Activity[]) {
  return render(
    <MemoryRouter>
      <ActivityList activities={activities} loading={false} />
    </MemoryRouter>,
  );
}

describe('ActivityList · strength rows', () => {
  it('does not show a distance for a strength session', () => {
    renderList([
      activity({
        id: 's1',
        name: 'Lower body',
        type: 'WeightTraining',
        discipline: 'strength',
        distance: null,
      }),
    ]);

    // The row must never claim "0.0 km" for a session that has no distance,
    // nor a speed, which it also does not have.
    expect(screen.queryByText(/0\.0 km/)).toBeNull();
    expect(screen.queryByText(/km\/h/)).toBeNull();
    // Duration is still shown.
    expect(screen.getAllByText(/1h 0m/).length).toBeGreaterThan(0);
  });

  it('shows the distance for a ride', () => {
    renderList([activity({ id: 'r1', name: 'Morning ride', distance: 10000 })]);
    expect(screen.getAllByText('10.0 km').length).toBeGreaterThan(0);
  });
});
