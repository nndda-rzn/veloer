/** A row without a discipline predates the column and is cycling. */
export function isStrength(a: { discipline?: string | null }): boolean {
  return a.discipline === 'strength';
}
