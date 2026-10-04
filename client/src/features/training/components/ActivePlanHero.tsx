import { useNavigate } from 'react-router-dom';
import { CalendarRange, ArrowRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { TrainingPlan } from '../types/training';
import { PLAN_GOAL_TYPE_LABELS } from '../types/training';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { planProgress } from '../lib/plan-progress';

interface ActivePlanHeroProps {
  plan: TrainingPlan;
  onEdit: (plan: TrainingPlan) => void;
  onDelete: (plan: TrainingPlan) => void;
}

export function ActivePlanHero({ plan, onEdit, onDelete }: ActivePlanHeroProps) {
  const navigate = useNavigate();
  const p = planProgress(plan);
  const daysLabel =
    p.daysRemaining > 0
      ? `${p.daysRemaining} days left`
      : p.daysRemaining === 0
        ? 'Ends today'
        : `${Math.abs(p.daysRemaining)} days past end`;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-primary-700">
              Active plan
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-foreground">
              {plan.title}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {PLAN_GOAL_TYPE_LABELS[plan.goal_type]} · FTP {plan.ftp_baseline}W
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate(`/training-plans/${plan.id}`)}>
              Open plan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label={`Actions for ${plan.title}`} />
                }
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => onEdit(plan)}>
                    <Pencil aria-hidden="true" />
                    Edit plan
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={() => onDelete(plan)}>
                    <Trash2 aria-hidden="true" />
                    Delete plan
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">
              Week <span className="font-medium tabular-nums text-foreground">{p.weekNumber}</span>{' '}
              of <span className="tabular-nums">{p.totalWeeks}</span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              {p.completed}/{p.total} workouts
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${p.percent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarRange className="h-3 w-3" aria-hidden="true" />
              {daysLabel}
            </span>
            <span className="tabular-nums">{p.percent}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
