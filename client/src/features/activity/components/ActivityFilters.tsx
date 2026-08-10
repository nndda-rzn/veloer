import type { ActivityListFilters } from '../types/activity';

interface ActivityFiltersProps {
  filters: ActivityListFilters;
  onChange: (filters: ActivityListFilters) => void;
}

export function ActivityFilters({ filters, onChange }: ActivityFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="startDate" className="text-xs font-medium text-gray-500">
          From
        </label>
        <input
          id="startDate"
          type="date"
          value={filters.startDate ?? ''}
          onChange={(e) =>
            onChange({ ...filters, startDate: e.target.value || undefined, offset: 0 })
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="endDate" className="text-xs font-medium text-gray-500">
          To
        </label>
        <input
          id="endDate"
          type="date"
          value={filters.endDate ?? ''}
          onChange={(e) =>
            onChange({ ...filters, endDate: e.target.value || undefined, offset: 0 })
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        onClick={() => onChange({ limit: 20, offset: 0 })}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        Reset
      </button>
    </div>
  );
}
