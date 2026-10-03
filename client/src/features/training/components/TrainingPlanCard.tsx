import type { TrainingPlan } from '../types/training';
import { PLAN_GOAL_TYPE_LABELS } from '../types/training';
import { formatDate } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TrainingPlanCardProps {
  plan: TrainingPlan;
  workoutCount?: number;
  completedCount?: number;
  onClick: (plan: TrainingPlan) => void;
  onDelete: (plan: TrainingPlan) => void;
}

const statusVariants: Record<TrainingPlan['status'], 'info' | 'success' | 'neutral'> = {
  active: 'info',
  completed: 'success',
  archived: 'neutral',
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
    <Card
      className="cursor-pointer transition-colors hover:border-input"
      onClick={() => onClick(plan)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{plan.title}</h3>
            <Badge variant={statusVariants[plan.status]}>{plan.status}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {PLAN_GOAL_TYPE_LABELS[plan.goal_type]} • FTP {plan.ftp_baseline}W
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(plan.start_date)} – {formatDate(plan.end_date)}
          </p>
          {plan.description && (
            <p className="mt-1 text-xs italic text-muted-foreground">{plan.description}</p>
          )}
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(plan);
          }}
        >
          Delete
        </Button>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>
            {completedCount}/{workoutCount} workouts
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary">
          <div
            className="h-1.5 rounded-full bg-primary transition-[width]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
