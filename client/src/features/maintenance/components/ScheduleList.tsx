import { MoreHorizontal, Pencil, Trash2, Check, Wrench } from 'lucide-react';
import type { MaintenanceSchedule } from '../types/maintenance';
import { scheduleProgress, type ScheduleBand } from '../lib/schedule-status';
import { lifespanBar } from '@/features/inventory/lib/lifespan';
import { formatDate } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState, SkeletonTable } from '@/shared/components/ui';
import { cn } from '@/lib/utils';

interface ScheduleListProps {
  schedules: MaintenanceSchedule[];
  /** The bike's current odometer, for the distance rail. */
  currentKm: number;
  loading: boolean;
  onEdit: (schedule: MaintenanceSchedule) => void;
  onDelete: (schedule: MaintenanceSchedule) => void;
  onMarkDone: (schedule: MaintenanceSchedule) => void;
  onLogService: (schedule: MaintenanceSchedule) => void;
}

/** Band -> the existing lifespan token, so a reminder matches a component. */
const BAND_BAR: Record<ScheduleBand, string> = {
  unscheduled: 'bg-secondary',
  ok: lifespanBar.good,
  soon: lifespanBar.warning,
  due: lifespanBar.danger,
  overdue: lifespanBar.overdue,
};

const BAND_LABEL: Record<ScheduleBand, string> = {
  unscheduled: 'Not scheduled',
  ok: 'On track',
  soon: 'Due soon',
  due: 'Due now',
  overdue: 'Overdue',
};

const BAND_BADGE: Record<ScheduleBand, 'neutral' | 'success' | 'warning' | 'danger'> = {
  unscheduled: 'neutral',
  ok: 'success',
  soon: 'warning',
  due: 'danger',
  overdue: 'danger',
};

export function ScheduleList({
  schedules,
  currentKm,
  loading,
  onEdit,
  onDelete,
  onMarkDone,
  onLogService,
}: ScheduleListProps) {
  if (loading) return <SkeletonTable rows={3} />;

  if (schedules.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="No reminders yet"
        description="Add a reminder so a task comes back when it is next due."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {schedules.map((schedule) => {
        const p = scheduleProgress(schedule, currentKm);
        const actionable = p.band === 'soon' || p.band === 'due' || p.band === 'overdue';

        return (
          <li key={schedule.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="truncate text-sm font-semibold text-foreground">
                    {schedule.task_name}
                  </h4>
                  <Badge variant={BAND_BADGE[p.band]}>{BAND_LABEL[p.band]}</Badge>
                </div>
                <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                  {remainingText(p.remainingKm, p.remainingDays)}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${schedule.task_name}`}
                    />
                  }
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onEdit(schedule)}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(schedule)}>
                      <Trash2 aria-hidden="true" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {p.progress != null && (
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn('h-full rounded-full transition-[width]', BAND_BAR[p.band])}
                    style={{ width: `${Math.round(p.progress * 100)}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs tabular-nums text-muted-foreground">
                  <span>
                    {schedule.last_performed_km != null
                      ? `${schedule.last_performed_km} km`
                      : 'Start'}
                  </span>
                  <span>{currentKm} km</span>
                  <span>{schedule.next_due_km != null ? `${schedule.next_due_km} km` : '–'}</span>
                </div>
              </div>
            )}

            {schedule.next_due_date && (
              <p className="mt-2 text-xs text-muted-foreground">
                Due {formatDate(schedule.next_due_date)}
              </p>
            )}

            {actionable && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onMarkDone(schedule)}>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Mark done
                </Button>
                <Button size="sm" variant="outline" onClick={() => onLogService(schedule)}>
                  <Wrench className="h-4 w-4" aria-hidden="true" />
                  Log service
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function remainingText(remainingKm: number | null, remainingDays: number | null): string {
  if (remainingKm != null) {
    return remainingKm >= 0 ? `${remainingKm} km left` : `${Math.abs(remainingKm)} km overdue`;
  }
  if (remainingDays != null) {
    return remainingDays >= 0
      ? `${remainingDays} days left`
      : `${Math.abs(remainingDays)} days overdue`;
  }
  return 'No interval set';
}
