/** Rows without a discipline predate the column and are cycling. */
export function isCycling(row: { discipline?: string | null }): boolean {
  return (row.discipline ?? 'cycling') === 'cycling';
}
