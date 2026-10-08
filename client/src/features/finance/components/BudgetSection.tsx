import type { BudgetStatus } from '../types/finance';
import { formatIDR } from '@/shared/lib/utils';
import { CATEGORY_LABELS } from '../lib/finance-meta';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/shared/components/ui';
import { Wallet } from 'lucide-react';

interface BudgetSectionProps {
  status: BudgetStatus[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (status: BudgetStatus) => void;
  onDelete: (status: BudgetStatus) => void;
}

const BUDGET_CATEGORY_LABELS: Record<string, string> = {
  ...CATEGORY_LABELS,
  total: 'Total',
};

/** Spend is read at a glance: green under 75%, amber approaching the limit,
 * red at or over it. The percentage is always printed so colour is never the
 * only signal. */
function progressTone(percentage: number): string {
  if (percentage >= 100) return 'text-danger';
  if (percentage >= 75) return 'text-warning';
  return 'text-success';
}

export function BudgetSection({ status, loading, onAdd, onEdit, onDelete }: BudgetSectionProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  if (status.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="No budgets yet"
        description="Set a budget to track spending per category."
        action={{ label: 'Add budget', onClick: onAdd }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-h3 font-semibold text-foreground">Budgets</h2>
        <Button size="sm" variant="outline" onClick={onAdd}>
          Add budget
        </Button>
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {status.map((row) => {
          const tone = progressTone(row.percentage);
          return (
            <div key={row.category} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  {BUDGET_CATEGORY_LABELS[row.category] ?? row.category}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {formatIDR(row.spent)} / {formatIDR(row.budgetAmount)}
                  <span className={`ml-2 font-semibold ${tone}`}>{row.percentage.toFixed(0)}%</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-[width] ${tone.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(100, row.percentage)}%` }}
                />
              </div>
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => onEdit(row)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(row)}>
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
