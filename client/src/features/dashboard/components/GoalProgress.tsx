import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import type { Goal } from '@/features/goals';
import { ProgressRing } from '@/features/goals';
import { EmptyState } from '@/shared/components/ui';

interface GoalProgressProps {
  goals: Goal[];
  loading: boolean;
}

export function GoalProgress({ goals, loading }: GoalProgressProps) {
  if (loading) {
    return <div className="h-32 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (goals.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="No active goals"
        description="Set a goal to track your progress."
      />
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Active Goals</h3>
        <Link
          to="/goals"
          className="text-xs font-medium text-primary hover:text-primary-dark hover:underline"
        >
          View all →
        </Link>
      </div>
      <div className="flex flex-wrap gap-4">
        {goals.slice(0, 4).map((goal) => {
          const percentage =
            goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
          return (
            <div key={goal.id} className="flex flex-col items-center">
              <ProgressRing percentage={percentage} size={64} />
              <p
                className="mt-1.5 max-w-[72px] truncate text-xs text-gray-500"
                title={goal.title || goal.type}
              >
                {goal.title || goal.type}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
