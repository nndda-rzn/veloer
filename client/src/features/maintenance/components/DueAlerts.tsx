import { useState, useEffect } from 'react';
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
    return <div className="h-20 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (dueSchedules.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-orange-800">
        <span>⚠️</span>
        Maintenance Due ({dueSchedules.length})
      </h3>
      <div className="mt-2 space-y-1">
        {dueSchedules.map((schedule) => (
          <div key={schedule.id} className="flex items-center justify-between text-sm">
            <span className="text-orange-700">{schedule.task_name}</span>
            {schedule.next_due_date && (
              <span className="text-xs text-orange-600">
                Due: {formatDate(schedule.next_due_date)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
