import { useMemo } from 'react';

/**
 * Read design-token colours from the document so charts use the same palette as
 * the rest of the app instead of hardcoded hex. Recharts needs concrete strings
 * at render time, so this resolves the CSS custom properties once per mount.
 *
 * The app is light-only (no runtime theme switch), so resolving once is enough.
 */
export function useChartColors() {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return FALLBACK;
    }
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    return {
      grid: read('--border', FALLBACK.grid),
      axis: read('--muted-foreground', FALLBACK.axis),
      bar: read('--color-secondary', FALLBACK.bar),
      ctl: read('--color-primary', FALLBACK.ctl),
      atl: read('--color-chart-2', FALLBACK.atl),
      success: read('--color-success', FALLBACK.success),
      missed: read('--color-muted-foreground', FALLBACK.missed),
    };
  }, []);
}

const FALLBACK = {
  grid: '#e7e5e4',
  axis: '#78716c',
  bar: '#d6d3d1',
  ctl: '#0f6e4e',
  atl: '#c2410c',
  success: '#047857',
  missed: '#a8a29e',
} as const;
