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
  | 'interval';

export type WorkoutStatus = 'planned' | 'completed' | 'skipped' | 'missed';

export interface TrainingWorkout {
  id: string;
  plan_id: string;
  user_id: string;
  scheduled_date: string; // ISO date
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
> & {
  status?: WorkoutStatus;
  rescheduled_from?: string | null;
};
