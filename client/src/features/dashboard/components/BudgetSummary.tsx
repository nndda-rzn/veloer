import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import type { FinanceSummary } from '@/features/finance';
import { formatIDR, formatEnumLabel } from '@/shared/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/shared/components/ui';

interface BudgetSummaryProps {
  summary: FinanceSummary | null;
  loading: boolean;
}

export function BudgetSummary({ summary, loading }: BudgetSummaryProps) {
  if (loading) {
    return <div className="h-24 animate-pulse rounded-xl bg-secondary" />;
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
    <Card>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Finance Summary</h3>
          <Link
            to="/finance"
            className="text-xs font-medium text-primary hover:text-primary-dark hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Income</span>
            <span className="text-sm font-medium tabular-nums text-success">
              {formatIDR(summary.totalIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expense</span>
            <span className="text-sm font-medium tabular-nums text-danger">
              {formatIDR(summary.totalExpense)}
            </span>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Balance</span>
              <span
                className={`text-sm font-semibold tabular-nums ${balance >= 0 ? 'text-success' : 'text-danger'}`}
              >
                {formatIDR(balance)}
              </span>
            </div>
          </div>
          {Object.keys(summary.byCategory).length > 0 && (
            <div className="border-t border-border pt-2">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Top Categories
              </p>
              {Object.entries(summary.byCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between py-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatEnumLabel(category)}
                    </span>
                    <span className="text-xs font-medium tabular-nums text-foreground">
                      {formatIDR(amount)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
