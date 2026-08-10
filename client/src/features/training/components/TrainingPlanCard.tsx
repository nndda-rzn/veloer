import type { TrainingPlan } from '../types/training';
import { PLAN_GOAL_TYPE_LABELS } from '../types/training';
import { formatDate } from '@/shared/lib/utils';

interface TrainingPlanCardProps {
  plan: TrainingPlan;
  workoutCount?: number;
  completedCount?: number;
  onClick: (plan: TrainingPlan) => void;
  onDelete: (plan: TrainingPlan) => void;
}

const statusColors: Record<TrainingPlan['status'], string> = {
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-600',
};

export function TrainingPlanCard({
  plan,
  workoutCount = 0,
  completedCount = 0,
  onClick,
  onDelete,
}: TrainingPlanCardProps) {
  const progressPct = workoutCount > 0 ? Math.round((completedCount / workoutCount) * 100) : 0;

  return (
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
      onClick={() => onClick(plan)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{plan.title}</h3>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[plan.status]}`}
            >
              {plan.status}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            {PLAN_GOAL_TYPE_LABELS[plan.goal_type]} • FTP {plan.ftp_baseline}W
          </p>
          <p className="text-xs text-gray-400">
            {formatDate(plan.start_date)} — {formatDate(plan.end_date)}
          </p>
          {plan.description && (
            <p className="mt-1 text-xs italic text-gray-400">{plan.description}</p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(plan);
          }}
          className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>
            {completedCount}/{workoutCount} workouts
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
