import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  RotateCcw,
  CalendarCheck,
} from 'lucide-react';
import type { Goal } from '../types/goal';
import { ProgressRing } from './ProgressRing';
import { formatDate } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GOAL_HEALTH_LABELS,
  GOAL_HEALTH_TONE,
  GOAL_PERIOD_LABELS,
  GOAL_STATUS_VARIANTS,
  GOAL_TYPE_LABELS,
  goalProgress,
  projectedCompletion,
} from '../lib/goal-progress';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onLogProgress: (goal: Goal) => void;
  onRecalculate: (goal: Goal) => void;
  onSetStatus: (goal: Goal, status: Goal['status']) => void;
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onLogProgress,
  onRecalculate,
  onSetStatus,
}: GoalCardProps) {
  const progress = goalProgress(goal);
  const unit = goal.unit || '';
  const isClosed =
    goal.status === 'completed' || goal.status === 'cancelled' || goal.status === 'failed';
  const projection = goal.status === 'active' ? projectedCompletion(goal) : null;
  const projectedLate =
    projection != null && projection.getTime() > new Date(`${goal.end_date}T00:00:00`).getTime();

  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <ProgressRing percentage={progress.percent} size={64} strokeWidth={7} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">
              {goal.title || `${GOAL_TYPE_LABELS[goal.type]} Goal`}
            </h3>
            <Badge variant={GOAL_STATUS_VARIANTS[goal.status]}>{goal.status}</Badge>
          </div>

          <p className="mt-0.5 text-sm text-muted-foreground">
            {GOAL_TYPE_LABELS[goal.type]} · {GOAL_PERIOD_LABELS[goal.period]} ·{' '}
            {formatDate(goal.start_date)} – {formatDate(goal.end_date)}
          </p>

          {/* Progress bar with milestone ticks */}
          <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progress.percent}%` }}
            />
            {[25, 50, 75].map((m) => (
              <span
                key={m}
                className="absolute top-0 h-full w-px bg-card/80"
                style={{ left: `${m}%` }}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Current / target */}
          <p className="mt-2 text-sm text-foreground">
            <span className="font-mono text-lg font-semibold tabular-nums">
              {goal.current_value.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              {' '}
              / {goal.target_value.toFixed(1)} {unit}
            </span>
          </p>

          {/* Health / pace line */}
          <p className="mt-1 text-sm">
            <span className={`font-medium ${GOAL_HEALTH_TONE[progress.health]}`}>
              {GOAL_HEALTH_LABELS[progress.health]}
            </span>
            {progress.health === 'complete' ? (
              <span className="text-muted-foreground"> · target reached</span>
            ) : progress.health === 'overdue' ? (
              <span className="text-muted-foreground">
                {' '}
                · {Math.abs(progress.daysRemaining)} days past deadline
              </span>
            ) : (
              <span className="text-muted-foreground">
                {' '}
                · {progress.daysRemaining} days left
                {progress.perWeek != null && (
                  <>
                    {' '}
                    · {progress.perWeek.toFixed(1)} {unit}/week to go
                  </>
                )}
              </span>
            )}
          </p>

          {/* Projection at current pace */}
          {projection && (
            <p
              className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                projectedLate ? 'text-warning' : 'text-success'
              }`}
            >
              <CalendarCheck className="h-3 w-3" aria-hidden="true" />
              At this pace: {formatDate(projection)}{' '}
              {projectedLate ? '(after deadline)' : '(on time)'}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${goal.title ?? 'goal'}`}
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onLogProgress(goal)}>
                <Plus aria-hidden="true" />
                Log progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRecalculate(goal)}>
                <RefreshCw aria-hidden="true" />
                Recalculate from rides
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Pencil aria-hidden="true" />
                Edit goal
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {!isClosed && goal.status === 'active' && (
                <>
                  <DropdownMenuItem onClick={() => onSetStatus(goal, 'completed')}>
                    <CheckCircle2 aria-hidden="true" />
                    Mark completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSetStatus(goal, 'failed')}>
                    <XCircle aria-hidden="true" />
                    Mark failed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSetStatus(goal, 'cancelled')}>
                    <XCircle aria-hidden="true" />
                    Cancel goal
                  </DropdownMenuItem>
                </>
              )}
              {isClosed && (
                <DropdownMenuItem onClick={() => onSetStatus(goal, 'active')}>
                  <RotateCcw aria-hidden="true" />
                  Reactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(goal)}>
                <Trash2 aria-hidden="true" />
                Delete goal
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
