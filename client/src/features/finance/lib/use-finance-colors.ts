import { useMemo } from 'react';
import { useChartColors } from '@/shared/lib/use-chart-colors';
import { CATEGORY_TOKEN } from './finance-meta';
import type { Transaction } from '../types/finance';

type TokenKey = (typeof CATEGORY_TOKEN)[Transaction['category']];

/**
 * Chart-ready colours for finance. Composes the shared `useChartColors` tokens
 * with the two semantic colours it does not expose (danger, warning), so the
 * category palette stays in one place and always tracks the design tokens.
 */
export function useFinanceColors(): {
  byCategory: Record<Transaction['category'], string>;
  expense: string;
  grid: string;
  axis: string;
} {
  const base = useChartColors();
  return useMemo(() => {
    const styles =
      typeof window === 'undefined' ? null : getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) =>
      (styles?.getPropertyValue(name).trim() || fallback) as string;

    const extra: Record<'danger' | 'warning', string> = {
      danger: read('--color-danger', '#b91c1c'),
      warning: read('--color-warning', '#b45309'),
    };
    const tokens: Record<TokenKey, string> = {
      primary: base.ctl,
      danger: extra.danger,
      atl: base.atl,
      success: base.success,
      warning: extra.warning,
    };

    const byCategory = Object.fromEntries(
      Object.entries(CATEGORY_TOKEN).map(([category, key]) => [category, tokens[key]]),
    ) as Record<Transaction['category'], string>;

    return { byCategory, expense: extra.danger, grid: base.grid, axis: base.axis };
  }, [base]);
}
