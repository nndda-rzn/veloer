import type { Discipline } from '../activity/discipline.js';

export type WorkoutType =
  | 'recovery'
  | 'endurance'
  | 'tempo'
  | 'sweet_spot'
  | 'threshold'
  | 'vo2max'
  | 'anaerobic'
  | 'sprint'
  | 'race'
  | 'interval'
  | 'lower'
  | 'upper'
  | 'full_body'
  | 'core'
  | 'mobility';

export type WorkoutStatus = 'planned' | 'completed' | 'skipped' | 'missed';

/** One entry in a strength workout's optional exercise list. */
export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  weight_kg: number | null;
}

export interface TrainingWorkout {
  id: string;
  plan_id: string;
  user_id: string;
  scheduled_date: string; // ISO date
  discipline: Discipline;
  workout_type: WorkoutType;
  title: string;
  description: string | null;
  // Target metrics
  target_duration_minutes: number | null;
  target_tss: number | null;
  target_avg_power: number | null;
  target_avg_hr: number | null;
  target_cadence_min: number | null;
  target_cadence_max: number | null;
  // Interval structure (null if not an interval workout)
  intervals_count: number | null;
  interval_duration_seconds: number | null;
  interval_power_pct_ftp: number | null;
  rest_duration_seconds: number | null;
  rest_power_pct_ftp: number | null;
  // Optional strength exercise list (null for cycling)
  exercises: WorkoutExercise[] | null;
  // Completion tracking
  status: WorkoutStatus;
  actual_activity_id: string | null;
  actual_tss: number | null;
  actual_duration_minutes: number | null;
  notes: string | null;
  rescheduled_from: string | null; // ISO date
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type TrainingWorkoutCreateData = Omit<
  TrainingWorkout,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'status'
  | 'actual_activity_id'
  | 'actual_tss'
  | 'actual_duration_minutes'
  | 'completed_at'
  | 'rescheduled_from'
  | 'discipline'
  | 'exercises'
> & {
  status?: WorkoutStatus;
  rescheduled_from?: string | null;
  /** Defaults to 'cycling' at insert when omitted. */
  discipline?: Discipline;
  exercises?: WorkoutExercise[] | null;
};
