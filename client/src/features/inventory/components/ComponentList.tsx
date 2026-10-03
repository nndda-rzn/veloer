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
          <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary" />
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
        <div key={component.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-foreground">{component.name}</h4>
                <Badge variant={statusVariant[component.status]}>
                  {component.status.charAt(0).toUpperCase() + component.status.slice(1)}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {categoryLabels[component.category]}
                {component.brand ? ` • ${component.brand} ${component.model ?? ''}` : ''}
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-1.5">
              <Button variant="outline" size="sm" onClick={() => onEdit(component)}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(component)}>
                Delete
              </Button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Installed
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {formatDate(component.install_date)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Current KM
              </p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
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
