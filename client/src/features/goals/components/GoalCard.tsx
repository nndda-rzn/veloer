import type { Goal } from '../types/goal';
import { ProgressRing } from './ProgressRing';
import { formatDate } from '@/shared/lib/utils';

interface GoalCardProps {
  goal: Goal;
  onDelete: (goal: Goal) => void;
}

const typeLabels: Record<Goal['type'], string> = {
  distance: 'Distance',
  time: 'Time',
  elevation: 'Elevation',
  activities_count: 'Activities',
};

const periodLabels: Record<Goal['period'], string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  custom: 'Custom',
};

const statusColors: Record<Goal['status'], string> = {
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

export function GoalCard({ goal, onDelete }: GoalCardProps) {
  const percentage = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <ProgressRing percentage={percentage} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">
            {goal.title || `${typeLabels[goal.type]} Goal`}
          </h4>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${statusColors[goal.status]}`}
          >
            {goal.status}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {typeLabels[goal.type]} • {periodLabels[goal.period]}
        </p>
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-bold">{goal.current_value.toFixed(1)}</span> /{' '}
          {goal.target_value.toFixed(1)} {goal.unit}
        </p>
        <p className="text-xs text-gray-400">
          {formatDate(goal.start_date)} — {formatDate(goal.end_date)}
        </p>
        {goal.description && (
          <p className="mt-1 text-xs italic text-gray-400">{goal.description}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(goal)}
        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}
