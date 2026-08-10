import { lifespanPercentage, lifespanStatus } from '@/shared/lib/utils';

interface LifespanIndicatorProps {
  currentKm: number;
  expectedLifespanKm: number | null;
}

const statusColors = {
  good: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-orange-500',
  overdue: 'bg-red-500',
};

const statusTextColors = {
  good: 'text-green-700',
  warning: 'text-yellow-700',
  danger: 'text-orange-700',
  overdue: 'text-red-700',
};

export function LifespanIndicator({ currentKm, expectedLifespanKm }: LifespanIndicatorProps) {
  if (!expectedLifespanKm || expectedLifespanKm === 0) {
    return (
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Lifespan</p>
        <p className="text-sm text-gray-500">Not set</p>
      </div>
    );
  }

  const percentage = lifespanPercentage(currentKm, expectedLifespanKm);
  const status = lifespanStatus(percentage);
  const remainingKm = Math.max(0, expectedLifespanKm - currentKm);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Lifespan</p>
        <p className={`text-xs font-medium ${statusTextColors[status]}`}>
          {percentage.toFixed(0)}%
        </p>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all ${statusColors[status]}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {remainingKm > 0
          ? `${remainingKm.toFixed(0)} km remaining`
          : `${Math.abs(remainingKm).toFixed(0)} km overdue`}
      </p>
    </div>
  );
}
