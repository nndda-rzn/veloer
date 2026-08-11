import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { MaintenanceSchedule } from '@/features/maintenance';
import { formatDate } from '@/shared/lib/utils';
import { Link } from 'react-router-dom';

interface MaintenanceAlertsProps {
  dueSchedules: MaintenanceSchedule[];
  loading: boolean;
}

export function MaintenanceAlerts({ dueSchedules, loading }: MaintenanceAlertsProps) {
  if (loading) {
    return <div className="h-16 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (dueSchedules.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" aria-hidden="true" />
        <p className="text-sm font-medium text-green-800">All maintenance up to date</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          Maintenance Due ({dueSchedules.length})
        </h3>
        <Link
          to="/maintenance"
          className="text-xs font-medium text-amber-700 hover:text-amber-900 hover:underline"
        >
          View all →
        </Link>
      </div>
      <div className="mt-2 space-y-1.5">
        {dueSchedules.slice(0, 5).map((schedule) => (
          <div key={schedule.id} className="flex items-center justify-between text-sm">
            <span className="text-amber-700">{schedule.task_name}</span>
            {schedule.next_due_date && (
              <span className="text-xs text-amber-600">{formatDate(schedule.next_due_date)}</span>
            )}
          </div>
        ))}
        {dueSchedules.length > 5 && (
          <p className="pt-1 text-xs text-amber-600">+{dueSchedules.length - 5} more</p>
        )}
      </div>
    </div>
  );
}
