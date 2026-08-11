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

export type TemplateKey = 'BASE_BUILD_4W' | 'FTP_BUILDER_6W' | 'CENTURY_PREP_8W' | 'GRAN_FONDO_12W';

export interface TemplateInfo {
  key: TemplateKey;
  title: string;
  description: string;
  weeks: number;
  goal_type: PlanGoalType;
  workouts_per_week: number;
  focus: string;
}

export const TEMPLATE_LIST: TemplateInfo[] = [
  {
    key: 'BASE_BUILD_4W',
    title: 'Base Build — 4 Weeks',
    description: 'Progressive Z2 endurance volume. Build aerobic base with 3-4 rides/week.',
    weeks: 4,
    goal_type: 'endurance',
    workouts_per_week: 4,
    focus: 'Aerobic base',
  },
  {
    key: 'FTP_BUILDER_6W',
    title: 'FTP Builder — 6 Weeks',
    description: 'Sweet spot and threshold intervals. Designed to raise FTP progressively.',
    weeks: 6,
    goal_type: 'ftp',
    workouts_per_week: 4,
    focus: 'FTP / Threshold',
  },
  {
    key: 'CENTURY_PREP_8W',
    title: 'Century Prep — 8 Weeks',
    description: 'Build endurance for a 100-160km event. Long rides with progressive overload.',
    weeks: 8,
    goal_type: 'century',
    workouts_per_week: 4,
    focus: 'Long ride endurance',
  },
  {
    key: 'GRAN_FONDO_12W',
    title: 'Gran Fondo — 12 Weeks',
    description: 'Full periodized plan: base → build → peak → taper. Ideal for gran fondo events.',
    weeks: 12,
    goal_type: 'gran_fondo',
    workouts_per_week: 5,
    focus: 'Periodized peak performance',
  },
];

export const PLAN_GOAL_TYPE_LABELS: Record<PlanGoalType, string> = {
  ftp: 'FTP Builder',
  endurance: 'Endurance',
  century: 'Century Prep',
  gran_fondo: 'Gran Fondo',
  custom: 'Custom',
};

export interface RecommendationMetrics {
  ctl: number;
  atl: number;
  tsb: number;
  weekly_tss: number;
  weekly_hours: number;
  days_since_last_ride: number;
  consecutive_days: number;
}

export interface WorkoutRecommendation {
  workout_type: WorkoutType;
  title: string;
  description: string;
  reason: string;
  target_duration_minutes: number;
  target_tss: number;
  target_avg_power: number | null;
  target_avg_hr: number | null;
  intervals?: {
    count: number;
    duration_seconds: number;
    power_pct_ftp: number;
    rest_seconds: number;
    rest_pct_ftp: number;
  };
  metrics: RecommendationMetrics;
}

export type FitnessAnalysisConfidence = 'high' | 'low' | 'none';

export interface FitnessAnalysis {
  estimated_ftp: number;
  ftp_confidence: FitnessAnalysisConfidence;
  avg_weekly_hours: number;
  avg_weekly_tss: number;
  ctl: number;
  activity_count: number;
  suggested_template: TemplateKey;
  suggested_ftp_baseline: number;
  warnings: string[];
}

export interface TrainingLoadDataPoint {
  date: string;
  tss: number;
  ctl: number;
  atl: number;
}

export interface WeeklyBreakdown {
  week: string;
  planned_tss: number;
  actual_tss: number;
  completed: number;
  total: number;
}

export interface PlanRetrospective {
  plan: TrainingPlan;
  summary: {
    total_workouts: number;
    completed: number;
    skipped: number;
    missed: number;
    completion_rate: number;
    planned_tss_total: number;
    actual_tss_total: number;
    tss_compliance: number;
    planned_hours_total: number;
    actual_hours_total: number;
    ftp_change: number | null;
  };
  weekly_breakdown: WeeklyBreakdown[];
}
