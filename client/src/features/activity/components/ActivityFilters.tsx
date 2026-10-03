import type { ActivityListFilters } from '../types/activity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ActivityFiltersProps {
  filters: ActivityListFilters;
  onChange: (filters: ActivityListFilters) => void;
}

export function ActivityFilters({ filters, onChange }: ActivityFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="startDate" className="block text-xs font-medium text-muted-foreground">
          From
        </label>
        <Input
          id="startDate"
          type="date"
          value={filters.startDate ?? ''}
          onChange={(e) =>
            onChange({ ...filters, startDate: e.target.value || undefined, offset: 0 })
          }
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="endDate" className="block text-xs font-medium text-muted-foreground">
          To
        </label>
        <Input
          id="endDate"
          type="date"
          value={filters.endDate ?? ''}
          onChange={(e) =>
            onChange({ ...filters, endDate: e.target.value || undefined, offset: 0 })
          }
        />
      </div>

      <Button variant="outline" size="sm" onClick={() => onChange({ limit: 20, offset: 0 })}>
        Reset
      </Button>
    </div>
  );
}
