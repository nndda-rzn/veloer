interface FormGaugeProps {
  tsb: number; // Training Stress Balance
  ctl: number; // Chronic Training Load
  atl: number; // Acute Training Load
}

function getFormLabel(tsb: number): { label: string; color: string; bg: string } {
  if (tsb <= -30) return { label: 'Very Fatigued', color: 'text-red-700', bg: 'bg-red-100' };
  if (tsb <= -10) return { label: 'Fatigued', color: 'text-orange-700', bg: 'bg-orange-100' };
  if (tsb <= 5) return { label: 'Neutral', color: 'text-yellow-700', bg: 'bg-yellow-100' };
  if (tsb <= 20) return { label: 'Fresh', color: 'text-green-700', bg: 'bg-green-100' };
  return { label: 'Very Fresh', color: 'text-emerald-700', bg: 'bg-emerald-100' };
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
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Form (TSB)</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${color}`}>
          {label}
        </span>
      </div>

      {/* Gauge bar */}
      <div className="mb-3">
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>-50</span>
          <span className="font-bold" style={{ color: barColor }}>
            {tsb > 0 ? '+' : ''}
            {tsb}
          </span>
          <span>+30</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded bg-blue-50 p-1.5">
          <div className="font-bold text-blue-700">{ctl}</div>
          <div className="text-gray-500">Fitness</div>
        </div>
        <div className="rounded bg-orange-50 p-1.5">
          <div className="font-bold text-orange-700">{atl}</div>
          <div className="text-gray-500">Fatigue</div>
        </div>
        <div className="rounded p-1.5" style={{ backgroundColor: `${barColor}15` }}>
          <div className="font-bold" style={{ color: barColor }}>
            {tsb > 0 ? '+' : ''}
            {tsb}
          </div>
          <div className="text-gray-500">Form</div>
        </div>
      </div>
    </div>
  );
}
