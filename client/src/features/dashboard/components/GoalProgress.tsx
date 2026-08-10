import type { Goal } from '@/features/goals';
import { ProgressRing } from '@/features/goals';

interface GoalProgressProps {
  goals: Goal[];
  loading: boolean;
}

export function GoalProgress({ goals, loading }: GoalProgressProps) {
  if (loading) {
    return <div className="h-32 animate-pulse rounded-lg bg-gray-100" />;
  }

  if (goals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-500">No active goals</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-700">Active Goals</h4>
      <div className="flex flex-wrap gap-4">
        {goals.slice(0, 4).map((goal) => {
          const percentage =
            goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
          return (
            <div key={goal.id} className="flex flex-col items-center">
              <ProgressRing percentage={percentage} size={70} />
              <p className="mt-1 max-w-[80px] truncate text-xs text-gray-500">
                {goal.title || goal.type}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
