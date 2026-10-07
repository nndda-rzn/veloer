import type { TrainingPlan } from '../types/training';

export interface PlanProgress {
  /** 1-based current week within the plan (clamped to total). */
  weekNumber: number;
  totalWeeks: number;
  /** Days remaining until the plan end date (negative = past). */
  daysRemaining: number;
  /** 0–100 completion based on workout counts. */
  percent: number;
  completed: number;
  total: number;
}

const MS_PER_WEEK = 7 * 86_400_000;

export function planProgress(plan: TrainingPlan, today: Date = new Date()): PlanProgress {
  const start = new Date(`${plan.start_date}T00:00:00`);
  const end = new Date(`${plan.end_date}T00:00:00`);
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const totalWeeks = Math.max(1, Math.round((end.getTime() - start.getTime()) / MS_PER_WEEK));
  const elapsedWeeks = Math.floor((startOfToday.getTime() - start.getTime()) / MS_PER_WEEK);
  const weekNumber = Math.min(totalWeeks, Math.max(1, elapsedWeeks + 1));
  const daysRemaining = Math.round((end.getTime() - startOfToday.getTime()) / 86_400_000);

  const total = plan.workout_count ?? 0;
  const completed = plan.completed_count ?? 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { weekNumber, totalWeeks, daysRemaining, percent, completed, total };
}

/** True when the plan is the one the rider should focus on now. */
export function isCurrentPlan(plan: TrainingPlan, today: Date = new Date()): boolean {
  if (plan.status !== 'active') return false;
  const day = today.toISOString().slice(0, 10);
  return plan.start_date <= day && plan.end_date >= day;
}
