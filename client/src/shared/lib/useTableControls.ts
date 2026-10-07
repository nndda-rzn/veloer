import { useMemo, useState } from 'react';

export type SortDir = 'asc' | 'desc';

export interface SortState<K extends string> {
  key: K;
  dir: SortDir;
}

export interface UseTableControlsOptions<T, K extends string> {
  /** Rows to operate on. */
  rows: T[];
  /** Text used when searching (default: JSON of the row). */
  searchText?: (row: T) => string;
  /** Comparator for the current sort key. */
  comparators: Record<K, (a: T, b: T) => number>;
  /** Initial sort key + direction. */
  initialSort: SortState<K>;
  /** Rows per page. */
  pageSize?: number;
}

export interface UseTableControlsResult<T, K extends string> {
  /** Rows after search, before pagination. */
  filtered: T[];
  /** Rows for the current page (after sort + pagination). */
  pageRows: T[];
  query: string;
  setQuery: (q: string) => void;
  sort: SortState<K>;
  toggleSort: (key: K) => void;
  page: number;
  setPage: (p: number) => void;
  pageCount: number;
  /** 1-based inclusive range of the current page, e.g. [1, 20]. */
  rangeStart: number;
  rangeEnd: number;
  total: number;
}

/**
 * Client-side search + sort + pagination for a table. Rows are assumed to be
 * already fully loaded. Resets to page 1 whenever the query or sort changes.
 */
export function useTableControls<T, K extends string>({
  rows,
  searchText,
  comparators,
  initialSort,
  pageSize = 20,
}: UseTableControlsOptions<T, K>): UseTableControlsResult<T, K> {
  const [query, setQueryState] = useState('');
  const [sort, setSort] = useState<SortState<K>>(initialSort);
  const [page, setPageState] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    const text = searchText ?? ((row: T) => JSON.stringify(row));
    return rows.filter((row) => text(row).toLowerCase().includes(q));
  }, [rows, query, searchText]);

  const sorted = useMemo(() => {
    const cmp = comparators[sort.key];
    if (!cmp) return filtered;
    const out = [...filtered].sort(cmp);
    return sort.dir === 'desc' ? out.reverse() : out;
  }, [filtered, sort, comparators]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const startIdx = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(startIdx, startIdx + pageSize);

  const setQuery = (q: string) => {
    setQueryState(q);
    setPageState(1);
  };

  const toggleSort = (key: K) => {
    setSort((cur) =>
      cur.key === key ? { key, dir: cur.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    );
    setPageState(1);
  };

  const setPage = (p: number) => setPageState(Math.min(Math.max(1, p), pageCount));

  return {
    filtered: sorted,
    pageRows,
    query,
    setQuery,
    sort,
    toggleSort,
    page: safePage,
    setPage,
    pageCount,
    rangeStart: total === 0 ? 0 : startIdx + 1,
    rangeEnd: Math.min(startIdx + pageSize, total),
    total,
  };
}
