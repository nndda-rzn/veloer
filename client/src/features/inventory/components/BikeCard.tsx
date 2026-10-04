import { Link } from 'react-router-dom';
import { AlertTriangle, MoreHorizontal, Archive, Tag, RotateCcw, Trash2, Star } from 'lucide-react';
import type { Bike, Component } from '../types/inventory';
import { bikeHealth } from '../lib/garage-metrics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConditionRail } from './ConditionRail';

interface BikeCardProps {
  bike: Bike;
  components: Component[];
  isDefault: boolean;
  onEdit: (bike: Bike) => void;
  onDelete: (bike: Bike) => void;
  onStatusChange: (bike: Bike, status: Bike['status']) => void;
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

export function BikeCard({
  bike,
  components,
  isDefault,
  onEdit,
  onDelete,
  onStatusChange,
}: BikeCardProps) {
  const health = bikeHealth(components);
  const image = bike.photo_url ?? typeFallbackImages[bike.type];
  const spec = [bike.brand, typeLabels[bike.type], bike.purchase_date?.slice(0, 4)]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-stone-300">
      <Link
        to={`/inventory/${bike.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Open ${bike.name}`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
          {image ? (
            <img
              src={image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xs text-muted-foreground">No photo</span>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-h3 font-semibold text-foreground">{bike.name}</h3>
              {spec && <p className="mt-0.5 truncate text-xs text-muted-foreground">{spec}</p>}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
              {isDefault && (
                <Badge variant="warning">
                  <Star className="h-3 w-3" aria-hidden="true" />
                  Default
                </Badge>
              )}
              <Badge variant={statusVariants[bike.status]}>{bike.status}</Badge>
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-xl font-semibold tabular-nums text-foreground">
              {bike.current_km.toFixed(0)}
              <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">km</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {health.activeComponents} {health.activeComponents === 1 ? 'component' : 'components'}
            </p>
          </div>

          <ConditionRail components={components} />

          <ConditionLine health={health} />
        </div>
      </Link>

      {/* Actions sit outside the link so they never trigger navigation. */}
      <div className="absolute right-2 top-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="secondary"
                size="icon-sm"
                aria-label={`Actions for ${bike.name}`}
                className="bg-card/90 backdrop-blur-sm"
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onEdit(bike)}>Edit bike</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {bike.status !== 'active' && (
                <DropdownMenuItem onClick={() => onStatusChange(bike, 'active')}>
                  <RotateCcw aria-hidden="true" />
                  Reactivate
                </DropdownMenuItem>
              )}
              {bike.status !== 'retired' && (
                <DropdownMenuItem onClick={() => onStatusChange(bike, 'retired')}>
                  <Archive aria-hidden="true" />
                  Mark retired
                </DropdownMenuItem>
              )}
              {bike.status !== 'sold' && (
                <DropdownMenuItem onClick={() => onStatusChange(bike, 'sold')}>
                  <Tag aria-hidden="true" />
                  Mark sold
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(bike)}>
                <Trash2 aria-hidden="true" />
                Delete bike
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** Text line under the rail: worst category, or a calm "all good" state. */
function ConditionLine({ health }: { health: ReturnType<typeof bikeHealth> }) {
  if (health.activeComponents === 0) {
    return <p className="text-xs text-muted-foreground">No components tracked</p>;
  }

  if (health.overdue > 0 || health.dueSoon > 0) {
    const parts: string[] = [];
    if (health.overdue > 0) parts.push(`${health.overdue} past lifespan`);
    if (health.dueSoon > 0) parts.push(`${health.dueSoon} due soon`);

    return (
      <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          {parts.join(' · ')}
          {health.worst && (
            <span className="font-normal text-muted-foreground">
              {' '}
              · worst {Math.round(health.worst.percent)}%
            </span>
          )}
        </span>
      </p>
    );
  }

  return <p className="text-xs text-muted-foreground">All components healthy</p>;
}
