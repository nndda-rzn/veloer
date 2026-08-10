import type { MaintenanceSchedule } from '@/features/maintenance';
import { formatDate } from '@/shared/lib/utils';

interface MaintenanceAlertsProps {
  dueSchedules: MaintenanceSchedule[];
  loading: boolean;
}

export function MaintenanceAlerts({ dueSchedules, loading }: MaintenanceAlertsProps) {
  if (loading) {
    return <div className="h-24 animate-pulse rounded-lg bg-gray-100" />;
  }

  if (dueSchedules.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-green-800">
          <span>✓</span>
          All maintenance up to date
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-orange-800">
        <span>⚠️</span>
        Maintenance Due ({dueSchedules.length})
      </h3>
      <div className="mt-2 space-y-1">
        {dueSchedules.slice(0, 5).map((schedule) => (
          <div key={schedule.id} className="flex items-center justify-between text-sm">
            <span className="text-orange-700">{schedule.task_name}</span>
            {schedule.next_due_date && (
              <span className="text-xs text-orange-600">{formatDate(schedule.next_due_date)}</span>
            )}
          </div>
        ))}
        {dueSchedules.length > 5 && (
          <p className="pt-1 text-xs text-orange-500">+{dueSchedules.length - 5} more...</p>
        )}
      </div>
    </div>
  );
}
