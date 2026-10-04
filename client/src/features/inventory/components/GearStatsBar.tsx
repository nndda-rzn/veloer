import { Bike, Route, Wallet, Wrench } from 'lucide-react';
import { formatDistance, formatIDR } from '@/shared/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { GearSummary } from '../lib/inventory-metrics';

interface GearStatsBarProps {
  summary: GearSummary;
  loading: boolean;
}

export function GearStatsBar({ summary, loading }: GearStatsBarProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: 'Active bikes',
      value: String(summary.activeCount),
      icon: Bike,
      hint: summary.totalCount > summary.activeCount ? `${summary.totalCount} total` : undefined,
    },
    {
      label: 'Total distance',
      value: formatDistance(summary.totalKm * 1000),
      icon: Route,
    },
    {
      label: 'Gear value',
      value: summary.totalValue > 0 ? formatIDR(summary.totalValue) : '–',
      icon: Wallet,
    },
    {
      label: 'Maintenance alerts',
      value: String(summary.bikesWithAlerts),
      icon: Wrench,
      hint: summary.bikesWithAlerts === 0 ? 'All good' : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent>
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <p className="mt-2 text-xl font-mono font-semibold tabular-nums tracking-tight text-foreground">
                {item.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
              {item.hint && <p className="text-[11px] text-muted-foreground">{item.hint}</p>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
