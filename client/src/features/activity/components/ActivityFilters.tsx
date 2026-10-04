import { formatActivityType } from '@/shared/lib/utils';
import { selectClass } from '@/shared/lib/form-styles';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ALL, DATE_PRESETS, type ActivityQuery, type DatePreset } from '../lib/activity-filters';

interface ActivityFiltersProps {
  query: ActivityQuery;
  onChange: (query: ActivityQuery) => void;
  types: string[];
  bikes: { id: string; name: string }[];
}

export function ActivityFilters({ query, onChange, types, bikes }: ActivityFiltersProps) {
  const isFiltered = query.preset !== '30d' || query.type !== ALL || query.bikeId !== ALL;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Date range">
        {DATE_PRESETS.map((preset) => {
          const active = query.preset === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ ...query, preset: preset.value as DatePreset })}
              className={cn(
                'h-8 rounded-full border px-3 text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-stone-300 hover:text-foreground',
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={query.type}
          onChange={(e) => onChange({ ...query, type: e.target.value })}
          aria-label="Filter by activity type"
          className={cn(selectClass, 'h-9 w-auto')}
        >
          <option value={ALL}>All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {formatActivityType(t)}
            </option>
          ))}
        </select>

        {bikes.length > 0 && (
          <select
            value={query.bikeId}
            onChange={(e) => onChange({ ...query, bikeId: e.target.value })}
            aria-label="Filter by bike"
            className={cn(selectClass, 'h-9 w-auto')}
          >
            <option value={ALL}>All bikes</option>
            {bikes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}

        {query.preset === 'custom' && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={query.range.start}
              onChange={(e) =>
                onChange({ ...query, range: { ...query.range, start: e.target.value } })
              }
              aria-label="From date"
              className="h-9 w-auto"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={query.range.end}
              onChange={(e) =>
                onChange({ ...query, range: { ...query.range, end: e.target.value } })
              }
              aria-label="To date"
              className="h-9 w-auto"
            />
          </div>
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({ preset: '30d', range: { start: '', end: '' }, type: ALL, bikeId: ALL })
            }
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
