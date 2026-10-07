import { wearPercent, remainingKm, lifespanBar, lifespanTextColor } from '../lib/lifespan';

interface LifespanIndicatorProps {
  currentKm: number;
  installKm: number;
  expectedLifespanKm: number | null;
}

export function LifespanIndicator({
  currentKm,
  installKm,
  expectedLifespanKm,
}: LifespanIndicatorProps) {
  const percentage = wearPercent(currentKm, installKm, expectedLifespanKm);

  if (percentage === null) {
    return (
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Lifespan
        </p>
        <p className="text-sm text-muted-foreground">Not set</p>
      </div>
    );
  }

  const remaining = remainingKm(currentKm, installKm, expectedLifespanKm) ?? 0;
  const barColor = lifespanBar[statusFromPercent(percentage)];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Lifespan
        </p>
        <p
          className={`text-xs font-medium tabular-nums ${lifespanTextColor(currentKm, installKm, expectedLifespanKm)}`}
        >
          {percentage.toFixed(0)}%
        </p>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-[width] ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-xs tabular-nums text-muted-foreground">
        {remaining > 0
          ? `${remaining.toFixed(0)} km remaining`
          : `${Math.abs(remaining).toFixed(0)} km overdue`}
      </p>
    </div>
  );
}

function statusFromPercent(pct: number): keyof typeof lifespanBar {
  if (pct >= 100) return 'overdue';
  if (pct >= 90) return 'danger';
  if (pct >= 70) return 'warning';
  return 'good';
}
