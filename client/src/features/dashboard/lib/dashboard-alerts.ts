import type { Bike } from '@/features/inventory';
import type { MaintenanceSchedule } from '@/features/maintenance';
import type { Goal } from '@/features/goals';
import type { FitnessAnalysis } from '@/features/training';
import { goalProgress } from '@/features/goals';
import { activeBudgetTotal } from './metrics';

export type DashboardAlertLevel = 'critical' | 'warning' | 'info';

export interface DashboardAlert {
  /** Stable key for React lists. */
  id: string;
  level: DashboardAlertLevel;
  title: string;
  /** Short supporting line, e.g. a count or a due date. */
  detail?: string;
  /** Where the user should go to act on it. */
  href: string;
}

export interface DashboardAlertInput {
  dueSchedules: MaintenanceSchedule[];
  bikes: Bike[];
  goals: Goal[];
  fitness: FitnessAnalysis | null;
  monthlySpent: number;
  budgets: {
    amount: number;
    is_active: boolean;
    start_date: string;
    end_date: string | null;
    period: 'monthly' | 'yearly';
    category: string;
  }[];
}

const LEVEL_ORDER: Record<DashboardAlertLevel, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

/** Budget usage at or above this share of the limit is worth flagging. */
const BUDGET_WARN_RATIO = 0.9;

/**
 * Collect everything that needs the rider's attention into one ordered list.
 *
 * Warnings were previously scattered across four different widgets, so the
 * dashboard never answered "what should I do today?". This gathers them in one
 * place, ranked by severity, each pointing at the screen where it can be fixed.
 */
export function buildDashboardAlerts(
  input: DashboardAlertInput,
  today: Date = new Date(),
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  // --- Maintenance: schedules that are actually due ---
  for (const schedule of input.dueSchedules) {
    const bike = input.bikes.find((b) => b.id === schedule.bike_id);
    alerts.push({
      id: `schedule-${schedule.id}`,
      level: 'warning',
      title: schedule.task_name,
      detail: bike ? `${bike.name} · maintenance due` : 'Maintenance due',
      href: bike ? `/inventory/${bike.id}` : '/maintenance',
    });
  }

  // --- Components past their expected lifespan ---
  for (const bike of input.bikes) {
    const count = bike.maintenance_alert_count ?? 0;
    if (count > 0) {
      alerts.push({
        id: `bike-alert-${bike.id}`,
        level: 'critical',
        title: `${bike.name}: ${count} component${count === 1 ? '' : 's'} need attention`,
        detail: 'Past or near expected lifespan',
        href: `/inventory/${bike.id}`,
      });
    }
  }

  // --- Goals that are overdue ---
  for (const goal of input.goals) {
    const progress = goalProgress(goal, today);
    if (progress.health === 'overdue') {
      alerts.push({
        id: `goal-${goal.id}`,
        level: 'critical',
        title: goal.title || 'Goal',
        detail: `Overdue by ${Math.abs(progress.daysRemaining)} day${Math.abs(progress.daysRemaining) === 1 ? '' : 's'}`,
        href: '/goals',
      });
    }
  }

  // --- Budget close to or over its limit ---
  const budgetLimit = input.budgets.length > 0 ? activeBudgetTotal(input.budgets, today) : null;
  if (budgetLimit != null && budgetLimit > 0) {
    const ratio = input.monthlySpent / budgetLimit;
    if (ratio >= 1) {
      alerts.push({
        id: 'budget-over',
        level: 'critical',
        title: 'Monthly budget exceeded',
        detail: 'Spending is over the limit for this month',
        href: '/finance',
      });
    } else if (ratio >= BUDGET_WARN_RATIO) {
      alerts.push({
        id: 'budget-near',
        level: 'warning',
        title: 'Monthly budget nearly used',
        detail: `${Math.round(ratio * 100)}% of the limit spent`,
        href: '/finance',
      });
    }
  }

  // --- Coaching signals from fitness analysis ---
  for (const [index, warning] of (input.fitness?.warnings ?? []).entries()) {
    alerts.push({
      id: `fitness-${index}`,
      level: 'info',
      title: warning,
      href: '/training-plans',
    });
  }

  return alerts.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
}
