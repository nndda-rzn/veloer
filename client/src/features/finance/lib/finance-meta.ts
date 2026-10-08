import type { Transaction } from '../types/finance';

/** Display label for each transaction category. Shared by the table, the pie
 * chart and the budget section so they never drift apart. */
export const CATEGORY_LABELS: Record<Transaction['category'], string> = {
  gear: 'Gear',
  maintenance: 'Maintenance',
  event: 'Event',
  nutrition: 'Nutrition',
  other: 'Other',
};

/**
 * Which resolved colour each category uses in charts. These are keys of
 * `useChartColors()`, not hex values, so charts always match the design tokens
 * instead of freezing a palette at author time.
 */
export const CATEGORY_TOKEN: Record<
  Transaction['category'],
  'primary' | 'danger' | 'atl' | 'success' | 'warning'
> = {
  gear: 'primary',
  maintenance: 'danger',
  event: 'atl',
  nutrition: 'success',
  other: 'warning',
};
