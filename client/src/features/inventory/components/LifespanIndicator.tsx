import { lifespanPercentage, lifespanStatus } from '@/shared/lib/utils';
import { lifespanBar, lifespanText } from '../lib/lifespan';

interface LifespanIndicatorProps {
  currentKm: number;
  expectedLifespanKm: number | null;
}

export function LifespanIndicator({ currentKm, expectedLifespanKm }: LifespanIndicatorProps) {
  if (!expectedLifespanKm || expectedLifespanKm === 0) {
    return (
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Lifespan
        </p>
        <p className="text-sm text-muted-foreground">Not set</p>
      </div>
    );
  }

  const percentage = lifespanPercentage(currentKm, expectedLifespanKm);
  const status = lifespanStatus(percentage);
  const remainingKm = Math.max(0, expectedLifespanKm - currentKm);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Lifespan
        </p>
        <p className={`text-xs font-medium tabular-nums ${lifespanText[status]}`}>
          {percentage.toFixed(0)}%
        </p>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-[width] ${lifespanBar[status]}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      <p className="mt-1 text-xs tabular-nums text-muted-foreground">
        {remainingKm > 0
          ? `${remainingKm.toFixed(0)} km remaining`
          : `${Math.abs(remainingKm).toFixed(0)} km overdue`}
      </p>
    </div>
  );
}
