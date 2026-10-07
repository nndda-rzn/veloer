// Date/range/trend math lives in shared so any feature can reuse it.
// Budget-specific helpers stay here because they only concern the dashboard.
export {
  addDays,
  daysLeft,
  formFromLoad,
  inRange,
  isoDateOnly,
  lastDaysNDays,
  monthToDate,
  pctChange,
  previousMonthRange,
  previousRange,
  rangeDays,
  requiredPerWeek,
  trendDirection,
  yearToDate,
  type DateRange,
  type DaysLeft,
  type FormStatus,
  type PctChange,
  type TrendDirection,
} from '@/shared/lib/metrics';

import { isoDateOnly } from '@/shared/lib/metrics';

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
