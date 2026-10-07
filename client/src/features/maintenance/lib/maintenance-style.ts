import type { MaintenanceLog } from '../types/maintenance';

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceLog['type'], string> = {
  routine: 'Routine',
  repair: 'Repair',
  replacement: 'Replacement',
  cleaning: 'Cleaning',
  tuning: 'Tuning',
};

export const MAINTENANCE_TYPE_VARIANTS: Record<
  MaintenanceLog['type'],
  'info' | 'warning' | 'danger' | 'success' | 'neutral'
> = {
  routine: 'info',
  repair: 'warning',
  replacement: 'danger',
  cleaning: 'success',
  tuning: 'neutral',
};

/** Dot colour per maintenance type, for the timeline rail. */
export const MAINTENANCE_TYPE_DOT: Record<MaintenanceLog['type'], string> = {
  routine: 'bg-blue-500',
  repair: 'bg-amber-500',
  replacement: 'bg-red-600',
  cleaning: 'bg-emerald-500',
  tuning: 'bg-stone-400',
};

/** Group logs by month (YYYY-MM), newest first, preserving order within a month. */
export function groupLogsByMonth(
  logs: MaintenanceLog[],
): { month: string; logs: MaintenanceLog[] }[] {
  const sorted = [...logs].sort((a, b) => b.service_date.localeCompare(a.service_date));
  const groups: { month: string; logs: MaintenanceLog[] }[] = [];
  for (const log of sorted) {
    const month = log.service_date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.logs.push(log);
    else groups.push({ month, logs: [log] });
  }
  return groups;
}

/** Format a YYYY-MM key as a readable month label. */
export function formatMonthLabel(month: string): string {
  const d = new Date(`${month}-01T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
