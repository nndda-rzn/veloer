import type { Component } from '../types/inventory';
import { formatDate } from '@/shared/lib/utils';
import { LifespanIndicator } from './LifespanIndicator';

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

const statusColors: Record<Component['status'], string> = {
  active: 'bg-green-100 text-green-700',
  replaced: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-700',
};

export function ComponentList({ components, loading, onEdit, onDelete }: ComponentListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">No components added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {components.map((component) => (
        <div key={component.id} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{component.name}</h4>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${statusColors[component.status]}`}
                >
                  {component.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {categoryLabels[component.category]}
                {component.brand ? ` • ${component.brand} ${component.model ?? ''}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(component)}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(component)}
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Installed
              </p>
              <p className="font-medium text-gray-900">{formatDate(component.install_date)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Current KM
              </p>
              <p className="font-medium text-gray-900">{component.current_km.toFixed(0)} km</p>
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
