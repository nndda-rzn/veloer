import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { maintenanceApi } from '../api/maintenance.api';
import type { MaintenanceSchedule } from '../types/maintenance';
import { formatDate } from '@/shared/lib/utils';

export function DueAlerts() {
  const [dueSchedules, setDueSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    maintenanceApi
      .getDueSchedules()
      .then(setDueSchedules)
      .catch(() => setDueSchedules([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-20 animate-pulse rounded-xl bg-secondary" />;
  }

  if (dueSchedules.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        Maintenance Due ({dueSchedules.length})
      </h3>
      <div className="mt-2 space-y-1">
        {dueSchedules.map((schedule) => (
          <div key={schedule.id} className="flex items-center justify-between text-sm">
            <span className="text-amber-800">{schedule.task_name}</span>
            {schedule.next_due_date && (
              <span className="text-xs text-amber-700">
                Due: {formatDate(schedule.next_due_date)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
