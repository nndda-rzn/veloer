import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { FinanceSummary } from '../types/finance';
import { formatIDR } from '@/shared/lib/utils';

interface CategoryChartProps {
  summary: FinanceSummary | null;
}

const categoryColors: Record<string, string> = {
  gear: '#3b82f6',
  maintenance: '#ef4444',
  event: '#8b5cf6',
  nutrition: '#10b981',
  other: '#f59e0b',
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
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <p className="text-sm text-gray-400">No expense data to display</p>
      </div>
    );
  }

  const chartData = Object.entries(summary.byCategory).map(([category, amount]) => ({
    name: categoryLabels[category] || category,
    value: amount,
    color: categoryColors[category] || '#6b7280',
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-700">Expenses by Category</h4>
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
