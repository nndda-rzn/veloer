import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Star } from 'lucide-react';
import type { Bike } from '../types/inventory';
import { formatIDR, formatDate } from '@/shared/lib/utils';
import { costPerKm } from '../lib/inventory-metrics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BikeHeroProps {
  bike: Bike;
  componentCount: number;
  alertCount: number;
  isDefault: boolean;
  /** Record line, sourced from maintenance logs. */
  serviceCount: number;
  serviceCost: number | null;
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
  serviceCount,
  serviceCost,
  onEdit,
  onSetDefault,
}: BikeHeroProps) {
  const cpk = costPerKm(bike.purchase_price, bike.current_km);
  const image = bike.photo_url ?? typeFallbackImages[bike.type];
  const spec = [bike.brand, bike.model, typeLabels[bike.type]].filter(Boolean).join(' · ');

  return (
    <div className="space-y-4">
      <Link
        to="/inventory"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Bikes &amp; Gear
      </Link>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-h1 font-semibold tracking-tight text-foreground">{bike.name}</h1>
              <Badge variant={statusVariants[bike.status]}>{bike.status}</Badge>
              {isDefault && (
                <Badge variant="warning">
                  <Star className="h-3 w-3" aria-hidden="true" />
                  Default
                </Badge>
              )}
            </div>
            {spec && <p className="mt-1 text-sm text-muted-foreground">{spec}</p>}

            {/* Primary figure: the odometer. */}
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {bike.current_km.toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground">km ridden</span>
            </div>

            {/* Supporting spec row. */}
            <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-border pt-5 sm:grid-cols-4">
              <Spec label="Cost / km" value={cpk != null ? formatIDR(cpk) : '–'} />
              <Spec
                label="Purchase"
                value={bike.purchase_price != null ? formatIDR(bike.purchase_price) : '–'}
              />
              <Spec
                label="Purchased"
                value={bike.purchase_date ? formatDate(bike.purchase_date) : '–'}
              />
              <Spec
                label="Components"
                value={String(componentCount)}
                tone={alertCount > 0 ? 'warning' : undefined}
                hint={alertCount > 0 ? `${alertCount} need attention` : undefined}
              />
            </dl>

            {/* Record line: service history, the trust signal. */}
            <p className="mt-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {serviceCount} {serviceCount === 1 ? 'service' : 'services'} logged
              </span>
              {serviceCost != null && serviceCost > 0 && (
                <> · {formatIDR(serviceCost)} spent on upkeep</>
              )}
            </p>

            {bike.notes && (
              <p className="mt-3 max-w-prose text-sm text-muted-foreground">{bike.notes}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 md:items-end">
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

function Spec({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: 'warning';
  hint?: string;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd
        className={`mt-0.5 font-mono text-base font-semibold tabular-nums ${
          tone === 'warning' ? 'text-amber-700' : 'text-foreground'
        }`}
      >
        {value}
      </dd>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
