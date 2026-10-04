import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { ActivityStats } from '@/features/activity';
import { formatDistance, formatDuration } from '@/shared/lib/utils';
import { pctChange, trendDirection } from '../lib/metrics';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MomentumBarProps {
  current: ActivityStats | null;
  previous: ActivityStats | null;
  windowDays: number;
  loading: boolean;
}

interface Metric {
  key: string;
  label: string;
  value: number;
  format: (v: number) => string;
}

const TREND_TONE = {
  up: 'text-emerald-700',
  down: 'text-red-700',
  flat: 'text-muted-foreground',
  new: 'text-primary-700',
} as const;

/**
 * "Last N days vs the N days before", in one place.
 *
 * This replaces the old five-card KPI row *and* the weekly summary chart, which
 * showed the same distance/rides/elevation figures with the same comparison in
 * two separate blocks. One block, one job: where the rider is right now.
 *
 * The long view lives in TrainingLoadCard's 8-week chart, so nothing here
 * repeats it (and no extra request is needed to draw it).
 */
export function MomentumBar({ current, previous, windowDays, loading }: MomentumBarProps) {
  if (loading || !current) {
    return (
      <Card>
        <CardContent>
          <div className="h-20 animate-pulse rounded-lg bg-secondary" />
        </CardContent>
      </Card>
    );
  }

  const metrics: Metric[] = [
    {
      key: 'distance',
      label: 'Distance',
      value: current.totalDistance,
      format: (v) => formatDistance(v),
    },
    { key: 'rides', label: 'Rides', value: current.count, format: (v) => String(v) },
    {
      key: 'time',
      label: 'Moving time',
      value: current.totalMovingTime,
      format: (v) => formatDuration(v),
    },
    {
      key: 'elevation',
      label: 'Elevation',
      value: current.totalElevationGain,
      format: (v) => `${v.toFixed(0)} m`,
    },
  ];

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-h3 font-semibold text-foreground">Momentum</h2>
          <p className="text-xs text-muted-foreground">Last {windowDays} days vs previous</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {metrics.map((metric) => {
            const prevValue = prevValueFor(metric.key, previous);
            const change = pctChange(metric.value, prevValue);
            const direction = trendDirection(change);
            const TrendIcon =
              direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;
            const label =
              direction === 'new'
                ? 'New'
                : direction === 'flat'
                  ? 'No change'
                  : change.percent != null
                    ? `${change.percent > 0 ? '+' : ''}${change.percent.toFixed(0)}%`
                    : `${change.delta > 0 ? '+' : ''}${metric.format(Math.abs(change.delta))}`;

            return (
              <div key={metric.key}>
                <dt className="text-xs text-muted-foreground">{metric.label}</dt>
                <dd className="mt-0.5 font-mono text-xl font-semibold tabular-nums tracking-tight text-foreground">
                  {metric.format(metric.value)}
                </dd>
                <span
                  className={cn(
                    'mt-0.5 inline-flex items-center gap-0.5 text-xs font-medium',
                    TREND_TONE[direction],
                  )}
                >
                  <TrendIcon className="h-3 w-3" aria-hidden="true" />
                  <span className="tabular-nums">{label}</span>
                </span>
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
}

function prevValueFor(key: string, previous: ActivityStats | null): number {
  if (!previous) return 0;
  switch (key) {
    case 'distance':
      return previous.totalDistance;
    case 'rides':
      return previous.count;
    case 'time':
      return previous.totalMovingTime;
    case 'elevation':
      return previous.totalElevationGain;
    default:
      return 0;
  }
}
