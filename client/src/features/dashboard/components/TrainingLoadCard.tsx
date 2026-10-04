import { Zap, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { TrainingLoadChart } from '@/features/training/components/TrainingLoadChart';
import type { FitnessAnalysis, TrainingLoadDataPoint } from '@/features/training';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formFromLoad, type FormStatus } from '../lib/metrics';
import { MetricTooltip } from './MetricTooltip';

interface TrainingLoadCardProps {
  loadHistory: TrainingLoadDataPoint[];
  fitness: FitnessAnalysis | null;
  loading: boolean;
}

type Tone = FormStatus;

const toneStyles: Record<Tone, { chip: string; Icon: typeof Zap }> = {
  fresh: { chip: 'bg-emerald-50 text-emerald-800', Icon: TrendingUp },
  balanced: { chip: 'bg-blue-50 text-blue-800', Icon: Minus },
  fatigued: { chip: 'bg-amber-50 text-amber-800', Icon: TrendingDown },
  rested: { chip: 'bg-secondary text-muted-foreground', Icon: Minus },
};

/**
 * What each form band means for the next few days, in the rider's language.
 * Sourced from the common CTL/ATL/TSB interpretation used by TrainingPeaks,
 * intervals.icu and coaching guides.
 */
const FORM_GUIDANCE: Record<Tone, string> = {
  fresh:
    'You are carrying little fatigue relative to fitness. Good place to race or do a hard session.',
  balanced: 'Productive overload. Keep building, but keep an eye on how the legs feel.',
  fatigued: 'Fatigue is well above fitness. Consider an easier week before the next hard block.',
  rested: 'Not enough recent training to judge form yet.',
};

export function TrainingLoadCard({ loadHistory, fitness, loading }: TrainingLoadCardProps) {
  const latest = loadHistory[loadHistory.length - 1];
  const ctl = latest?.ctl ?? 0;
  const atl = latest?.atl ?? 0;
  const tsb = Math.round((ctl - atl) * 10) / 10;
  const form = formFromLoad(ctl, atl);

  const ftpLabel = fitness?.estimated_ftp ? `${fitness.estimated_ftp}W` : '–';
  const weeklyTss = fitness?.avg_weekly_tss ?? null;
  const confidence = fitness?.ftp_confidence ?? null;

  if (loading) {
    return <div className="h-80 animate-pulse rounded-lg bg-secondary" />;
  }

  const hasData = loadHistory.length > 0;

  if (!hasData && !fitness) {
    return (
      <Card>
        <CardContent>
          <h2 className="text-h3 font-semibold text-foreground">Training Load</h2>
          <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-secondary px-6 py-10 text-center">
            <Zap className="h-6 w-6 text-stone-300" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">No training load yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Sync sessions with power or heart rate data to track fitness (CTL) and fatigue (ATL)
              over time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const styles = toneStyles[form.status];
  const FormIcon = styles.Icon;

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-h3 font-semibold text-foreground">Training Load</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Last 8 weeks</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <StatPill label="Est. FTP" value={ftpLabel} />
            {weeklyTss != null && <StatPill label="Weekly TSS" value={`${weeklyTss.toFixed(0)}`} />}
          </div>
        </div>

        {/* Form (TSB) is the actionable number, so it leads. */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {tsb > 0 ? '+' : ''}
            {tsb.toFixed(0)}
          </span>
          <span className="text-sm text-muted-foreground">
            <MetricTooltip metric="TSB">Form</MetricTooltip>
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              styles.chip,
            )}
          >
            <FormIcon className="h-3 w-3" aria-hidden="true" />
            {form.label}
          </span>
        </div>
        <p className="mt-1.5 max-w-prose text-xs text-muted-foreground">
          {FORM_GUIDANCE[form.status]}
        </p>

        {hasData ? (
          <div className="mt-4">
            <TrainingLoadChart data={loadHistory} embedded />
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-secondary p-6 text-center text-xs text-muted-foreground">
            No load history yet. Keep syncing sessions to build your fitness trend.
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-muted-foreground">
              <MetricTooltip metric="CTL">CTL</MetricTooltip>
            </span>
            <span className="mt-0.5 block font-mono text-base font-semibold tabular-nums text-foreground">
              {ctl.toFixed(0)}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              <MetricTooltip metric="ATL">ATL</MetricTooltip>
            </span>
            <span className="mt-0.5 block font-mono text-base font-semibold tabular-nums text-foreground">
              {atl.toFixed(0)}
            </span>
          </div>
        </div>

        {confidence === 'low' && (
          <p className="mt-3 text-xs text-warning">
            FTP estimate has low confidence. Keep recording rides for better accuracy.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-foreground">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  );
}
