import type { FinanceSummary } from '../types/finance';
import { formatIDR } from '@/shared/lib/utils';

interface SummaryCardsProps {
  summary: FinanceSummary | null;
  loading: boolean;
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  const balance = summary.totalIncome - summary.totalExpense;

  const cards = [
    {
      label: 'Total Income',
      value: formatIDR(summary.totalIncome),
      color: 'text-green-600',
    },
    {
      label: 'Total Expense',
      value: formatIDR(summary.totalExpense),
      color: 'text-red-600',
    },
    {
      label: 'Balance',
      value: formatIDR(balance),
      color: balance >= 0 ? 'text-green-600' : 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
          <p className={`mt-1 text-xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
