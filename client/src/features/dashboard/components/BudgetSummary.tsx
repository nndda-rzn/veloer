import type { FinanceSummary } from '@/features/finance';
import { formatIDR } from '@/shared/lib/utils';

interface BudgetSummaryProps {
  summary: FinanceSummary | null;
  loading: boolean;
}

export function BudgetSummary({ summary, loading }: BudgetSummaryProps) {
  if (loading || !summary) {
    return <div className="h-24 animate-pulse rounded-lg bg-gray-100" />;
  }

  const balance = summary.totalIncome - summary.totalExpense;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-700">Finance Summary</h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Income</span>
          <span className="text-sm font-medium text-green-600">
            {formatIDR(summary.totalIncome)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Expense</span>
          <span className="text-sm font-medium text-red-600">
            {formatIDR(summary.totalExpense)}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Balance</span>
            <span
              className={`text-sm font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatIDR(balance)}
            </span>
          </div>
        </div>
        {Object.keys(summary.byCategory).length > 0 && (
          <div className="border-t border-gray-200 pt-2">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
              Top Categories
            </p>
            {Object.entries(summary.byCategory)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-xs capitalize text-gray-500">{category}</span>
                  <span className="text-xs text-gray-700">{formatIDR(amount)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
