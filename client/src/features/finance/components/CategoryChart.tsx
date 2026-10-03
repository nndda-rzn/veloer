import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { FinanceSummary } from '../types/finance';
import { formatIDR } from '@/shared/lib/utils';

interface CategoryChartProps {
  summary: FinanceSummary | null;
}

const categoryColors: Record<string, string> = {
  gear: '#0f6e4e',
  maintenance: '#b91c1c',
  event: '#6d28d9',
  nutrition: '#047857',
  other: '#c2410c',
};

const categoryLabels: Record<string, string> = {
  gear: 'Gear',
  maintenance: 'Maintenance',
  event: 'Event',
  nutrition: 'Nutrition',
  other: 'Other',
};

export function CategoryChart({ summary }: CategoryChartProps) {
  if (!summary || Object.keys(summary.byCategory).length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">No expense data to display</p>
      </div>
    );
  }

  const chartData = Object.entries(summary.byCategory).map(([category, amount]) => ({
    name: categoryLabels[category] || category,
    value: amount,
    color: categoryColors[category] || '#78716c',
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-2 text-sm font-semibold text-foreground">Expenses by Category</h4>
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
