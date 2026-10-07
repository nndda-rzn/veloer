import type { Goal } from '../types/goal';

export const GOAL_TYPE_LABELS: Record<Goal['type'], string> = {
  distance: 'Distance',
  time: 'Time',
  elevation: 'Elevation',
  activities_count: 'Activities',
};

export const GOAL_PERIOD_LABELS: Record<Goal['period'], string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  custom: 'Custom',
};

export const GOAL_STATUS_VARIANTS: Record<
  Goal['status'],
  'info' | 'success' | 'danger' | 'neutral'
> = {
  active: 'info',
  completed: 'success',
  failed: 'danger',
  cancelled: 'neutral',
};

export type GoalHealth = 'on_track' | 'behind' | 'complete' | 'overdue' | 'inactive';

export interface GoalProgress {
  /** Completion percentage, clamped to 0–100. */
  percent: number;
  /** Raw remaining value (never negative). */
  remaining: number;
  /** Days remaining until the deadline (negative = overdue). */
  daysRemaining: number;
  /** Value still needed per week to hit the target on time (null if done/overdue). */
  perWeek: number | null;
  health: GoalHealth;
}

const MS_PER_DAY = 86_400_000;

/**
 * Derive progress, pace and health for a goal so the UI can show more than a
 * bare percentage: how much is left, whether the rider is on pace, and how
 * many days remain.
 */
export function goalProgress(goal: Goal, today: Date = new Date()): GoalProgress {
  const target = goal.target_value || 0;
  const current = goal.current_value || 0;
  const remaining = Math.max(0, target - current);
  const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  const end = new Date(`${goal.end_date}T00:00:00`);
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  const daysRemaining = Math.round((end.getTime() - startOfToday.getTime()) / MS_PER_DAY);

  const complete = goal.status === 'completed' || remaining <= 0;

  let perWeek: number | null = null;
  if (!complete && daysRemaining > 0 && remaining > 0) {
    const weeksLeft = daysRemaining / 7;
    perWeek = weeksLeft > 0 ? remaining / weeksLeft : null;
  }

  let health: GoalHealth;
  if (goal.status === 'cancelled' || goal.status === 'failed') health = 'inactive';
  else if (complete) health = 'complete';
  else if (daysRemaining < 0) health = 'overdue';
  else {
    // On pace if progress keeps up with elapsed time.
    const start = new Date(`${goal.start_date}T00:00:00`);
    const total = Math.max(1, end.getTime() - start.getTime());
    const elapsed = Math.min(1, Math.max(0, (startOfToday.getTime() - start.getTime()) / total));
    health = percent >= elapsed * 100 - 5 ? 'on_track' : 'behind';
  }

  return { percent, remaining, daysRemaining, perWeek, health };
}

export const GOAL_HEALTH_LABELS: Record<GoalHealth, string> = {
  on_track: 'On track',
  behind: 'Behind',
  complete: 'Complete',
  overdue: 'Overdue',
  inactive: 'Inactive',
};

export const GOAL_HEALTH_TONE: Record<GoalHealth, string> = {
  on_track: 'text-success',
  behind: 'text-warning',
  complete: 'text-success',
  overdue: 'text-danger',
  inactive: 'text-muted-foreground',
};

export interface GoalSummary {
  total: number;
  onTrack: number;
  behind: number;
  complete: number;
  overdue: number;
}

/** Count active goals by health for the page summary strip. */
export function summarizeGoals(goals: Goal[]): GoalSummary {
  const summary: GoalSummary = {
    total: goals.length,
    onTrack: 0,
    behind: 0,
    complete: 0,
    overdue: 0,
  };
  for (const goal of goals) {
    const { health } = goalProgress(goal);
    if (health === 'on_track') summary.onTrack++;
    else if (health === 'behind') summary.behind++;
    else if (health === 'complete') summary.complete++;
    else if (health === 'overdue') summary.overdue++;
  }
  return summary;
}

/**
 * Project when the goal will be reached at the current average pace
 * (current_value accrued since start_date). Returns null when there is not
 * enough data or the goal is already complete.
 */
export function projectedCompletion(goal: Goal, today: Date = new Date()): Date | null {
  if (goal.current_value <= 0) return null;
  if (goal.current_value >= goal.target_value) return null;

  const start = new Date(`${goal.start_date}T00:00:00`);
  const elapsedDays = Math.max(1, Math.round((today.getTime() - start.getTime()) / 86_400_000));
  const perDay = goal.current_value / elapsedDays;
  if (perDay <= 0) return null;

  const remaining = goal.target_value - goal.current_value;
  const daysNeeded = Math.ceil(remaining / perDay);
  const projected = new Date(today);
  projected.setDate(projected.getDate() + daysNeeded);
  return projected;
}
