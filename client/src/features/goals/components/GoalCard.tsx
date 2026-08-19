import type { Goal } from '../types/goal';
import { ProgressRing } from './ProgressRing';
import { formatDate } from '@/shared/lib/utils';
import { Badge, Card, Button } from '@/shared/components/ui';

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

const statusVariants: Record<Goal['status'], 'info' | 'success' | 'danger' | 'neutral'> = {
  active: 'info',
  completed: 'success',
  failed: 'danger',
  cancelled: 'neutral',
};

export function GoalCard({ goal, onDelete }: GoalCardProps) {
  const percentage = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;

  return (
    <Card className="flex items-center gap-4">
      <ProgressRing percentage={percentage} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900">
            {goal.title || `${typeLabels[goal.type]} Goal`}
          </h4>
          <Badge variant={statusVariants[goal.status]}>{goal.status}</Badge>
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
      <Button variant="danger" size="sm" onClick={() => onDelete(goal)}>
        Delete
      </Button>
    </Card>
  );
}
