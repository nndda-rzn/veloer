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
    return <div className="h-32 animate-pulse rounded-xl bg-secondary" />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">Lap data not available for this activity.</p>
      </div>
    );
  }

  if (laps.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">No lap data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-secondary">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
              #
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-muted-foreground">
              Dist
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-muted-foreground">
              Time
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-muted-foreground">
              HR
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-muted-foreground">
              Cad
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-muted-foreground">
              Power
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {laps.map((lap) => (
            <tr key={lap.id} className="hover:bg-secondary">
              <td className="px-3 py-2 text-sm text-muted-foreground">{lap.lap_index + 1}</td>
              <td className="px-3 py-2 text-right text-sm text-foreground">
                {formatDistance(lap.distance)}
              </td>
              <td className="px-3 py-2 text-right text-sm text-muted-foreground">
                {formatDuration(lap.moving_time)}
              </td>
              <td className="px-3 py-2 text-right text-sm text-muted-foreground">
                {lap.average_heartrate ? `${lap.average_heartrate.toFixed(0)}` : '-'}
              </td>
              <td className="px-3 py-2 text-right text-sm text-muted-foreground">
                {lap.average_cadence ? `${lap.average_cadence.toFixed(0)}` : '-'}
              </td>
              <td className="px-3 py-2 text-right text-sm text-muted-foreground">
                {lap.average_watts ? `${lap.average_watts.toFixed(0)}W` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
