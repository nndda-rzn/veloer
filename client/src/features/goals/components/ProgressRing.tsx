interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

/** Status colour thresholds, aligned with the lifespan indicators. */
function ringColor(clamped: number): string {
  if (clamped >= 100) return 'var(--color-primary)';
  if (clamped >= 70) return 'var(--color-warning)';
  if (clamped >= 40) return 'var(--color-accent, #c2410c)';
  return 'var(--color-danger)';
}

export function ProgressRing({ percentage, size = 80, strokeWidth = 8 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clamped / 100) * circumference;
  const color = ringColor(clamped);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={`${clamped.toFixed(0)}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-secondary)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-semibold tabular-nums text-foreground">
          {clamped.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
