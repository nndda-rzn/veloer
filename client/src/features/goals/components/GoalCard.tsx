import { MoreHorizontal, Trash2 } from 'lucide-react';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GOAL_HEALTH_LABELS,
  GOAL_HEALTH_TONE,
  GOAL_PERIOD_LABELS,
  GOAL_STATUS_VARIANTS,
  GOAL_TYPE_LABELS,
  goalProgress,
} from '../lib/goal-progress';

interface GoalCardProps {
  goal: Goal;
  onDelete: (goal: Goal) => void;
}

export function GoalCard({ goal, onDelete }: GoalCardProps) {
  const progress = goalProgress(goal);
  const unit = goal.unit || '';

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
