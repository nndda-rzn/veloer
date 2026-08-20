import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend,
  Bar,
} from 'recharts';
import type { TrainingLoadDataPoint } from '../types/training';

interface TrainingLoadChartProps {
  data: TrainingLoadDataPoint[];
  embedded?: boolean;
}

export function TrainingLoadChart({ data, embedded = false }: TrainingLoadChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <p className="text-sm text-gray-400">No training data available</p>
      </div>
    );
  }

  const chart = (
    <ResponsiveContainer width="100%" height={embedded ? 220 : 240}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickFormatter={formatChartDate}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <Tooltip
          labelFormatter={(date) => formatLongDate(String(date))}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Bar dataKey="tss" name="Daily TSS" fill="#cbd5e1" radius={[2, 2, 0, 0]} />
        <Line
          type="monotone"
          dataKey="ctl"
          name="CTL (Fitness)"
          stroke="#16a34a"
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="atl"
          name="ATL (Fatigue)"
          stroke="#f97316"
          dot={false}
          strokeWidth={2}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  if (embedded) return chart;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Training Load (8 weeks)</h3>
      {chart}
    </div>
  );
}

function formatChartDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatLongDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
