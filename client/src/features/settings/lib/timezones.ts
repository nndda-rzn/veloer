/**
 * Timezone helpers for Settings.
 *
 * Rather than showing a 400-item list of IANA identifiers, we detect the zone
 * the device already reports and show a live local clock so the rider can
 * verify it at a glance. Editing is the exception, not the default.
 */

/** The zone the browser reports, falling back to the stored preference. */
export function detectTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

/** Current local time in a zone, e.g. '17:55'. */
export function localTimeIn(timezone: string, now: Date = new Date()): string {
  try {
    return now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    });
  } catch {
    return '–';
  }
}

/** Short zone label, e.g. 'GMT+7' for Asia/Jakarta. */
export function zoneAbbreviation(timezone: string, now: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    }).formatToParts(now);
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

/** Last path segment, e.g. 'Asia/Jakarta' -> 'Jakarta'. */
export function cityFromTimezone(timezone: string): string {
  return timezone.split('/').pop()?.replace(/_/g, ' ') ?? timezone;
}

/** All IANA zones the browser knows about, for the edit affordance. */
export function allTimezones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return [];
  }
}

/** Filter the zone list by a free-text query (city or full identifier). */
export function searchTimezones(query: string): string[] {
  const q = query.trim().toLowerCase();
  const zones = allTimezones();
  if (!q) return zones;
  return zones.filter((zone) => zone.toLowerCase().replace(/_/g, ' ').includes(q));
}
