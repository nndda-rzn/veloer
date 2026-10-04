import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { SortDir } from '@/shared/lib/useTableControls';

/** Search box + filter slot + result count, shown above a table. */
export function TableToolbar({
  query,
  onQueryChange,
  placeholder = 'Search…',
  filters,
  rangeStart,
  rangeEnd,
  total,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  placeholder?: string;
  filters?: ReactNode;
  rangeStart: number;
  rangeEnd: number;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search table"
          className="h-9 w-full sm:w-64"
        />
        {filters}
      </div>
      <p className="text-xs tabular-nums text-muted-foreground">
        {total === 0 ? 'No results' : `${rangeStart}–${rangeEnd} of ${total}`}
      </p>
    </div>
  );
}

/** A clickable column header that cycles asc/desc sort. */
export function SortableHead({
  label,
  sortKey,
  activeKey,
  dir,
  onToggle,
  align = 'left',
  className,
}: {
  label: string;
  sortKey: string;
  activeKey: string;
  dir: SortDir;
  onToggle: (key: string) => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const isActive = sortKey === activeKey;
  const Icon = !isActive ? ChevronsUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <TableHead className={cn(align === 'right' && 'text-right', className)}>
      <button
        type="button"
        onClick={() => onToggle(sortKey)}
        className={cn(
          'inline-flex items-center gap-1 font-medium uppercase tracking-wider transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          align === 'right' && 'flex-row-reverse',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
        <Icon className="h-3 w-3" aria-hidden="true" />
      </button>
    </TableHead>
  );
}

/** Pagination controls for a table. */
export function TablePagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (p: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Page <span className="tabular-nums">{page}</span> of{' '}
        <span className="tabular-nums">{pageCount}</span>
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
