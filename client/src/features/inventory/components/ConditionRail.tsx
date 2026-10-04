import type { Component } from '../types/inventory';
import { CATEGORY_ORDER, categoryWear, type CategoryWear } from '../lib/garage-metrics';
import { CATEGORY_LABELS } from './ComponentCard';
import type { WearBand } from '../lib/inventory-metrics';
import { cn } from '@/lib/utils';

/**
 * Segment fill per wear band. Tokens are drawn from the design system's AA
 * palette; the rail never relies on colour alone (every band also has a label
 * and a numeric percentage elsewhere on the card).
 */
const SEGMENT_FILL: Record<WearBand, string> = {
  good: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-orange-500',
  overdue: 'bg-red-600',
  unknown: 'bg-stone-300',
};

const EMPTY_TRACK = 'bg-stone-200';

interface ConditionRailProps {
  components: Component[];
  /** Show category labels under the rail. Off by default for compact cards. */
  labelled?: boolean;
}

/**
 * A compact "condition report" for a bike: one segment per component category,
 * filled by the wear of the most-worn component in that category. A category
 * with no components renders an empty track.
 */
export function ConditionRail({ components, labelled = false }: ConditionRailProps) {
  const segments = categoryWear(components);
  const summary = summarize(segments);

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1" role="img" aria-label={summary}>
        {segments.map((seg) => (
          <Segment key={seg.category} seg={seg} />
        ))}
      </div>
      {labelled && (
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          {CATEGORY_ORDER.map((c) => (
            <span key={c}>{CATEGORY_LABELS[c].slice(0, 3)}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function Segment({ seg }: { seg: CategoryWear }) {
  const fill = seg.count === 0 ? EMPTY_TRACK : SEGMENT_FILL[seg.band];
  const label =
    seg.count === 0
      ? `${CATEGORY_LABELS[seg.category]}: no components`
      : `${CATEGORY_LABELS[seg.category]}: ${seg.percent != null ? Math.round(seg.percent) : 0} percent worn`;

  return (
    <span
      className={cn('h-1.5 flex-1 rounded-full transition-colors', fill)}
      title={label}
      aria-label={label}
    />
  );
}

/** Human summary used as the rail's accessible name. */
function summarize(segments: CategoryWear[]): string {
  const worn = segments.filter((s) => s.count > 0);
  if (worn.length === 0) return 'No components tracked';
  const parts = worn.map(
    (s) =>
      `${CATEGORY_LABELS[s.category]} ${s.percent != null ? Math.round(s.percent) : 0} percent`,
  );
  return `Component condition — ${parts.join(', ')}`;
}

export { SEGMENT_FILL };
