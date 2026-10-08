import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { FinanceSummary } from '../types/finance';
import { formatIDR, formatEnumLabel } from '@/shared/lib/utils';
import { CATEGORY_LABELS } from '../lib/finance-meta';
import { useFinanceColors } from '../lib/use-finance-colors';
import type { Transaction } from '../types/finance';

interface CategoryChartProps {
  summary: FinanceSummary | null;
}

export function CategoryChart({ summary }: CategoryChartProps) {
  const colors = useFinanceColors();

  if (!summary || Object.keys(summary.byCategory).length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">No expense data to display</p>
      </div>
    );
  }

  const chartData = Object.entries(summary.byCategory).map(([category, amount]) => ({
    name: CATEGORY_LABELS[category as Transaction['category']] ?? formatEnumLabel(category),
    value: amount,
    color: colors.byCategory[category as Transaction['category']] ?? colors.axis,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-2 text-base font-semibold text-foreground">Expenses by Category</h4>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={(entry) => entry.name}
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatIDR(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
