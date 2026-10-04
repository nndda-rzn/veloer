/**
 * Coggan power zones, derived from FTP.
 *
 * Shown as a preview next to the FTP field so the rider can see what their
 * number actually means, rather than typing a figure and guessing.
 * Boundaries are the standard percentage-of-FTP bands.
 */
export interface PowerZone {
  zone: number;
  label: string;
  /** Inclusive lower bound in watts. */
  from: number;
  /** Exclusive upper bound in watts. */
  to: number;
}

const BANDS: { zone: number; label: string; low: number; high: number }[] = [
  { zone: 1, label: 'Recovery', low: 0, high: 0.55 },
  { zone: 2, label: 'Endurance', low: 0.55, high: 0.75 },
  { zone: 3, label: 'Tempo', low: 0.75, high: 0.9 },
  { zone: 4, label: 'Threshold', low: 0.9, high: 1.05 },
  { zone: 5, label: 'VO2 max', low: 1.05, high: 1.2 },
  { zone: 6, label: 'Anaerobic', low: 1.2, high: 1.5 },
  { zone: 7, label: 'Sprint', low: 1.5, high: Number.POSITIVE_INFINITY },
];

/** Zones for a given FTP. Returns an empty list when FTP is unusable. */
export function powerZones(ftp: number | null): PowerZone[] {
  if (ftp == null || ftp <= 0) return [];
  return BANDS.map((band) => ({
    zone: band.zone,
    label: band.label,
    from: Math.round(ftp * band.low),
    to: Number.isFinite(band.high) ? Math.round(ftp * band.high) : Number.POSITIVE_INFINITY,
  }));
}

/** A compact range string, e.g. 'Z2 138–188 W'. */
export function zoneRangeLabel(zone: PowerZone): string {
  const to = Number.isFinite(zone.to) ? `${zone.to} W` : '+';
  return `Z${zone.zone} ${zone.from}–${to}`;
}
