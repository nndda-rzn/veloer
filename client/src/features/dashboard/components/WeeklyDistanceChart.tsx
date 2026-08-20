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
  iconBg: string;
  iconColor: string;
  format: (v: number) => string;
  value: number;
  previous: number;
}

const indicators = (current: ActivityStats | null, previous: ActivityStats | null): Indicator[] => [
  {
    label: 'Distance',
    icon: Route,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    format: formatDistance,
    value: current?.totalDistance ?? 0,
    previous: previous?.totalDistance ?? 0,
  },
  {
    label: 'Rides',
    icon: Activity,
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary',
    format: (v) => String(v),
    value: current?.count ?? 0,
    previous: previous?.count ?? 0,
  },
  {
    label: 'Moving Time',
    icon: Clock,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    format: formatDuration,
    value: current?.totalMovingTime ?? 0,
    previous: previous?.totalMovingTime ?? 0,
  },
  {
    label: 'Elevation',
    icon: TrendingUp,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
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
    return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  }

  const items = indicators(current, previous);

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Activity Summary</h3>
          <span className="text-xs text-gray-400">Last {windowDays} days</span>
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
      ? 'text-emerald-600 bg-emerald-50'
      : direction === 'down'
        ? 'text-red-600 bg-red-50'
        : 'text-gray-500 bg-gray-50';

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
      <div className={cn('w-fit rounded-lg p-2', item.iconBg)}>
        <Icon className={cn('h-4 w-4', item.iconColor)} aria-hidden="true" />
      </div>
      <p className="text-2xl font-bold tabular-nums text-gray-900">{item.format(item.value)}</p>
      <div>
        <p className="text-xs text-gray-500">{item.label}</p>
        <span
          className={cn(
            'mt-1 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium',
            tone,
          )}
        >
          <TrendIcon className="h-2.5 w-2.5" aria-hidden="true" />
          <span className="tabular-nums">
            {label} vs prev {windowDays}d
          </span>
        </span>
      </div>
    </div>
  );
}
