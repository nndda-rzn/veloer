// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutForm } from './WorkoutForm';
import type { TrainingWorkout } from '../types/training';

function strengthWorkout(overrides: Partial<TrainingWorkout> = {}): TrainingWorkout {
  return {
    id: 'w1',
    plan_id: 'p1',
    user_id: 'u1',
    scheduled_date: '2026-10-05',
    discipline: 'strength',
    workout_type: 'full_body',
    title: 'Lower body A',
    description: null,
    target_duration_minutes: 60,
    target_tss: null,
    target_avg_power: null,
    target_avg_hr: null,
    target_cadence_min: null,
    target_cadence_max: null,
    intervals_count: null,
    interval_duration_seconds: null,
    interval_power_pct_ftp: null,
    rest_duration_seconds: null,
    rest_power_pct_ftp: null,
    exercises: [{ name: 'Squat', sets: 5, reps: 5, weight_kg: 100 }],
    status: 'planned',
    actual_activity_id: null,
    actual_tss: null,
    actual_duration_minutes: null,
    notes: null,
    rescheduled_from: null,
    completed_at: null,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

describe('WorkoutForm · strength mode', () => {
  it('hides every cycling target field when editing a strength workout', () => {
    render(<WorkoutForm workout={strengthWorkout()} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    // Cycling-only controls must not be rendered at all, so they cannot submit
    // stale power/cadence values.
    expect(screen.queryByLabelText('Power (W)')).toBeNull();
    expect(screen.queryByLabelText('Cadence min')).toBeNull();
    expect(screen.queryByLabelText('Cadence max')).toBeNull();
    expect(screen.queryByLabelText('Target TSS')).toBeNull();
    expect(screen.queryByText('Interval structure')).toBeNull();

    // The strength-specific controls are present.
    expect(screen.getByLabelText('Duration (min)')).toBeInTheDocument();
    expect(screen.getByText('Exercises')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Squat')).toBeInTheDocument();
  });

  it('submits discipline, strength type and exercises, with null cycling targets', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<WorkoutForm workout={strengthWorkout()} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.discipline).toBe('strength');
    expect(payload.workout_type).toBe('full_body');
    expect(payload.exercises).toEqual([{ name: 'Squat', sets: 5, reps: 5, weight_kg: 100 }]);
    expect(payload.target_avg_power).toBeNull();
    expect(payload.target_cadence_min).toBeNull();
    expect(payload.target_tss).toBeNull();
    expect(payload.intervals_count).toBeNull();
  });

  it('drops blank exercise rows and sends null when the list is empty', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <WorkoutForm
        workout={strengthWorkout({
          exercises: [{ name: '   ', sets: 3, reps: 8, weight_kg: null }],
        })}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(onSubmit.mock.calls[0][0].exercises).toBeNull();
  });

  it('switches to cycling and back, clearing the other discipline fields', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<WorkoutForm workout={strengthWorkout()} onSubmit={onSubmit} onCancel={vi.fn()} />);

    // Switch to cycling: cycling fields appear, exercises disappear.
    await userEvent.click(screen.getByRole('button', { name: 'Cycling' }));
    expect(screen.getByLabelText('Power (W)')).toBeInTheDocument();
    expect(screen.queryByText('Exercises')).toBeNull();

    // Switch back to strength: cycling fields are gone again.
    await userEvent.click(screen.getByRole('button', { name: 'Strength' }));
    expect(screen.queryByLabelText('Power (W)')).toBeNull();
    expect(screen.getByText('Exercises')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.discipline).toBe('strength');
    expect(payload.target_avg_power).toBeNull();
    expect(payload.exercises).toBeNull();
  });

  it('keeps cycling fields and sends exercises as null in cycling mode', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <WorkoutForm
        workout={strengthWorkout({
          discipline: 'cycling',
          workout_type: 'endurance',
          exercises: null,
        })}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Power (W)')).toBeInTheDocument();
    expect(screen.queryByText('Exercises')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.discipline).toBe('cycling');
    expect(payload.exercises).toBeNull();
  });
});
