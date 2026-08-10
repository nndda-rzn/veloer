import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ActivityStats } from '@/features/activity';
import { formatDistance } from '@/shared/lib/utils';

interface WeeklyDistanceChartProps {
  stats: ActivityStats | null;
}

export function WeeklyDistanceChart({ stats }: WeeklyDistanceChartProps) {
  // ponytail: simplified — using aggregate stats as single bar.
  // Real weekly breakdown requires backend endpoint. Add when dashboard v2.
  const data = [{ name: 'Total', km: stats ? stats.totalDistance / 1000 : 0 }];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-700">Distance Overview</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `${v.toFixed(0)} km`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatDistance(Number(value) * 1000)} />
          <Bar dataKey="km" fill="#dc2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-xs text-gray-400">
        {stats?.count ?? 0} activities • {stats ? formatDistance(stats.totalDistance) : '—'}
      </p>
    </div>
  );
}
