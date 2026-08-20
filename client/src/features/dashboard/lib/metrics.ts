const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface DateRange {
  start: string;
  end: string;
}

export function isoDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * MS_PER_DAY);
}

export function lastDaysNDays(n: number, today: Date = new Date()): DateRange {
  const end = today;
  const start = addDays(end, -(n - 1));
  return { start: isoDateOnly(start), end: isoDateOnly(end) };
}

export function monthToDate(today: Date = new Date()): DateRange {
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return { start: isoDateOnly(start), end: isoDateOnly(today) };
}

export function previousMonthRange(today: Date = new Date()): DateRange {
  const year = today.getFullYear();
  const month = today.getMonth();
  const lastMonthEnd = new Date(year, month, 0);
  const lastMonthStart = new Date(year, month - 1, 1);
  return { start: isoDateOnly(lastMonthStart), end: isoDateOnly(lastMonthEnd) };
}

export function previousRange(range: DateRange, n: number): DateRange {
  const start = new Date(range.start + 'T00:00:00');
  const previousEnd = addDays(start, -1);
  const previousStart = addDays(previousEnd, -(n - 1));
  return { start: isoDateOnly(previousStart), end: isoDateOnly(previousEnd) };
}

export interface PctChange {
  delta: number;
  percent: number | null;
}

export function pctChange(current: number, previous: number): PctChange {
  if (previous === 0) {
    return { delta: current, percent: current === 0 ? 0 : null };
  }
  return { delta: current - previous, percent: ((current - previous) / previous) * 100 };
}

export type TrendDirection = 'up' | 'down' | 'flat' | 'new';

export function trendDirection(change: PctChange): TrendDirection {
  if (change.percent === null) return 'new';
  if (change.delta > 0) return 'up';
  if (change.delta < 0) return 'down';
  return 'flat';
}

export interface DaysLeft {
  totalDays: number;
  daysRemaining: number;
  isOverdue: boolean;
}

export function daysLeft(startDate: string, endDate: string, today: Date = new Date()): DaysLeft {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1);
  const daysRemaining = Math.round((end.getTime() - today.getTime()) / MS_PER_DAY);
  return {
    totalDays,
    daysRemaining,
    isOverdue: daysRemaining < 0,
  };
}

export function requiredPerWeek(
  remainingValue: number,
  endDate: string,
  today: Date = new Date(),
): number | null {
  if (remainingValue <= 0) return null;
  const end = new Date(endDate + 'T00:00:00');
  const msPerWeek = 7 * MS_PER_DAY;
  const weeksLeft = (end.getTime() - today.getTime()) / msPerWeek;
  if (weeksLeft <= 0) return null;
  return remainingValue / weeksLeft;
}

export type FormStatus = 'fresh' | 'balanced' | 'fatigued' | 'rested';

export function formFromLoad(
  ctl: number,
  atl: number,
): { status: FormStatus; label: string; delta: number } {
  const delta = ctl - atl;
  if (ctl === 0 && atl === 0) {
    return { status: 'rested', label: 'No recent load', delta: 0 };
  }
  if (delta >= 10) return { status: 'fresh', label: 'Fresh', delta };
  if (delta >= -10) return { status: 'balanced', label: 'Balanced', delta };
  return { status: 'fatigued', label: 'Fatigued', delta };
}

type BudgetLike = {
  amount: number;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  period: 'monthly' | 'yearly';
  category: string;
};

export function activeBudgetTotal<B extends BudgetLike>(
  budgets: B[],
  today: Date = new Date(),
): number {
  const day = isoDateOnly(today);
  const totalRow = budgets.find(
    (b) => b.category === 'total' && b.is_active && budgetInRange(b, day),
  );
  if (totalRow) return totalRow.amount;

  return budgets
    .filter((b) => b.category !== 'total' && b.is_active && budgetInRange(b, day))
    .reduce((sum, b) => sum + b.amount, 0);
}

function budgetInRange<B extends BudgetLike>(budget: B, today: string): boolean {
  if (budget.start_date > today) return false;
  if (budget.end_date == null) return true;
  return budget.end_date >= today;
}
