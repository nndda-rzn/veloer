import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfMonth, subMonths, format } from 'date-fns';
import type { Transaction } from '../types/finance';
import { formatIDR } from '@/shared/lib/utils';
import { useFinanceColors } from '../lib/use-finance-colors';

interface MonthlyTrendChartProps {
  transactions: Transaction[];
}

const MONTHS_SHOWN = 6;

/** Expense per month for the last six calendar months, current month included. */
export function MonthlyTrendChart({ transactions }: MonthlyTrendChartProps) {
  const colors = useFinanceColors();

  const data = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; total: number }[] = [];
    const indexByKey = new Map<string, number>();

    // Seed the six buckets first so empty months still render a zero bar.
    for (let i = MONTHS_SHOWN - 1; i >= 0; i--) {
      const month = startOfMonth(subMonths(now, i));
      const key = format(month, 'yyyy-MM');
      indexByKey.set(key, buckets.length);
      buckets.push({ key, label: format(month, 'MMM'), total: 0 });
    }

    // One pass over the transactions; skip anything outside the window.
    for (const tx of transactions) {
      if (tx.type !== 'expense') continue;
      const index = indexByKey.get(tx.date.slice(0, 7));
      if (index == null) continue;
      buckets[index].total += Number(tx.amount);
    }

    return buckets;
  }, [transactions]);

  const hasExpense = data.some((d) => d.total > 0);
  if (!hasExpense) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">No expense data to display</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-2 text-base font-semibold text-foreground">Monthly Expenses</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis dataKey="label" stroke={colors.axis} tickLine={false} />
          <YAxis
            stroke={colors.axis}
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(value) => formatIDR(Number(value))}
          />
          <Tooltip
            formatter={(value) => formatIDR(Number(value))}
            cursor={{ fill: colors.grid, fillOpacity: 0.3 }}
          />
          <Bar dataKey="total" fill={colors.expense} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
