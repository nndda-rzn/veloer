import type { Component } from '../types/inventory';
import { formatDate } from '@/shared/lib/utils';
import { LifespanIndicator } from './LifespanIndicator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/shared/components/ui';
import { Wrench } from 'lucide-react';

interface ComponentListProps {
  components: Component[];
  loading: boolean;
  onEdit: (component: Component) => void;
  onDelete: (component: Component) => void;
}

const categoryLabels: Record<Component['category'], string> = {
  drivetrain: 'Drivetrain',
  braking: 'Braking',
  wheel: 'Wheel',
  cockpit: 'Cockpit',
  frame: 'Frame',
  other: 'Other',
};

const statusVariant: Record<Component['status'], 'success' | 'neutral' | 'danger'> = {
  active: 'success',
  replaced: 'neutral',
  failed: 'danger',
};

export function ComponentList({ components, loading, onEdit, onDelete }: ComponentListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="No components yet"
        description="Add components to track lifespan and maintenance."
      />
    );
  }

  return (
    <div className="space-y-2">
      {components.map((component) => (
        <div
          key={component.id}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900">{component.name}</h4>
                <Badge variant={statusVariant[component.status]}>
                  {component.status.charAt(0).toUpperCase() + component.status.slice(1)}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {categoryLabels[component.category]}
                {component.brand ? ` • ${component.brand} ${component.model ?? ''}` : ''}
              </p>
            </div>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={() => onEdit(component)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onDelete(component)}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Installed
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {formatDate(component.install_date)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Current KM
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {component.current_km.toFixed(0)} km
              </p>
            </div>
            <div>
              <LifespanIndicator
                currentKm={component.current_km}
                expectedLifespanKm={component.expected_lifespan_km}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
