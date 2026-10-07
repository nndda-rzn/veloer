import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import type { Activity } from '../types/activity';
import { tssTone, tssToneClass } from '../lib/activity-grouping';
import { cn } from '@/lib/utils';

interface TrainingLoadSummaryProps {
  activity: Activity;
  ftp: number | null;
}

/**
 * FTP-derived training metrics. Raw power/cadence/calories live in the Summary
 * and Performance groups on the overview, so this card only adds what those
 * cannot: Intensity Factor and the FTP-normalised Training Load.
 */
export function TrainingLoadSummary({ activity, ftp }: TrainingLoadSummaryProps) {
  const np = activity.weighted_avg_watts;
  const durationHours = activity.moving_time / 3600;

  const ifValue = np && ftp && ftp > 0 ? np / ftp : null;
  const tss = ifValue != null ? durationHours * ifValue * ifValue * 100 : null;

  const cards = [
    {
      label: 'Intensity Factor',
      value: ifValue != null ? ifValue.toFixed(2) : '–',
      hint: ftp ? `FTP ${ftp} W` : undefined,
    },
    {
      label: 'Training Load',
      value: tss != null ? tss.toFixed(0) : '–',
      hint: tss != null ? 'TSS from FTP' : undefined,
      tone: tss != null ? tssToneClass[tssTone(tss)] : undefined,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
              {card.tone ? (
                <span className={cn('inline-flex rounded-md px-1.5 py-0.5', card.tone)}>
                  {card.value}
                </span>
              ) : (
                card.value
              )}
            </p>
            {card.hint && <p className="text-xs text-muted-foreground">{card.hint}</p>}
          </div>
        ))}
      </div>

      {!ftp && np != null && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Zap className="h-3.5 w-3.5" aria-hidden="true" />
          <Link to="/settings" className="text-primary hover:underline">
            Set your FTP in Settings
          </Link>{' '}
          to unlock Intensity Factor and FTP-based Training Load.
        </p>
      )}
    </div>
  );
}
