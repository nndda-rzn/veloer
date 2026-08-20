import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3, Target, TrendingUp } from 'lucide-react';
import type { Goal } from '@/features/goals';
import { ProgressRing } from '@/features/goals';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/shared/components/ui';
import { daysLeft, requiredPerWeek } from '../lib/metrics';

interface GoalProgressProps {
  goals: Goal[];
  loading: boolean;
}

export function GoalProgress({ goals, loading }: GoalProgressProps) {
  if (loading) {
    return <div className="h-56 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (goals.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="No active goals"
        description="Set a goal to turn your next rides into measurable progress."
        action={{ label: 'Create Goal', onClick: () => (window.location.href = '/goals') }}
      />
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Goals in Motion</h3>
            <p className="mt-0.5 text-xs text-gray-400">Progress and pace to deadline</p>
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
            const percentage =
              goal.target_value > 0
                ? Math.min(100, (goal.current_value / goal.target_value) * 100)
                : 0;
            const remaining = Math.max(0, goal.target_value - goal.current_value);
            const remainingDays = daysLeft(goal.start_date, goal.end_date).daysRemaining;
            const pace = requiredPerWeek(remaining, goal.end_date);
            const isComplete = goal.status === 'completed' || remaining <= 0;
            const isOverdue = !isComplete && remainingDays < 0;

            return (
              <div key={goal.id} className="flex items-center gap-3">
                <ProgressRing percentage={percentage} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {goal.title || `${goal.type} goal`}
                    </p>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-500">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    <span className="tabular-nums">{goal.current_value.toFixed(1)}</span> /{' '}
                    <span className="tabular-nums">{goal.target_value.toFixed(1)}</span> {goal.unit}
                  </p>
                  {isComplete ? (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      Goal reached
                    </p>
                  ) : isOverdue ? (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                      <Clock3 className="h-3 w-3" aria-hidden="true" />
                      Overdue by {Math.abs(remainingDays)} days
                    </p>
                  ) : (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primary-700">
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                      {remainingDays} days left
                      {pace != null && (
                        <span className="text-gray-400">
                          · {pace.toFixed(1)} {goal.unit}/week
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
