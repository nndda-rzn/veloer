import type { Activity } from '../types/activity';
import { formatDistance, formatDuration, formatSpeed, formatDateTime } from '@/shared/lib/utils';

interface ActivityDetailProps {
  activity: Activity;
}

export function ActivityDetail({ activity }: ActivityDetailProps) {
  const items = [
    { label: 'Distance', value: formatDistance(activity.distance) },
    { label: 'Moving Time', value: formatDuration(activity.moving_time) },
    { label: 'Elapsed Time', value: formatDuration(activity.elapsed_time) },
    {
      label: 'Avg Speed',
      value: activity.avg_speed ? formatSpeed(activity.avg_speed) : '-',
    },
    {
      label: 'Max Speed',
      value: activity.max_speed ? formatSpeed(activity.max_speed) : '-',
    },
    {
      label: 'Elevation Gain',
      value:
        activity.total_elevation_gain != null
          ? `${activity.total_elevation_gain.toFixed(0)} m`
          : '-',
    },
    {
      label: 'Avg Heart Rate',
      value: activity.avg_hr != null ? `${activity.avg_hr} bpm` : '-',
    },
    {
      label: 'Max Heart Rate',
      value: activity.max_hr != null ? `${activity.max_hr} bpm` : '-',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-900">{activity.name}</h3>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
            {activity.type}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{formatDateTime(activity.start_date)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              {item.label}
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
