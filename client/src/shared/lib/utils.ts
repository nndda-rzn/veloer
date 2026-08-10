/**
 * Format distance in meters to kilometers
 */
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
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
 * Format speed from m/s to km/h
 */
export function formatSpeed(metersPerSecond: number): string {
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

/**
 * Format IDR currency
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
 * Format date to readable format
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
 * Get lifespan status color
 */
export function lifespanStatus(percentage: number): 'good' | 'warning' | 'danger' | 'overdue' {
  if (percentage >= 100) return 'overdue';
  if (percentage >= 90) return 'danger';
  if (percentage >= 70) return 'warning';
  return 'good';
}
