import type { Event } from '../types/event';

export const EVENT_TYPE_LABELS: Record<Event['type'], string> = {
  race: 'Race',
  gran_fondo: 'Gran Fondo',
  charity: 'Charity',
  group_ride: 'Group Ride',
  tour: 'Tour',
  other: 'Other',
};

/** Brand-harmonised colour per event type (used by the calendar). */
export const EVENT_TYPE_COLORS: Record<Event['type'], string> = {
  race: '#b91c1c',
  gran_fondo: '#0f6e4e',
  charity: '#7c3aed',
  group_ride: '#2563eb',
  tour: '#c2410c',
  other: '#78716c',
};

export const EVENT_STATUS_LABELS: Record<Event['status'], string> = {
  registered: 'Registered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  dns: 'DNS',
  dnf: 'DNF',
};

export const EVENT_STATUS_VARIANTS: Record<
  Event['status'],
  'info' | 'success' | 'neutral' | 'warning' | 'danger'
> = {
  registered: 'info',
  completed: 'success',
  cancelled: 'neutral',
  dns: 'warning',
  dnf: 'danger',
};

/** A status is "past" when the event is over and not merely registered. */
export function isPastEvent(event: Event): boolean {
  return event.status !== 'registered' && event.status !== 'dns';
}

/** Whole days from today until the event date (negative = past). */
export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Human countdown label for an upcoming event. */
export function countdownLabel(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 1) return `In ${days} days`;
  if (days === -1) return 'Yesterday';
  return `${Math.abs(days)} days ago`;
}
