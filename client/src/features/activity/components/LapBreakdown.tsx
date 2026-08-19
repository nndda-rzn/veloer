import { useState, useEffect } from 'react';
import { activityApi } from '../api/activity.api';
import type { ActivityLap } from '../types/activity';
import { formatDistance, formatDuration } from '@/shared/lib/utils';

interface LapBreakdownProps {
  activityId: string;
}

export function LapBreakdown({ activityId }: LapBreakdownProps) {
  const [laps, setLaps] = useState<ActivityLap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    activityApi
      .getLaps(activityId)
      .then(setLaps)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [activityId]);

  if (loading) {
    return <div className="h-32 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
        <p className="text-sm text-gray-500">Lap data not available for this activity.</p>
      </div>
    );
  }

  if (laps.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
        <p className="text-sm text-gray-500">No lap data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">#</th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
              Dist
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
              Time
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">HR</th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
              Cad
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
              Power
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {laps.map((lap) => (
            <tr key={lap.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 text-sm text-gray-500">{lap.lap_index + 1}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-900">
                {formatDistance(lap.distance)}
              </td>
              <td className="px-3 py-2 text-right text-sm text-gray-500">
                {formatDuration(lap.moving_time)}
              </td>
              <td className="px-3 py-2 text-right text-sm text-gray-500">
                {lap.average_heartrate ? `${lap.average_heartrate.toFixed(0)}` : '-'}
              </td>
              <td className="px-3 py-2 text-right text-sm text-gray-500">
                {lap.average_cadence ? `${lap.average_cadence.toFixed(0)}` : '-'}
              </td>
              <td className="px-3 py-2 text-right text-sm text-gray-500">
                {lap.average_watts ? `${lap.average_watts.toFixed(0)}W` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
