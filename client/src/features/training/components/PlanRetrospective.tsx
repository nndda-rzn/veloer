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
    { name: 'Completed', value: summary.completed, fill: '#0f6e4e' },
    { name: 'Skipped', value: summary.skipped, fill: '#b45309' },
    { name: 'Missed', value: summary.missed, fill: '#a8a29e' },
    {
      name: 'Planned',
      value: summary.total_workouts - summary.completed - summary.skipped - summary.missed,
      fill: '#2563eb',
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Plan header */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-lg font-semibold text-foreground">{plan.title}</h2>
        <p className="text-sm text-muted-foreground">
          {plan.start_date} — {plan.end_date} • FTP baseline: {plan.ftp_baseline}W
          {summary.ftp_change != null && (
            <span
              className={`ml-2 font-medium ${
                summary.ftp_change >= 0 ? 'text-success' : 'text-danger'
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
          { label: 'Completion', value: `${summary.completion_rate}%`, color: 'text-success' },
          { label: 'TSS Compliance', value: `${summary.tss_compliance}%`, color: 'text-info' },
          { label: 'Planned Hours', value: `${summary.planned_hours_total}h` },
          { label: 'Actual Hours', value: `${summary.actual_hours_total}h` },
          { label: 'Planned TSS', value: summary.planned_tss_total },
          { label: 'Actual TSS', value: summary.actual_tss_total },
          {
            label: 'Completed',
            value: `${summary.completed}/${summary.total_workouts}`,
            color: 'text-success',
          },
          {
            label: 'Missed',
            value: summary.missed,
            color: summary.missed > 0 ? 'text-muted-foreground' : undefined,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-xl font-semibold ${s.color ?? 'text-foreground'}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Completion donut */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Workout Status</h3>
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
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Weekly TSS: Planned vs Actual
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly_breakdown}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#78716c' }} />
              <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="planned_tss" name="Planned" fill="#d6d3d1" radius={[2, 2, 0, 0]} />
              <Bar dataKey="actual_tss" name="Actual" fill="#0f6e4e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly breakdown table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              {['Week', 'Workouts', 'Completed', 'Planned TSS', 'Actual TSS', 'Compliance'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {weekly_breakdown.map((w) => {
              const compliance =
                w.planned_tss > 0 ? Math.round((w.actual_tss / w.planned_tss) * 100) : null;
              return (
                <tr key={w.week} className="hover:bg-secondary">
                  <td className="px-4 py-2 text-sm text-foreground">{w.week}</td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">{w.total}</td>
                  <td className="px-4 py-2 text-sm text-success">{w.completed}</td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">{w.planned_tss}</td>
                  <td className="px-4 py-2 text-sm text-info">{w.actual_tss}</td>
                  <td className="px-4 py-2 text-sm">
                    {compliance != null ? (
                      <span
                        className={
                          compliance >= 80
                            ? 'text-success'
                            : compliance >= 50
                              ? 'text-warning'
                              : 'text-danger'
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
