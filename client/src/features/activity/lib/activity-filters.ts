import type { Activity } from '../types/activity';
import {
  inRange,
  lastDaysNDays,
  monthToDate,
  previousRange,
  rangeDays,
  yearToDate,
  type DateRange,
} from '@/shared/lib/metrics';

export type DatePreset = '7d' | '30d' | 'month' | 'year' | 'all' | 'custom';

export interface ActivityQuery {
  preset: DatePreset;
  /** Only read when preset === 'custom'. */
  range: DateRange;
  type: string;
  bikeId: string;
}

export const ALL = 'all';

export const defaultActivityQuery: ActivityQuery = {
  preset: '30d',
  range: { start: '', end: '' },
  type: ALL,
  bikeId: ALL,
};

export interface DatePresetOption {
  value: DatePreset;
  label: string;
}

export const DATE_PRESETS: DatePresetOption[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom' },
];

/**
 * Resolve the active query into a concrete inclusive date range.
 * Returns null when the preset means "no date bound" (all time, or an
 * incomplete custom range).
 */
export function resolveRange(query: ActivityQuery, today: Date = new Date()): DateRange | null {
  switch (query.preset) {
    case '7d':
      return lastDaysNDays(7, today);
    case '30d':
      return lastDaysNDays(30, today);
    case 'month':
      return monthToDate(today);
    case 'year':
      return yearToDate(today);
    case 'all':
      return null;
    case 'custom':
      return query.range.start && query.range.end ? query.range : null;
  }
}

export interface ActivitySummary {
  count: number;
  distance: number;
  movingTime: number;
  elevationGain: number;
  tss: number;
  /** True when at least one activity in the set carries a TSS value. */
  hasTss: boolean;
  /** Mean distance per ride, in meters. */
  avgDistance: number;
}

export interface ActivityQueryResult {
  /** Activities matching the query, newest first. */
  rows: Activity[];
  range: DateRange | null;
  summary: ActivitySummary;
  /** Summary for the equivalent window immediately before `range`, if any. */
  previous: ActivitySummary | null;
}

export function summarizeActivities(activities: Activity[]): ActivitySummary {
  let distance = 0;
  let movingTime = 0;
  let elevationGain = 0;
  let tss = 0;
  let hasTss = false;

  for (const a of activities) {
    distance += Number(a.distance) || 0;
    movingTime += Number(a.moving_time) || 0;
    elevationGain += Number(a.total_elevation_gain) || 0;
    if (a.tss != null) {
      tss += Number(a.tss) || 0;
      hasTss = true;
    }
  }

  const count = activities.length;
  return {
    count,
    distance,
    movingTime,
    elevationGain,
    tss,
    hasTss,
    avgDistance: count > 0 ? distance / count : 0,
  };
}

/**
 * Apply the date preset, activity-type and bike filters to a full activity
 * list, then compute the summary for the window and the window before it.
 */
export function filterActivities(
  activities: Activity[],
  query: ActivityQuery,
  today: Date = new Date(),
): ActivityQueryResult {
  const range = resolveRange(query, today);

  const rows = activities
    .filter((a) => {
      if (range && !inRange(a.start_date, range)) return false;
      if (query.type !== ALL && a.type !== query.type) return false;
      if (query.bikeId !== ALL && a.bike_id !== query.bikeId) return false;
      return true;
    })
    .sort((a, b) => b.start_date.localeCompare(a.start_date));

  const summary = summarizeActivities(rows);

  let previous: ActivitySummary | null = null;
  if (range) {
    const prevRange = previousRange(range, rangeDays(range));
    previous = summarizeActivities(
      activities.filter(
        (a) =>
          inRange(a.start_date, prevRange) &&
          (query.type === ALL || a.type === query.type) &&
          (query.bikeId === ALL || a.bike_id === query.bikeId),
      ),
    );
  }

  return { rows, range, summary, previous };
}

/** Distinct activity types present in the data, alphabetically. */
export function activityTypeOptions(activities: Activity[]): string[] {
  return [...new Set(activities.map((a) => a.type))].sort();
}

/** Distinct bike ids present in the data. */
export function activityBikeIds(activities: Activity[]): string[] {
  return [...new Set(activities.map((a) => a.bike_id).filter((id): id is string => !!id))];
}
