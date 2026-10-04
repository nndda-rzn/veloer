import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { formatDistance } from '@/shared/lib/utils';
import { weeklyVolume } from '../lib/activity-volume';
import type { Activity } from '../types/activity';

interface ActivityVolumeSparklineProps {
  activities: Activity[];
  weeks?: number;
}

/**
 * Compact 12-week distance trend shown above the activity list. Gives the page
 * a sense of direction without competing with the stats cards.
 */
export function ActivityVolumeSparkline({ activities, weeks = 12 }: ActivityVolumeSparklineProps) {
  const data = useMemo(() => weeklyVolume(activities, weeks), [activities, weeks]);
  const total = useMemo(() => data.reduce((sum, w) => sum + w.distance, 0), [data]);

  if (total === 0) return null;

  const thisWeek = data[data.length - 1];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Weekly volume</h3>
        <p className="text-xs text-muted-foreground">
          This week ·{' '}
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {formatDistance(thisWeek.distance)}
          </span>{' '}
          · {thisWeek.count} {thisWeek.count === 1 ? 'ride' : 'rides'}
        </p>
      </div>
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="veloer-volume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f6e4e" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#0f6e4e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" hide />
            <Tooltip
              cursor={{ stroke: '#0f6e4e', strokeOpacity: 0.2 }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e7e5e4',
                fontSize: 12,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
              labelStyle={{ color: '#57534e' }}
              formatter={(value) => [formatDistance(Number(value)), 'Distance']}
            />
            <Area
              type="monotone"
              dataKey="distance"
              stroke="#0f6e4e"
              strokeWidth={2}
              fill="url(#veloer-volume)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
