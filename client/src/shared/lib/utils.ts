import { getFormatting } from './format-prefs';

const METERS_PER_MILE = 1609.344;
const METERS_PER_FOOT = 0.3048;

/**
 * Format distance in meters, honouring the rider's unit preference.
 * Returns an en dash when there is no distance (a strength session has none),
 * so a missing distance never reads as "0.0 km" or "NaN km".
 */
export function formatDistance(meters: number | null | undefined): string {
  if (meters == null) return '–';
  const { units } = getFormatting();
  if (units === 'imperial') {
    return `${(meters / METERS_PER_MILE).toFixed(1)} mi`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration in seconds to human readable
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Format speed from m/s, honouring the rider's unit preference.
 */
export function formatSpeed(metersPerSecond: number): string {
  const { units } = getFormatting();
  if (units === 'imperial') {
    return `${(metersPerSecond * 2.236936).toFixed(1)} mph`;
  }
  return `${(metersPerSecond * 3.6).toFixed(1)} km/h`;
}

/**
 * Format an elevation in meters, honouring the rider's unit preference.
 * Elevation was previously hardcoded to metres at each call site.
 */
export function formatElevation(meters: number): string {
  const { units } = getFormatting();
  if (units === 'imperial') {
    return `${(meters / METERS_PER_FOOT).toFixed(0)} ft`;
  }
  return `${meters.toFixed(0)} m`;
}

/**
 * Format IDR currency.
 *
 * Amounts are stored in IDR throughout the database, so this is intentionally
 * not configurable: showing a different currency without a conversion rate
 * would misstate the value by orders of magnitude.
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to readable format, in the rider's timezone.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const { timezone } = getFormatting();
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  });
}

/**
 * Format date with time, in the rider's timezone.
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const { timezone } = getFormatting();
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });
}

/**
 * Calculate lifespan percentage
 */
export function lifespanPercentage(currentKm: number, expectedLifespanKm: number): number {
  if (!expectedLifespanKm || expectedLifespanKm === 0) return 0;
  return Math.min(100, (currentKm / expectedLifespanKm) * 100);
}

/**
 * Format activity type from camelCase to readable
 * 'VirtualRide' -> 'Virtual Ride', 'Ride' -> 'Ride'
 */
export function formatActivityType(type: string): string {
  return type.replace(/([A-Z])/g, ' $1').trim();
}

/**
 * Format enum label from snake_case to Title Case
 * 'bike_parts' -> 'Bike Parts', 'planned' -> 'Planned'
 */
export function formatEnumLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get lifespan status color
 */
export function lifespanStatus(percentage: number): 'good' | 'warning' | 'danger' | 'overdue' {
  if (percentage >= 100) return 'overdue';
  if (percentage >= 90) return 'danger';
  if (percentage >= 70) return 'warning';
  return 'good';
}
