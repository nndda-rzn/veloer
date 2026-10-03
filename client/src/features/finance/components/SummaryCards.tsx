import type { FinanceSummary } from '../types/finance';
import { formatIDR } from '@/shared/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryCardsProps {
  summary: FinanceSummary | null;
  loading: boolean;
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  const balance = summary.totalIncome - summary.totalExpense;

  const cards = [
    {
      label: 'Total Income',
      value: formatIDR(summary.totalIncome),
      color: 'text-success',
    },
    {
      label: 'Total Expense',
      value: formatIDR(summary.totalExpense),
      color: 'text-danger',
    },
    {
      label: 'Balance',
      value: formatIDR(balance),
      color: balance >= 0 ? 'text-success' : 'text-danger',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {card.label}
            </p>
            <p className={`mt-1 text-2xl font-semibold tabular-nums ${card.color}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
