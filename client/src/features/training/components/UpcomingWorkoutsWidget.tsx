import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { trainingApi } from '@/features/training';
import { WORKOUT_TYPE_COLORS, WORKOUT_TYPE_LABELS, isStrengthType } from '@/features/training';
import type { TrainingWorkout } from '@/features/training';
import { CalendarDays } from 'lucide-react';
import { EmptyState, Skeleton } from '@/shared/components/ui';

export function UpcomingWorkoutsWidget() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<TrainingWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all plans then get workouts in date range
    trainingApi
      .listPlans()
      .then(async (plans) => {
        const activePlans = plans.filter((p) => p.status === 'active');
        if (activePlans.length === 0) return [];
        // Fetch workouts from all active plans and merge
        const results = await Promise.all(activePlans.map((p) => trainingApi.listWorkouts(p.id)));
        return results.flat();
      })
      .then((workouts) => {
        const today = new Date().toISOString().split('T')[0];
        const in14Days = new Date();
        in14Days.setDate(in14Days.getDate() + 14);
        const cutoff = in14Days.toISOString().split('T')[0];
        const upcoming = workouts
          .filter(
            (w) =>
              w.scheduled_date >= today && w.scheduled_date <= cutoff && w.status === 'planned',
          )
          .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
          .slice(0, 3);
        setWorkouts(upcoming);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No upcoming workouts"
        description="Create a training plan to schedule sessions."
        action={{ label: 'Training plans', onClick: () => navigate('/training-plans') }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {workouts.map((w) => {
        const color = WORKOUT_TYPE_COLORS[w.workout_type];
        const isStrength = isStrengthType(w.workout_type);
        const date = new Date(w.scheduled_date + 'T00:00:00');
        const dayLabel = date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        return (
          <Link
            key={w.id}
            to={`/training-plans/${w.plan_id}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-secondary"
          >
            <div
              className="h-8 w-1.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{w.title}</p>
              <p className="text-xs text-muted-foreground">
                {dayLabel} · {WORKOUT_TYPE_LABELS[w.workout_type]}
                {w.target_duration_minutes ? ` · ${w.target_duration_minutes}min` : ''}
              </p>
            </div>
            {!isStrength && w.target_tss && (
              <span className="flex-shrink-0 text-xs text-muted-foreground">
                TSS {w.target_tss}
              </span>
            )}
          </Link>
        );
      })}
      <Link
        to="/training-plans"
        className="block text-center text-xs text-primary hover:underline pt-1"
      >
        View all plans →
      </Link>
    </div>
  );
}
