import { Zap, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { TrainingLoadChart } from '@/features/training/components/TrainingLoadChart';
import type { FitnessAnalysis, TrainingLoadDataPoint } from '@/features/training';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formFromLoad } from '../lib/metrics';

interface TrainingLoadCardProps {
  loadHistory: TrainingLoadDataPoint[];
  fitness: FitnessAnalysis | null;
  loading: boolean;
}

type Tone = 'fresh' | 'balanced' | 'fatigued' | 'rested';

const toneStyles: Record<Tone, { chip: string; Icon: typeof Zap }> = {
  fresh: { chip: 'bg-emerald-50 text-emerald-800', Icon: TrendingUp },
  balanced: { chip: 'bg-blue-50 text-blue-800', Icon: Minus },
  fatigued: { chip: 'bg-amber-50 text-amber-800', Icon: TrendingDown },
  rested: { chip: 'bg-secondary text-muted-foreground', Icon: Minus },
};

export function TrainingLoadCard({ loadHistory, fitness, loading }: TrainingLoadCardProps) {
  const latest = loadHistory[loadHistory.length - 1];
  const ctl = latest?.ctl ?? 0;
  const atl = latest?.atl ?? 0;
  const form = formFromLoad(ctl, atl);

  const ftpLabel = fitness?.estimated_ftp ? `${fitness.estimated_ftp}W` : '—';
  const weeklyTss = fitness?.avg_weekly_tss ?? null;
  const confidence = fitness?.ftp_confidence ?? null;

  if (loading) {
    return <div className="h-80 animate-pulse rounded-xl bg-secondary" />;
  }

  const hasData = loadHistory.length > 0;

  if (!hasData && !fitness) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Training Load</h3>
          </div>
          <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-secondary px-6 py-10 text-center">
            <Zap className="h-6 w-6 text-stone-300" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">No training load yet</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Sync rides with power meter data to track fitness (CTL) and fatigue (ATL) over time.
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">Training Load</h3>
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
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <StatPill label="Est. FTP" value={ftpLabel} />
            {weeklyTss != null && <StatPill label="Weekly TSS" value={`${weeklyTss.toFixed(0)}`} />}
          </div>
        </div>

        {hasData ? (
          <TrainingLoadChart data={loadHistory} embedded />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-secondary p-6 text-center text-xs text-muted-foreground">
            No load history yet — keep syncing rides to build your fitness trend.
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              CTL
            </span>
            <span className="text-base font-semibold tabular-nums text-foreground">
              {ctl.toFixed(0)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              ATL
            </span>
            <span className="text-base font-semibold tabular-nums text-foreground">
              {atl.toFixed(0)}
            </span>
          </div>
        </div>

        {confidence === 'low' && (
          <p className="mt-3 text-xs text-warning">
            FTP estimate has low confidence — keep recording rides for better accuracy.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-foreground">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  );
}
