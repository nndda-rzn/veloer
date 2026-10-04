import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Wallet, Route, TrendingUp, Wrench, Star } from 'lucide-react';
import type { Bike } from '../types/inventory';
import { formatIDR, formatDistance } from '@/shared/lib/utils';
import { costPerKm } from '../lib/inventory-metrics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BikeHeroProps {
  bike: Bike;
  componentCount: number;
  alertCount: number;
  isDefault: boolean;
  onEdit: () => void;
  onSetDefault: () => void;
}

const typeLabels: Record<Bike['type'], string> = {
  road: 'Road',
  mtb: 'MTB',
  gravel: 'Gravel',
  hybrid: 'Hybrid',
  folding: 'Folding',
  other: 'Other',
};

const statusVariants: Record<Bike['status'], 'success' | 'neutral' | 'info'> = {
  active: 'success',
  retired: 'neutral',
  sold: 'info',
};

const typeFallbackImages: Partial<Record<Bike['type'], string>> = {
  road: '/road-bike.png',
  mtb: '/mountain-bike.png',
};

export function BikeHero({
  bike,
  componentCount,
  alertCount,
  isDefault,
  onEdit,
  onSetDefault,
}: BikeHeroProps) {
  const cpk = costPerKm(bike.purchase_price, bike.current_km);
  const image = bike.photo_url ?? typeFallbackImages[bike.type];

  return (
    <div className="space-y-4">
      <Link
        to="/inventory"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Bikes &amp; Gear
      </Link>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{bike.name}</h1>
              <Badge variant={statusVariants[bike.status]}>{bike.status}</Badge>
              {isDefault && (
                <Badge variant="warning">
                  <Star className="h-3 w-3" aria-hidden="true" />
                  Default
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {typeLabels[bike.type]}
              {bike.brand ? ` · ${bike.brand} ${bike.model ?? ''}`.trimEnd() : ''}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
              <Stat
                icon={Route}
                label="Total distance"
                value={formatDistance(bike.current_km * 1000)}
              />
              <Stat icon={Wallet} label="Cost / km" value={cpk != null ? formatIDR(cpk) : '–'} />
              <Stat
                icon={TrendingUp}
                label="Purchase"
                value={bike.purchase_price != null ? formatIDR(bike.purchase_price) : '–'}
              />
              <Stat icon={Wrench} label="Components" value={String(componentCount)} />
              <Stat
                icon={Wrench}
                label="Alerts"
                value={String(alertCount)}
                tone={alertCount > 0 ? 'warning' : undefined}
              />
            </div>

            {bike.notes && (
              <p className="mt-4 max-w-prose text-sm text-muted-foreground">{bike.notes}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-3">
            <div className="flex gap-2">
              {!isDefault && bike.status === 'active' && (
                <Button variant="ghost" onClick={onSetDefault}>
                  <Star className="h-4 w-4" aria-hidden="true" />
                  Set default
                </Button>
              )}
              <Button variant="secondary" onClick={onEdit}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit bike
              </Button>
            </div>
            {image && (
              <img
                src={image}
                alt={bike.name}
                className="hidden h-auto w-[240px] rounded-lg object-contain md:block"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Route;
  label: string;
  value: string;
  tone?: 'warning';
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p
        className={`mt-1 font-mono text-lg font-semibold tabular-nums ${
          tone === 'warning' ? 'text-amber-700' : 'text-foreground'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
