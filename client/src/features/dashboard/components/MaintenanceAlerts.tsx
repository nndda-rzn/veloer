import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { MaintenanceSchedule } from '@/features/maintenance';
import { formatDate } from '@/shared/lib/utils';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';

interface MaintenanceAlertsProps {
  dueSchedules: MaintenanceSchedule[];
  loading: boolean;
}

export function MaintenanceAlerts({ dueSchedules, loading }: MaintenanceAlertsProps) {
  if (loading) {
    return <div className="h-16 animate-pulse rounded-xl bg-secondary" />;
  }

  if (dueSchedules.length === 0) {
    return (
      <Alert variant="success" className="flex items-center gap-3">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium">All maintenance up to date</span>
      </Alert>
    );
  }

  return (
    <Alert variant="warning" live="polite">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          Maintenance Due ({dueSchedules.length})
        </h3>
        <Link to="/maintenance" className="text-xs font-medium hover:underline">
          View all →
        </Link>
      </div>
      <div className="mt-2 space-y-1.5">
        {dueSchedules.slice(0, 5).map((schedule) => (
          <div key={schedule.id} className="flex items-center justify-between text-sm">
            <span>{schedule.task_name}</span>
            {schedule.next_due_date && (
              <span className="text-xs">{formatDate(schedule.next_due_date)}</span>
            )}
          </div>
        ))}
        {dueSchedules.length > 5 && <p className="pt-1 text-xs">+{dueSchedules.length - 5} more</p>}
      </div>
    </Alert>
  );
}
