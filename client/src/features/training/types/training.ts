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
export type PlanStatus = 'active' | 'completed' | 'archived';
export type PlanGoalType = 'ftp' | 'endurance' | 'century' | 'gran_fondo' | 'custom';

export interface TrainingPlan {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_type: PlanGoalType;
  start_date: string;
  end_date: string;
  ftp_baseline: number;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
}

export interface TrainingWorkout {
  id: string;
  plan_id: string;
  user_id: string;
  scheduled_date: string;
  workout_type: WorkoutType;
  title: string;
  description: string | null;
  target_duration_minutes: number | null;
  target_tss: number | null;
  target_avg_power: number | null;
  target_avg_hr: number | null;
  target_cadence_min: number | null;
  target_cadence_max: number | null;
  intervals_count: number | null;
  interval_duration_seconds: number | null;
  interval_power_pct_ftp: number | null;
  rest_duration_seconds: number | null;
  rest_power_pct_ftp: number | null;
  status: WorkoutStatus;
  actual_activity_id: string | null;
  actual_tss: number | null;
  actual_duration_minutes: number | null;
  notes: string | null;
  rescheduled_from: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingPlanFormData {
  title: string;
  description?: string | null;
  goal_type: PlanGoalType;
  start_date: string;
  end_date: string;
  ftp_baseline: number;
}

export interface WorkoutFormData {
  scheduled_date: string;
  workout_type: WorkoutType;
  title: string;
  description?: string | null;
  target_duration_minutes?: number | null;
  target_tss?: number | null;
  target_avg_power?: number | null;
  target_avg_hr?: number | null;
  target_cadence_min?: number | null;
  target_cadence_max?: number | null;
  intervals_count?: number | null;
  interval_duration_seconds?: number | null;
  interval_power_pct_ftp?: number | null;
  rest_duration_seconds?: number | null;
  rest_power_pct_ftp?: number | null;
  notes?: string | null;
}

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  recovery: 'Recovery',
  endurance: 'Endurance',
  tempo: 'Tempo',
  sweet_spot: 'Sweet Spot',
  threshold: 'Threshold',
  vo2max: 'VO2 Max',
  anaerobic: 'Anaerobic',
  sprint: 'Sprint',
  race: 'Race',
  interval: 'Interval',
};

export const WORKOUT_TYPE_COLORS: Record<WorkoutType, string> = {
  recovery: '#64748b',
  endurance: '#3b82f6',
  tempo: '#eab308',
  sweet_spot: '#f59e0b',
  threshold: '#f97316',
  vo2max: '#ef4444',
  anaerobic: '#8b5cf6',
  sprint: '#ec4899',
  race: '#111827',
  interval: '#6366f1',
};

export const PLAN_GOAL_TYPE_LABELS: Record<PlanGoalType, string> = {
  ftp: 'FTP Builder',
  endurance: 'Endurance',
  century: 'Century Prep',
  gran_fondo: 'Gran Fondo',
  custom: 'Custom',
};
