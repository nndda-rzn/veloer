import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { PieChart, Pie } from 'recharts';
import type { PlanRetrospective } from '../types/training';

interface PlanRetrospectiveProps {
  data: PlanRetrospective;
}

export function PlanRetrospectiveView({ data }: PlanRetrospectiveProps) {
  const { plan, summary, weekly_breakdown } = data;

  // Donut chart data for completion
  const completionData = [
    { name: 'Completed', value: summary.completed, fill: '#22c55e' },
    { name: 'Skipped', value: summary.skipped, fill: '#eab308' },
    { name: 'Missed', value: summary.missed, fill: '#9ca3af' },
    {
      name: 'Planned',
      value: summary.total_workouts - summary.completed - summary.skipped - summary.missed,
      fill: '#3b82f6',
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Plan header */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-bold text-gray-900">{plan.title}</h2>
        <p className="text-sm text-gray-500">
          {plan.start_date} — {plan.end_date} • FTP baseline: {plan.ftp_baseline}W
          {summary.ftp_change != null && (
            <span
              className={`ml-2 font-medium ${
                summary.ftp_change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              FTP change: {summary.ftp_change >= 0 ? '+' : ''}
              {summary.ftp_change}W
            </span>
          )}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Completion', value: `${summary.completion_rate}%`, color: 'text-green-600' },
          { label: 'TSS Compliance', value: `${summary.tss_compliance}%`, color: 'text-blue-600' },
          { label: 'Planned Hours', value: `${summary.planned_hours_total}h` },
          { label: 'Actual Hours', value: `${summary.actual_hours_total}h` },
          { label: 'Planned TSS', value: summary.planned_tss_total },
          { label: 'Actual TSS', value: summary.actual_tss_total },
          {
            label: 'Completed',
            value: `${summary.completed}/${summary.total_workouts}`,
            color: 'text-green-600',
          },
          {
            label: 'Missed',
            value: summary.missed,
            color: summary.missed > 0 ? 'text-gray-500' : undefined,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wider text-gray-400">{s.label}</p>
            <p className={`mt-1 text-xl font-bold ${s.color ?? 'text-gray-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Completion donut */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Workout Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {completionData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly TSS compliance */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Weekly TSS: Planned vs Actual
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly_breakdown}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="planned_tss" name="Planned" fill="#e2e8f0" radius={[2, 2, 0, 0]} />
              <Bar dataKey="actual_tss" name="Actual" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly breakdown table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Week', 'Workouts', 'Completed', 'Planned TSS', 'Actual TSS', 'Compliance'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {weekly_breakdown.map((w) => {
              const compliance =
                w.planned_tss > 0 ? Math.round((w.actual_tss / w.planned_tss) * 100) : null;
              return (
                <tr key={w.week} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{w.week}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{w.total}</td>
                  <td className="px-4 py-2 text-sm text-green-600">{w.completed}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{w.planned_tss}</td>
                  <td className="px-4 py-2 text-sm text-blue-600">{w.actual_tss}</td>
                  <td className="px-4 py-2 text-sm">
                    {compliance != null ? (
                      <span
                        className={
                          compliance >= 80
                            ? 'text-green-600'
                            : compliance >= 50
                              ? 'text-yellow-600'
                              : 'text-red-500'
                        }
                      >
                        {compliance}%
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
