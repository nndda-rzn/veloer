import type { Goal } from '../types/goal';
import { summarizeGoals } from '../lib/goal-progress';

interface GoalsSummaryProps {
  goals: Goal[];
}

/** Compact overview of active goals by health. */
export function GoalsSummary({ goals }: GoalsSummaryProps) {
  const active = goals.filter((g) => g.status === 'active');
  if (active.length === 0) return null;

  const s = summarizeGoals(active);

  const items = [
    { label: 'Active', value: s.total, tone: 'text-foreground' },
    { label: 'On track', value: s.onTrack, tone: 'text-success' },
    { label: 'Behind', value: s.behind, tone: 'text-warning' },
    { label: 'Overdue', value: s.overdue, tone: 'text-danger' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border bg-card px-4 py-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <span className={`font-mono text-xl font-semibold tabular-nums ${item.tone}`}>
            {item.value}
          </span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
