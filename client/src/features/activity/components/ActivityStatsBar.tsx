import {
  Route,
  Activity as ActivityIcon,
  Clock,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { formatDistance, formatDuration } from '@/shared/lib/utils';
import { pctChange, trendDirection, type TrendDirection } from '@/shared/lib/metrics';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { ActivitySummary } from '../lib/activity-filters';

interface ActivityStatsBarProps {
  summary: ActivitySummary;
  previous: ActivitySummary | null;
  loading: boolean;
}

interface Metric {
  key: string;
  label: string;
  icon: typeof Route;
  value: string;
  /** Raw numbers used for the delta chip. */
  current: number;
  prev: number | null;
  formatDelta: (v: number) => string;
  hint?: string;
}

const trendIcon = (dir: TrendDirection) =>
  dir === 'up' ? ArrowUpRight : dir === 'down' ? ArrowDownRight : Minus;

export function ActivityStatsBar({ summary, previous, loading }: ActivityStatsBarProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  const metrics: Metric[] = [
    {
      key: 'distance',
      label: 'Distance',
      icon: Route,
      value: formatDistance(summary.distance),
      current: summary.distance,
      prev: previous?.distance ?? null,
      formatDelta: (v) => formatDistance(v),
      hint: summary.count > 0 ? `${formatDistance(summary.avgDistance)} avg / ride` : undefined,
    },
    {
      key: 'count',
      label: 'Rides',
      icon: ActivityIcon,
      value: String(summary.count),
      current: summary.count,
      prev: previous?.count ?? null,
      formatDelta: (v) => String(v),
    },
    {
      key: 'time',
      label: 'Moving Time',
      icon: Clock,
      value: formatDuration(summary.movingTime),
      current: summary.movingTime,
      prev: previous?.movingTime ?? null,
      formatDelta: (v) => formatDuration(v),
    },
    {
      key: 'elevation',
      label: 'Elevation',
      icon: TrendingUp,
      value: `${summary.elevationGain.toFixed(0)} m`,
      current: summary.elevationGain,
      prev: previous?.elevationGain ?? null,
      formatDelta: (v) => `${v.toFixed(0)} m`,
    },
  ];

  if (summary.hasTss) {
    metrics.push({
      key: 'tss',
      label: 'Training Load',
      icon: Zap,
      value: `${summary.tss.toFixed(0)} TSS`,
      current: summary.tss,
      prev: previous?.tss ?? null,
      formatDelta: (v) => `${v.toFixed(0)}`,
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {metrics.map((m) => (
        <MetricCard key={m.key} metric={m} />
      ))}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  const hasPrev = metric.prev != null;
  const change = hasPrev ? pctChange(metric.current, metric.prev as number) : null;
  const dir: TrendDirection = change ? trendDirection(change) : 'flat';
  const TrendIcon = trendIcon(dir);

  const tone =
    dir === 'up' ? 'text-emerald-700' : dir === 'down' ? 'text-red-700' : 'text-muted-foreground';

  const deltaLabel =
    change == null
      ? null
      : dir === 'new'
        ? 'New'
        : dir === 'flat'
          ? 'No change'
          : change.percent != null
            ? `${change.percent > 0 ? '+' : ''}${change.percent.toFixed(0)}%`
            : `${change.delta > 0 ? '+' : ''}${metric.formatDelta(Math.abs(change.delta))}`;

  return (
    <Card>
      <CardContent>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <p className="mt-2 text-2xl font-mono font-semibold tabular-nums tracking-tight text-foreground">
          {metric.value}
        </p>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
          <p className="text-xs text-muted-foreground">{metric.label}</p>
          {deltaLabel && (
            <span className={cn('inline-flex items-center gap-0.5 text-[11px] font-medium', tone)}>
              <TrendIcon className="h-2.5 w-2.5" aria-hidden="true" />
              <span className="tabular-nums">{deltaLabel}</span>
            </span>
          )}
        </div>
        {metric.hint && <p className="mt-1 text-[11px] text-muted-foreground">{metric.hint}</p>}
      </CardContent>
    </Card>
  );
}
