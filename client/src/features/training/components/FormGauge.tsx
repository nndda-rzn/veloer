import type { FormTone } from '../lib/form-tone';
import { formLabel, formTone } from '../lib/form-tone';
import { cn } from '@/lib/utils';

interface FormGaugeProps {
  tsb: number; // Training Stress Balance
  ctl: number; // Chronic Training Load
  atl: number; // Acute Training Load
}

/** Tone -> bar fill and pill colours, all from the design tokens. */
const TONE_STYLES: Record<FormTone, { bar: string; pill: string }> = {
  danger: { bar: 'bg-danger', pill: 'bg-red-50 text-danger' },
  warning: { bar: 'bg-warning', pill: 'bg-amber-50 text-warning' },
  neutral: { bar: 'bg-stone-400', pill: 'bg-secondary text-muted-foreground' },
  success: { bar: 'bg-success', pill: 'bg-emerald-50 text-success' },
};

export function FormGauge({ tsb, ctl, atl }: FormGaugeProps) {
  const tone = formTone(tsb);
  const styles = TONE_STYLES[tone];

  // Map TSB to a percentage for the gauge bar (-50 to +30 range -> 0-100%)
  const minTsb = -50;
  const maxTsb = 30;
  const pct = Math.min(100, Math.max(0, ((tsb - minTsb) / (maxTsb - minTsb)) * 100));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Form (TSB)</h3>
        <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', styles.pill)}>
          {formLabel(tsb)}
        </span>
      </div>

      {/* Gauge bar */}
      <div className="mb-3">
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn('h-3 rounded-full transition-[width] duration-500', styles.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>-50</span>
          <span className="font-semibold tabular-nums text-foreground">
            {tsb > 0 ? '+' : ''}
            {tsb}
          </span>
          <span>+30</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md bg-secondary p-1.5">
          <div className="font-mono font-semibold tabular-nums text-foreground">{ctl}</div>
          <div className="text-muted-foreground">Fitness</div>
        </div>
        <div className="rounded-md bg-secondary p-1.5">
          <div className="font-mono font-semibold tabular-nums text-foreground">{atl}</div>
          <div className="text-muted-foreground">Fatigue</div>
        </div>
        <div className="rounded-md bg-secondary p-1.5">
          <div className="font-mono font-semibold tabular-nums text-foreground">
            {tsb > 0 ? '+' : ''}
            {tsb}
          </div>
          <div className="text-muted-foreground">Form</div>
        </div>
      </div>
    </div>
  );
}
