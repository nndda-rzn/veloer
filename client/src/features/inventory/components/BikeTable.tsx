import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Archive,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  MoreHorizontal,
  RotateCcw,
  Search,
  Tag,
  Trash2,
  Wrench,
  Bike as BikeIcon,
} from 'lucide-react';
import type { Bike, Component } from '../types/inventory';
import { formatIDR } from '@/shared/lib/utils';
import { wearPercent, lifespanBarColor } from '../lib/lifespan';
import { costPerKm } from '../lib/inventory-metrics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { selectClass } from '@/shared/lib/form-styles';

interface BikeTableProps {
  bikes: Bike[];
  componentsByBike: Record<string, Component[]>;
  loading: boolean;
  onEdit: (bike: Bike) => void;
  onDelete: (bike: Bike) => void;
  onStatusChange: (bike: Bike, status: Bike['status']) => void;
  onEditComponent: (component: Component) => void;
  onDeleteComponent: (component: Component) => void;
  onAddComponent: (bike: Bike) => void;
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

const componentStatusVariants: Record<Component['status'], 'success' | 'neutral' | 'danger'> = {
  active: 'success',
  replaced: 'neutral',
  failed: 'danger',
};

const categoryLabels: Record<Component['category'], string> = {
  drivetrain: 'Drivetrain',
  braking: 'Braking',
  wheel: 'Wheel',
  cockpit: 'Cockpit',
  frame: 'Frame',
  other: 'Other',
};

const typeFallbackImages: Partial<Record<Bike['type'], string>> = {
  road: '/road-bike.png',
  mtb: '/mountain-bike.png',
};

type SortKey = 'name' | 'current_km' | 'purchase_price' | 'alerts';
type StatusFilter = 'all' | Bike['status'];

function BikeThumbnail({ bike }: { bike: Bike }) {
  if (bike.photo_url) {
    return (
      <img
        src={bike.photo_url}
        alt={bike.name}
        className="h-9 w-12 shrink-0 rounded object-cover"
      />
    );
  }
  const fallback = typeFallbackImages[bike.type];
  if (fallback) {
    return (
      <img
        src={fallback}
        alt={typeLabels[bike.type]}
        className="h-9 w-12 shrink-0 rounded object-cover"
      />
    );
  }
  return (
    <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded bg-secondary">
      <BikeIcon className="h-5 w-5 text-stone-300" aria-hidden="true" />
    </div>
  );
}

export function BikeTable({
  bikes,
  componentsByBike,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
  onEditComponent,
  onDeleteComponent,
  onAddComponent,
}: BikeTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = bikes.filter((b) => {
      if (status !== 'all' && b.status !== status) return false;
      if (!q) return true;
      return `${b.name} ${b.brand ?? ''} ${b.model ?? ''} ${b.type}`.toLowerCase().includes(q);
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'current_km') return a.current_km - b.current_km;
      if (sortKey === 'alerts')
        return (a.maintenance_alert_count ?? 0) - (b.maintenance_alert_count ?? 0);
      return (a.purchase_price ?? 0) - (b.purchase_price ?? 0);
    });
    return sortDir === 'desc' ? sorted.reverse() : sorted;
  }, [bikes, query, status, sortKey, sortDir]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  const toggle = (id: string) => setExpandedId((cur) => (cur === id ? null : id));

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortHead = ({
    label,
    col,
    align = 'left',
    className,
  }: {
    label: string;
    col: SortKey;
    align?: 'left' | 'right';
    className?: string;
  }) => {
    const active = sortKey === col;
    const Icon = !active ? ChevronsUpDown : sortDir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <th className={cn('px-4 py-3', align === 'right' ? 'text-right' : 'text-left', className)}>
        <button
          type="button"
          onClick={() => toggleSort(col)}
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            align === 'right' && 'flex-row-reverse',
            active ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {label}
          <Icon className="h-3 w-3" aria-hidden="true" />
        </button>
      </th>
    );
  };

  const alertsHeader = (
    <th className="hidden px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
      <button
        type="button"
        onClick={() => toggleSort('alerts')}
        className={cn(
          'inline-flex items-center gap-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          sortKey === 'alerts' ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        Alerts
        {sortKey !== 'alerts' ? (
          <ChevronsUpDown className="h-3 w-3" aria-hidden="true" />
        ) : sortDir === 'asc' ? (
          <ArrowUp className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ArrowDown className="h-3 w-3" aria-hidden="true" />
        )}
      </button>
    </th>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bikes…"
              aria-label="Search bikes"
              className="h-9 pl-8"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            aria-label="Filter by status"
            className={cn(selectClass, 'h-9 w-auto')}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="retired">Retired</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">
          {rows.length} of {bikes.length}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="w-8 px-2 py-3"></th>
              <SortHead label="Bike" col="name" className="px-2" />
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                Type
              </th>
              <SortHead label="Current KM" col="current_km" align="right" />
              <SortHead
                label="Purchase"
                col="purchase_price"
                align="right"
                className="hidden lg:table-cell"
              />
              <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground xl:table-cell">
                Cost / km
              </th>
              {alertsHeader}
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center">
                  <p className="text-sm text-muted-foreground">No bikes match your filters.</p>
                </td>
              </tr>
            ) : (
              rows.map((bike) => {
                const expanded = expandedId === bike.id;
                const components = componentsByBike[bike.id] ?? [];
                const alertCount = bike.maintenance_alert_count ?? 0;
                const cpk = costPerKm(bike.purchase_price, bike.current_km);

                return (
                  <FragmentRow
                    key={bike.id}
                    expanded={expanded}
                    row={
                      <tr className="transition-colors hover:bg-secondary">
                        <td className="px-2 py-3">
                          <button
                            onClick={() => toggle(bike.id)}
                            className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            aria-label={expanded ? 'Collapse components' : 'Expand components'}
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-3">
                            <BikeThumbnail bike={bike} />
                            <div className="min-w-0">
                              <Link
                                to={`/inventory/${bike.id}`}
                                className="truncate text-sm font-semibold text-foreground hover:text-primary"
                              >
                                {bike.name}
                              </Link>
                              <p className="truncate text-xs text-muted-foreground">
                                {bike.brand ?? '–'} {bike.model ?? ''}
                              </p>
                            </div>
                            <Badge variant={statusVariants[bike.status]}>
                              {bike.status.charAt(0).toUpperCase() + bike.status.slice(1)}
                            </Badge>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                          {typeLabels[bike.type]}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium tabular-nums text-foreground">
                          {bike.current_km.toFixed(0)} km
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 text-right text-sm tabular-nums text-muted-foreground lg:table-cell">
                          {bike.purchase_price != null ? formatIDR(bike.purchase_price) : '–'}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 text-right text-sm tabular-nums text-muted-foreground xl:table-cell">
                          {cpk != null ? formatIDR(cpk) : '–'}
                        </td>
                        <td className="hidden px-4 py-3 text-center sm:table-cell">
                          {alertCount > 0 && (
                            <span
                              className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
                              title={`${alertCount} component${alertCount !== 1 ? 's' : ''} need attention`}
                            >
                              <Wrench className="h-3 w-3" aria-hidden="true" />
                              {alertCount}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="secondary" size="sm" onClick={() => onEdit(bike)}>
                              Edit
                            </Button>
                            <BikeActionsMenu
                              bike={bike}
                              onStatusChange={onStatusChange}
                              onDelete={onDelete}
                            />
                          </div>
                        </td>
                      </tr>
                    }
                    detail={
                      <tr className="bg-secondary">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">
                              Components ({components.length})
                            </p>
                            <Button size="sm" onClick={() => onAddComponent(bike)}>
                              + Add Component
                            </Button>
                          </div>
                          {components.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No components for this bike yet.
                            </p>
                          ) : (
                            <div className="overflow-hidden rounded-xl border border-border bg-card">
                              <table className="min-w-full divide-y divide-border">
                                <thead className="bg-secondary">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      Component
                                    </th>
                                    <th className="hidden px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                                      Category
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      Current KM
                                    </th>
                                    <th className="hidden px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                                      Lifespan
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {components.map((component) => {
                                    const pct =
                                      wearPercent(
                                        component.current_km,
                                        component.install_km,
                                        component.expected_lifespan_km,
                                      ) ?? 0;
                                    return (
                                      <tr key={component.id} className="hover:bg-secondary">
                                        <td className="px-3 py-2">
                                          <p className="text-sm font-medium text-foreground">
                                            {component.name}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {component.brand ?? ''} {component.model ?? ''}
                                          </p>
                                        </td>
                                        <td className="hidden px-3 py-2 sm:table-cell">
                                          <span className="text-xs text-muted-foreground">
                                            {categoryLabels[component.category]}
                                          </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-muted-foreground">
                                          {component.current_km.toFixed(0)} km
                                        </td>
                                        <td className="hidden px-3 py-2 md:table-cell">
                                          <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                                              <div
                                                className={`h-full rounded-full ${lifespanBarColor(component.current_km, component.install_km, component.expected_lifespan_km)}`}
                                                style={{ width: `${pct}%` }}
                                              />
                                            </div>
                                            <span className="text-xs tabular-nums text-muted-foreground">
                                              {component.expected_lifespan_km
                                                ? `${pct.toFixed(0)}%`
                                                : 'N/A'}
                                            </span>
                                            <Badge
                                              variant={componentStatusVariants[component.status]}
                                            >
                                              {component.status}
                                            </Badge>
                                          </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-right">
                                          <div className="flex justify-end gap-1.5">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => onEditComponent(component)}
                                            >
                                              Edit
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => onDeleteComponent(component)}
                                            >
                                              Delete
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    }
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BikeActionsMenu({
  bike,
  onStatusChange,
  onDelete,
}: {
  bike: Bike;
  onStatusChange: (bike: Bike, status: Bike['status']) => void;
  onDelete: (bike: Bike) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${bike.name}`} />}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
  );
}

// Helper to render an expandable row (React fragments inside <tbody> need keyed elements)
function FragmentRow({
  row,
  detail,
  expanded,
}: {
  row: React.ReactNode;
  detail: React.ReactNode;
  expanded: boolean;
}) {
  return (
    <>
      {row}
      {expanded && detail}
    </>
  );
}
