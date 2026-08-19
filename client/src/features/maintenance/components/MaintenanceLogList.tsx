import type { MaintenanceLog } from '../types/maintenance';
import { formatDate, formatIDR } from '@/shared/lib/utils';

interface MaintenanceLogListProps {
  logs: MaintenanceLog[];
  loading: boolean;
  onDelete: (log: MaintenanceLog) => void;
}

const typeLabels: Record<MaintenanceLog['type'], string> = {
  routine: 'Routine',
  repair: 'Repair',
  replacement: 'Replacement',
  cleaning: 'Cleaning',
  tuning: 'Tuning',
};

const typeColors: Record<MaintenanceLog['type'], string> = {
  routine: 'bg-blue-100 text-blue-700',
  repair: 'bg-orange-100 text-orange-700',
  replacement: 'bg-purple-100 text-purple-700',
  cleaning: 'bg-green-100 text-green-700',
  tuning: 'bg-yellow-100 text-yellow-700',
};

export function MaintenanceLogList({ logs, loading, onDelete }: MaintenanceLogListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">No maintenance logs yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[log.type]}`}
                >
                  {typeLabels[log.type]}
                </span>
                <span className="text-xs text-gray-400">{formatDate(log.service_date)}</span>
                <span className="text-xs text-gray-400">{log.service_km.toFixed(0)} km</span>
              </div>
              <p className="mt-1 text-sm text-gray-900">{log.description}</p>
              <div className="mt-1 flex gap-4 text-xs text-gray-500">
                {log.cost != null && <span>Cost: {formatIDR(log.cost)}</span>}
                <span>By: {log.performed_by === 'self' ? 'Self' : (log.shop_name ?? 'Shop')}</span>
                {log.next_service_date && <span>Next: {formatDate(log.next_service_date)}</span>}
              </div>
            </div>
            <button
              onClick={() => onDelete(log)}
              className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
