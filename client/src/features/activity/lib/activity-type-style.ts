/**
 * Subtle per-type accent colours for activity rows and badges.
 *
 * Kept deliberately restrained: a coloured dot / left rail, not a loud chip.
 * Colours are drawn from the design tokens so they stay consistent with the
 * rest of the app (see docs/20-design-system.md).
 */
export interface ActivityTypeAccent {
  /** Small solid dot / rail colour. */
  dot: string;
  /** Soft badge surface. */
  badge: string;
}

const ACCENTS: Record<string, ActivityTypeAccent> = {
  Ride: { dot: 'bg-primary', badge: 'bg-primary-50 text-primary-700' },
  VirtualRide: { dot: 'bg-info', badge: 'bg-blue-50 text-blue-800' },
  EBikeRide: { dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-800' },
  GravelRide: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-800' },
  MountainBikeRide: { dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-800' },
  Cyclocross: { dot: 'bg-teal-500', badge: 'bg-teal-50 text-teal-800' },
  Handcycle: { dot: 'bg-stone-500', badge: 'bg-secondary text-muted-foreground' },
  Velomobile: { dot: 'bg-stone-500', badge: 'bg-secondary text-muted-foreground' },
  // Strength sessions. One steel accent for the whole discipline, always paired
  // with the Dumbbell icon so colour is not the only signal.
  WeightTraining: { dot: 'bg-slate-600', badge: 'bg-slate-100 text-slate-700' },
  Workout: { dot: 'bg-slate-600', badge: 'bg-slate-100 text-slate-700' },
  Crossfit: { dot: 'bg-slate-600', badge: 'bg-slate-100 text-slate-700' },
};

const FALLBACK: ActivityTypeAccent = {
  dot: 'bg-stone-400',
  badge: 'bg-secondary text-muted-foreground',
};

export function activityTypeAccent(type: string): ActivityTypeAccent {
  return ACCENTS[type] ?? FALLBACK;
}
