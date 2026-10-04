interface FormGaugeProps {
  tsb: number; // Training Stress Balance
  ctl: number; // Chronic Training Load
  atl: number; // Acute Training Load
}

function getFormLabel(tsb: number): { label: string; color: string; bg: string } {
  if (tsb <= -30) return { label: 'Very Fatigued', color: 'text-red-800', bg: 'bg-red-50' };
  if (tsb <= -10) return { label: 'Fatigued', color: 'text-amber-800', bg: 'bg-amber-50' };
  if (tsb <= 5) return { label: 'Neutral', color: 'text-amber-800', bg: 'bg-amber-50' };
  if (tsb <= 20) return { label: 'Fresh', color: 'text-emerald-800', bg: 'bg-emerald-50' };
  return { label: 'Very Fresh', color: 'text-emerald-800', bg: 'bg-emerald-50' };
}

export function FormGauge({ tsb, ctl, atl }: FormGaugeProps) {
  const { label, color, bg } = getFormLabel(tsb);

  // Map TSB to a percentage for the gauge bar (-50 to +30 range → 0-100%)
  const minTsb = -50;
  const maxTsb = 30;
  const pct = Math.min(100, Math.max(0, ((tsb - minTsb) / (maxTsb - minTsb)) * 100));

  // Color gradient: red → yellow → green
  const barColor =
    tsb <= -20 ? '#ef4444' : tsb <= -5 ? '#f97316' : tsb <= 10 ? '#eab308' : '#22c55e';

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Form (TSB)</h3>
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${bg} ${color}`}>{label}</span>
      </div>

      {/* Gauge bar */}
      <div className="mb-3">
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-3 rounded-full transition-[width] duration-500"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>-50</span>
          <span className="font-semibold" style={{ color: barColor }}>
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
