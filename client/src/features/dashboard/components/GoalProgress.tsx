import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock3, Target, TrendingUp } from 'lucide-react';
import type { Goal } from '@/features/goals';
import { ProgressRing, goalProgress } from '@/features/goals';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/shared/components/ui';

interface GoalProgressProps {
  goals: Goal[];
  loading: boolean;
}

export function GoalProgress({ goals, loading }: GoalProgressProps) {
  const navigate = useNavigate();
  if (loading) {
    return <div className="h-56 animate-pulse rounded-xl bg-secondary" />;
  }

  if (goals.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="No active goals"
        description="Set a goal to turn your next rides into measurable progress."
        action={{ label: 'Create Goal', onClick: () => navigate('/goals') }}
      />
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Goals in Motion</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">Progress and pace to deadline</p>
          </div>
          <Link
            to="/goals"
            className="text-xs font-medium text-primary hover:text-primary-dark hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-4">
          {goals.slice(0, 3).map((goal) => {
            const p = goalProgress(goal);
            const unit = goal.unit || '';

            return (
              <div key={goal.id} className="flex items-center gap-3">
                <ProgressRing percentage={p.percent} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {goal.title || `${goal.type} goal`}
                    </p>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                      {p.percent.toFixed(0)}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="tabular-nums">{goal.current_value.toFixed(1)}</span> /{' '}
                    <span className="tabular-nums">{goal.target_value.toFixed(1)}</span> {unit}
                  </p>
                  {p.health === 'complete' ? (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      Goal reached
                    </p>
                  ) : p.health === 'overdue' ? (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-danger">
                      <Clock3 className="h-3 w-3" aria-hidden="true" />
                      Overdue by {Math.abs(p.daysRemaining)} days
                    </p>
                  ) : (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primary-700">
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                      {p.daysRemaining} days left
                      {p.perWeek != null && (
                        <span className="text-muted-foreground">
                          · {p.perWeek.toFixed(1)} {unit}/week
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
