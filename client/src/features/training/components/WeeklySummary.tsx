import type { TrainingWorkout } from '../types/training';
import { Card, CardContent } from '@/components/ui/card';

interface WeeklySummaryProps {
  workouts: TrainingWorkout[];
}

interface WeekStats {
  plannedTss: number;
  actualTss: number;
  completed: number;
  total: number;
  adherence: number;
}

/** Stats for the current ISO week (Mon–Sun) from a plan's workouts. */
function weekStats(workouts: TrainingWorkout[], today: Date = new Date()): WeekStats {
  const d = new Date(today);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(d.getTime() - dow * 86_400_000);
  const sunday = new Date(monday.getTime() + 6 * 86_400_000);
  const from = monday.toISOString().slice(0, 10);
  const to = sunday.toISOString().slice(0, 10);

  const inWeek = workouts.filter((w) => w.scheduled_date >= from && w.scheduled_date <= to);
  const plannedTss = inWeek.reduce((s, w) => s + (w.target_tss ?? 0), 0);
  const actualTss = inWeek.reduce((s, w) => s + (w.actual_tss ?? 0), 0);
  const completed = inWeek.filter((w) => w.status === 'completed').length;
  const total = inWeek.length;
  const adherence = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { plannedTss, actualTss, completed, total, adherence };
}

export function WeeklySummary({ workouts }: WeeklySummaryProps) {
  const stats = weekStats(workouts);

  if (stats.total === 0) {
    return null;
  }

  const cells = [
    { label: 'This week', value: `${stats.completed}/${stats.total}`, hint: 'workouts done' },
    {
      label: 'TSS',
      value: `${Math.round(stats.actualTss)}`,
      hint: `of ${stats.plannedTss} planned`,
    },
    { label: 'Adherence', value: `${stats.adherence}%`, hint: 'of sessions' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cells.map((cell) => (
        <Card key={cell.label}>
          <CardContent>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {cell.label}
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-foreground">
              {cell.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{cell.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
