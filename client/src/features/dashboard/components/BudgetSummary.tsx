import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import type { FinanceSummary } from '@/features/finance';
import { formatIDR, formatEnumLabel } from '@/shared/lib/utils';
import { EmptyState } from '@/shared/components/ui';

interface BudgetSummaryProps {
  summary: FinanceSummary | null;
  loading: boolean;
}

export function BudgetSummary({ summary, loading }: BudgetSummaryProps) {
  if (loading) {
    return <div className="h-24 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (!summary) {
    return (
      <EmptyState
        icon={Wallet}
        title="No finance data"
        description="Add transactions to track your cycling budget."
      />
    );
  }

  const balance = summary.totalIncome - summary.totalExpense;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Finance Summary</h3>
        <Link
          to="/finance"
          className="text-xs font-medium text-primary hover:text-primary-dark hover:underline"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Income</span>
          <span className="text-sm font-medium text-green-600">
            {formatIDR(summary.totalIncome)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Expense</span>
          <span className="text-sm font-medium text-red-500">
            {formatIDR(summary.totalExpense)}
          </span>
        </div>
        <div className="border-t border-gray-100 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Balance</span>
            <span
              className={`text-sm font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}
            >
              {formatIDR(balance)}
            </span>
          </div>
        </div>
        {Object.keys(summary.byCategory).length > 0 && (
          <div className="border-t border-gray-100 pt-2">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
              Top Categories
            </p>
            {Object.entries(summary.byCategory)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-gray-500">{formatEnumLabel(category)}</span>
                  <span className="text-xs font-medium text-gray-700">{formatIDR(amount)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
