import { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench, Bike as BikeIcon } from 'lucide-react';
import type { Bike, Component } from '../types/inventory';
import { formatIDR } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BikeTableProps {
  bikes: Bike[];
  componentsByBike: Record<string, Component[]>;
  loading: boolean;
  onEdit: (bike: Bike) => void;
  onDelete: (bike: Bike) => void;
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
    <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded bg-gray-100">
      <BikeIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
    </div>
  );
}

function lifespanPercent(component: Component): number {
  if (!component.expected_lifespan_km || component.expected_lifespan_km === 0) return 0;
  return Math.min(100, (component.current_km / component.expected_lifespan_km) * 100);
}

function lifespanBarColor(component: Component): string {
  const pct = lifespanPercent(component);
  if (pct >= 100) return 'bg-red-500';
  if (pct >= 90) return 'bg-orange-500';
  if (pct >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function BikeTable({
  bikes,
  componentsByBike,
  loading,
  onEdit,
  onDelete,
  onEditComponent,
  onDeleteComponent,
  onAddComponent,
}: BikeTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  const toggle = (id: string) => setExpandedId((cur) => (cur === id ? null : id));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-8 px-2 py-3"></th>
            <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Bike
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
              Type
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Current KM
            </th>
            <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">
              Purchase
            </th>
            <th className="hidden px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">
              Alerts
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bikes.map((bike) => {
            const expanded = expandedId === bike.id;
            const components = componentsByBike[bike.id] ?? [];
            const alertCount = bike.maintenance_alert_count ?? 0;

            return (
              <FragmentRow
                key={bike.id}
                expanded={expanded}
                row={
                  <tr className="transition-colors hover:bg-gray-50">
                    <td className="px-2 py-3">
                      <button
                        onClick={() => toggle(bike.id)}
                        className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {bike.name}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {bike.brand ?? '—'} {bike.model ?? ''}
                          </p>
                        </div>
                        <Badge variant={statusVariants[bike.status]}>
                          {bike.status.charAt(0).toUpperCase() + bike.status.slice(1)}
                        </Badge>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell">
                      {typeLabels[bike.type]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {bike.current_km.toFixed(0)} km
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 lg:table-cell">
                      {bike.purchase_price != null ? formatIDR(bike.purchase_price) : '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-center sm:table-cell">
                      {alertCount > 0 && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700"
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
                        <Button
                          variant="danger"
                          size="sm"
                          className="bg-transparent text-red-600 hover:bg-red-50 focus-visible:ring-red-400"
                          onClick={() => onDelete(bike)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                }
                detail={
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">
                          Components ({components.length})
                        </p>
                        <Button size="sm" onClick={() => onAddComponent(bike)}>
                          + Add Component
                        </Button>
                      </div>
                      {components.length === 0 ? (
                        <p className="text-sm text-gray-400">No components for this bike yet.</p>
                      ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                          <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                  Component
                                </th>
                                <th className="hidden px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">
                                  Category
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                  Current KM
                                </th>
                                <th className="hidden px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
                                  Lifespan
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {components.map((component) => {
                                const pct = lifespanPercent(component);
                                return (
                                  <tr key={component.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                      <p className="text-sm font-medium text-gray-900">
                                        {component.name}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {component.brand ?? ''} {component.model ?? ''}
                                      </p>
                                    </td>
                                    <td className="hidden px-3 py-2 sm:table-cell">
                                      <span className="text-xs text-gray-500">
                                        {categoryLabels[component.category]}
                                      </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right text-sm text-gray-500">
                                      {component.current_km.toFixed(0)} km
                                    </td>
                                    <td className="hidden px-3 py-2 md:table-cell">
                                      <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                                          <div
                                            className={`h-full rounded-full ${lifespanBarColor(component)}`}
                                            style={{ width: `${pct}%` }}
                                          />
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {component.expected_lifespan_km
                                            ? `${pct.toFixed(0)}%`
                                            : 'N/A'}
                                        </span>
                                        <Badge variant={componentStatusVariants[component.status]}>
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
                                          className="text-red-500 hover:bg-red-50 hover:text-red-700"
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
          })}
        </tbody>
      </table>
    </div>
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
