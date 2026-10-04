import {
  RefreshCw,
  Wrench,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Clock,
} from 'lucide-react';
import type { Component } from '../types/inventory';
import { formatDate } from '@/shared/lib/utils';
import { wearPercent, remainingKm, lifespanBar, lifespanTextColor } from '../lib/lifespan';
import type { WearProjection } from '../lib/wear-projection';
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
import { cn } from '@/lib/utils';

export const CATEGORY_LABELS: Record<Component['category'], string> = {
  drivetrain: 'Drivetrain',
  braking: 'Braking',
  wheel: 'Wheel',
  cockpit: 'Cockpit',
  frame: 'Frame',
  other: 'Other',
};

const statusVariants: Record<Component['status'], 'success' | 'neutral' | 'danger'> = {
  active: 'success',
  replaced: 'neutral',
  failed: 'danger',
};

interface ComponentCardProps {
  component: Component;
  /** Optional estimate of when this component will reach end of lifespan. */
  projection?: WearProjection | null;
  onEdit: (component: Component) => void;
  onDelete: (component: Component) => void;
  onReplace: (component: Component) => void;
  onSetStatus: (component: Component, status: Component['status']) => void;
  onLogService: (component: Component) => void;
}

export function ComponentCard({
  component,
  projection,
  onEdit,
  onDelete,
  onReplace,
  onSetStatus,
  onLogService,
}: ComponentCardProps) {
  const pct = wearPercent(
    component.current_km,
    component.install_km,
    component.expected_lifespan_km,
  );
  const remaining = remainingKm(
    component.current_km,
    component.install_km,
    component.expected_lifespan_km,
  );
  const barColor = pct === null ? 'bg-emerald-500' : lifespanBar[bandFromPct(pct)];
  const isActive = component.status === 'active';

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-foreground">{component.name}</h4>
            <Badge variant={statusVariants[component.status]}>{component.status}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {component.brand ? `${component.brand} ${component.model ?? ''}`.trim() : 'No brand'}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${component.name}`} />
            }
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onLogService(component)}>
                <Wrench aria-hidden="true" />
                Log service
              </DropdownMenuItem>
              {isActive && (
                <DropdownMenuItem onClick={() => onReplace(component)}>
                  <RefreshCw aria-hidden="true" />
                  Replace
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(component)}>
                <Pencil aria-hidden="true" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {component.status !== 'active' && (
                <DropdownMenuItem onClick={() => onSetStatus(component, 'active')}>
                  <CheckCircle2 aria-hidden="true" />
                  Mark active
                </DropdownMenuItem>
              )}
              {component.status !== 'failed' && (
                <DropdownMenuItem onClick={() => onSetStatus(component, 'failed')}>
                  <XCircle aria-hidden="true" />
                  Mark failed
                </DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(component)}>
                <Trash2 aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {pct !== null ? (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {component.expected_lifespan_km?.toFixed(0)} km lifespan
            </span>
            <span
              className={cn(
                'font-medium tabular-nums',
                lifespanTextColor(
                  component.current_km,
                  component.install_km,
                  component.expected_lifespan_km,
                ),
              )}
            >
              {pct.toFixed(0)}%
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn('h-full rounded-full transition-[width]', barColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">
            {remaining != null && remaining > 0
              ? `${remaining.toFixed(0)} km remaining`
              : `${Math.abs(remaining ?? 0).toFixed(0)} km overdue`}
          </p>
          {projection && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden="true" />≈{' '}
              {Math.max(1, Math.round(projection.weeksRemaining))} week
              {Math.round(projection.weeksRemaining) === 1 ? '' : 's'} left at{' '}
              {projection.rateKmPerWeek.toFixed(0)} km/wk
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">No lifespan set</p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Installed</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {formatDate(component.install_date)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Since install</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-foreground">
            {(component.current_km - component.install_km).toFixed(0)} km
          </dd>
        </div>
      </dl>
    </div>
  );
}

function bandFromPct(pct: number): keyof typeof lifespanBar {
  if (pct >= 100) return 'overdue';
  if (pct >= 90) return 'danger';
  if (pct >= 70) return 'warning';
  return 'good';
}
