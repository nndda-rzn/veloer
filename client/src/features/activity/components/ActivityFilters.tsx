import type { ActivityListFilters } from '../types/activity';

interface ActivityFiltersProps {
  filters: ActivityListFilters;
  onChange: (filters: ActivityListFilters) => void;
}

export function ActivityFilters({ filters, onChange }: ActivityFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="startDate" className="block text-xs font-medium text-gray-600">
          From
        </label>
        <input
          id="startDate"
          type="date"
          value={filters.startDate ?? ''}
          onChange={(e) =>
            onChange({ ...filters, startDate: e.target.value || undefined, offset: 0 })
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="endDate" className="block text-xs font-medium text-gray-600">
          To
        </label>
        <input
          id="endDate"
          type="date"
          value={filters.endDate ?? ''}
          onChange={(e) =>
            onChange({ ...filters, endDate: e.target.value || undefined, offset: 0 })
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        onClick={() => onChange({ limit: 20, offset: 0 })}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
      >
        Reset
      </button>
    </div>
  );
}
