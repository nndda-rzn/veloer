import type { ActivityStats } from '@/features/activity';
import { formatDistance, formatDuration } from '@/shared/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { pctChange, trendDirection, type TrendDirection } from '../lib/metrics';
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Route,
  Activity,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface ActivitySummaryCardProps {
  current: ActivityStats | null;
  previous: ActivityStats | null;
  windowDays: number;
  loading: boolean;
}

interface Indicator {
  label: string;
  icon: typeof Route;
  format: (v: number) => string;
  value: number;
  previous: number;
}

const indicators = (current: ActivityStats | null, previous: ActivityStats | null): Indicator[] => [
  {
    label: 'Distance',
    icon: Route,
    format: formatDistance,
    value: current?.totalDistance ?? 0,
    previous: previous?.totalDistance ?? 0,
  },
  {
    label: 'Rides',
    icon: Activity,
    format: (v) => String(v),
    value: current?.count ?? 0,
    previous: previous?.count ?? 0,
  },
  {
    label: 'Moving Time',
    icon: Clock,
    format: formatDuration,
    value: current?.totalMovingTime ?? 0,
    previous: previous?.totalMovingTime ?? 0,
  },
  {
    label: 'Elevation',
    icon: TrendingUp,
    format: (v) => `${v.toFixed(0)} m`,
    value: current?.totalElevationGain ?? 0,
    previous: previous?.totalElevationGain ?? 0,
  },
];

export function WeeklyDistanceChart({
  current,
  previous,
  windowDays,
  loading,
}: ActivitySummaryCardProps) {
  if (loading && !current) {
    return <div className="h-40 animate-pulse rounded-xl bg-secondary" />;
  }

  const items = indicators(current, previous);

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-base font-semibold text-foreground">Activity Summary</h3>
          <span className="text-xs text-muted-foreground">Last {windowDays} days</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <IndicatorCell key={item.label} item={item} Icon={Icon} windowDays={windowDays} />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function IndicatorCell({
  item,
  Icon,
  windowDays,
}: {
  item: Indicator;
  Icon: typeof Route;
  windowDays: number;
}) {
  const change = pctChange(item.value, item.previous);
  const direction: TrendDirection = trendDirection(change);
  const TrendIcon =
    direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;
  const tone =
    direction === 'up'
      ? 'text-emerald-700'
      : direction === 'down'
        ? 'text-red-700'
        : 'text-muted-foreground';

  const label =
    direction === 'new'
      ? 'New'
      : direction === 'flat'
        ? 'No change'
        : change.percent != null
          ? `${change.percent > 0 ? '+' : ''}${change.percent.toFixed(0)}%`
          : `${change.delta > 0 ? '+' : ''}${item.format(Math.abs(change.delta))}`;

  return (
    <div className="flex flex-col gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <p className="text-2xl font-mono font-semibold tabular-nums tracking-tight text-foreground">
        {item.format(item.value)}
      </p>
      <div>
        <p className="text-xs text-muted-foreground">{item.label}</p>
        <span className={cn('mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium', tone)}>
          <TrendIcon className="h-2.5 w-2.5" aria-hidden="true" />
          <span className="tabular-nums">
            {label} vs prev {windowDays}d
          </span>
        </span>
      </div>
    </div>
  );
}
