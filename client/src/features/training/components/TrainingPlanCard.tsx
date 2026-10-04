import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { TrainingPlan } from '../types/training';
import { PLAN_GOAL_TYPE_LABELS } from '../types/training';
import { formatDate } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TrainingPlanCardProps {
  plan: TrainingPlan;
  onClick: (plan: TrainingPlan) => void;
  onEdit: (plan: TrainingPlan) => void;
  onDelete: (plan: TrainingPlan) => void;
}

const statusVariants: Record<TrainingPlan['status'], 'info' | 'success' | 'neutral'> = {
  active: 'info',
  completed: 'success',
  archived: 'neutral',
};

export function TrainingPlanCard({ plan, onClick, onEdit, onDelete }: TrainingPlanCardProps) {
  const total = plan.workout_count ?? 0;
  const completed = plan.completed_count ?? 0;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="transition-colors hover:border-input">
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onClick(plan)}
            className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground">{plan.title}</h3>
              <Badge variant={statusVariants[plan.status]}>{plan.status}</Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {PLAN_GOAL_TYPE_LABELS[plan.goal_type]} · FTP {plan.ftp_baseline}W
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(plan.start_date)} – {formatDate(plan.end_date)}
            </p>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${plan.title}`} />
              }
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onEdit(plan)}>
                  <Pencil aria-hidden="true" />
                  Edit plan
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(plan)}>
                  <Trash2 aria-hidden="true" />
                  Delete plan
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              {completed}/{total} workouts
            </span>
            <span className="tabular-nums">{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary">
            <div
              className="h-1.5 rounded-full bg-primary transition-[width]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
