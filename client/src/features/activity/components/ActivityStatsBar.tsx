import { Route, Activity, Clock, TrendingUp } from 'lucide-react';
import type { ActivityStats } from '../types/activity';
import { formatDistance, formatDuration } from '@/shared/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface ActivityStatsBarProps {
  stats: ActivityStats | null;
  loading: boolean;
}

export function ActivityStatsBar({ stats, loading }: ActivityStatsBarProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Total Rides', value: String(stats.count), icon: Activity },
    { label: 'Total Distance', value: formatDistance(stats.totalDistance), icon: Route },
    { label: 'Moving Time', value: formatDuration(stats.totalMovingTime), icon: Clock },
    { label: 'Elevation', value: `${stats.totalElevationGain.toFixed(0)} m`, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent>
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                {item.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
