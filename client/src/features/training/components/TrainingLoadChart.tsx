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

interface TrainingLoadDataPoint {
  date: string;
  tss: number;
  ctl: number;
  atl: number;
}

interface TrainingLoadChartProps {
  data: TrainingLoadDataPoint[];
}

export function TrainingLoadChart({ data }: TrainingLoadChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <p className="text-sm text-gray-400">No training data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Training Load (8 weeks)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="tss" name="Daily TSS" fill="#e2e8f0" radius={[2, 2, 0, 0]} />
          <Line
            type="monotone"
            dataKey="ctl"
            name="CTL (Fitness)"
            stroke="#3b82f6"
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
    </div>
  );
}
