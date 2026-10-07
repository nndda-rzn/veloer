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
export type PlanStatus = 'active' | 'completed' | 'archived';
export type PlanGoalType = 'ftp' | 'endurance' | 'century' | 'gran_fondo' | 'custom';

/** The two training disciplines. Defined here so types do not import from lib. */
export type Discipline = 'cycling' | 'strength';

/** One entry in a strength workout's optional exercise list. */
export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  weight_kg: number | null;
}

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
  /** Aggregate workout totals, present on the list endpoint. */
  workout_count?: number;
  completed_count?: number;
}

export interface TrainingWorkout {
  id: string;
  plan_id: string;
  user_id: string;
  scheduled_date: string;
  discipline: Discipline;
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
  /** Optional strength exercise list; null for cycling. */
  exercises: WorkoutExercise[] | null;
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
  discipline?: Discipline;
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
  exercises?: WorkoutExercise[] | null;
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
  lower: 'Lower body',
  upper: 'Upper body',
  full_body: 'Full body',
  core: 'Core',
  mobility: 'Mobility',
};

export const WORKOUT_TYPE_COLORS: Record<WorkoutType, string> = {
  recovery: '#78716c',
  endurance: '#2563eb',
  tempo: '#0891b2',
  sweet_spot: '#0f6e4e',
  threshold: '#c2410c',
  vo2max: '#b91c1c',
  anaerobic: '#7c3aed',
  sprint: '#be185d',
  race: '#1c1917',
  interval: '#4f46e5',
  // Strength: one steel accent for the whole discipline (see --color-strength).
  lower: '#475569',
  upper: '#475569',
  full_body: '#475569',
  core: '#475569',
  mobility: '#475569',
};

export type TemplateKey =
  | 'BASE_BUILD_4W'
  | 'FTP_BUILDER_6W'
  | 'CENTURY_PREP_8W'
  | 'GRAN_FONDO_12W'
  | 'STRENGTH_FOCUS_4W'
  | 'BALANCED_6W'
  | 'ENDURANCE_STRENGTH_6W';

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
    title: 'Base Build · 4 Weeks',
    description: 'Progressive Z2 endurance volume. Build aerobic base with 3-4 rides/week.',
    weeks: 4,
    goal_type: 'endurance',
    workouts_per_week: 4,
    focus: 'Aerobic base',
  },
  {
    key: 'FTP_BUILDER_6W',
    title: 'FTP Builder · 6 Weeks',
    description: 'Sweet spot and threshold intervals. Designed to raise FTP progressively.',
    weeks: 6,
    goal_type: 'ftp',
    workouts_per_week: 4,
    focus: 'FTP / Threshold',
  },
  {
    key: 'CENTURY_PREP_8W',
    title: 'Century Prep · 8 Weeks',
    description: 'Build endurance for a 100-160km event. Long rides with progressive overload.',
    weeks: 8,
    goal_type: 'century',
    workouts_per_week: 4,
    focus: 'Long ride endurance',
  },
  {
    key: 'GRAN_FONDO_12W',
    title: 'Gran Fondo · 12 Weeks',
    description: 'Full periodized plan: base → build → peak → taper. Ideal for gran fondo events.',
    weeks: 12,
    goal_type: 'gran_fondo',
    workouts_per_week: 5,
    focus: 'Periodized peak performance',
  },
  {
    key: 'STRENGTH_FOCUS_4W',
    title: 'Strength Focus · 4 Weeks',
    description: 'Three lifting days plus two rides. Build strength without losing the bike.',
    weeks: 4,
    goal_type: 'custom',
    workouts_per_week: 5,
    focus: 'Strength focus',
  },
  {
    key: 'BALANCED_6W',
    title: 'Balanced · 6 Weeks',
    description: 'Two lifting days and three rides a week. Even split for general fitness.',
    weeks: 6,
    goal_type: 'custom',
    workouts_per_week: 5,
    focus: 'Balanced strength + cycling',
  },
  {
    key: 'ENDURANCE_STRENGTH_6W',
    title: 'Endurance + Strength · 6 Weeks',
    description:
      'Four rides with two lifting days. Keeps riding the priority while adding strength.',
    weeks: 6,
    goal_type: 'custom',
    workouts_per_week: 6,
    focus: 'Endurance with strength',
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
