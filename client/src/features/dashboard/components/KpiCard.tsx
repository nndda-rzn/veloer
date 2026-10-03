import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { pctChange, trendDirection, type TrendDirection } from '../lib/metrics';

export interface KpiTrend {
  current: number;
  previous: number;
  higherIsBetter?: boolean;
  format?: (value: number) => string;
  unit?: string;
}

export interface KpiBudgetProgress {
  spent: number;
  budget?: number | null;
  formatter: (value: number) => string;
}

interface KpiCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: KpiTrend;
  progress?: KpiBudgetProgress;
  hint?: string;
  loading?: boolean;
}

const colorByTrend: Record<TrendDirection, { tone: string; icon: typeof ArrowUpRight }> = {
  up: { tone: 'text-emerald-700', icon: ArrowUpRight },
  down: { tone: 'text-red-700', icon: ArrowDownRight },
  flat: { tone: 'text-muted-foreground', icon: Minus },
  new: { tone: 'text-primary-700', icon: Sparkles },
};

export function KpiCard({
  label,
  value,
  icon,
  trend,
  progress,
  hint,
  loading = false,
}: KpiCardProps) {
  return (
    <Card className="transition-colors hover:border-input">
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {icon && (
            <span className="text-stone-300" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>
        {loading ? (
          <div className="mt-3 space-y-2">
            <div className="h-7 w-2/3 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
          </div>
        ) : (
          <>
            <p className="mt-2.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {value}
            </p>

            {trend && <KpiTrendIndicator trend={trend} />}
            {hint && !trend && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}

            {progress && progress.budget != null && progress.budget > 0 && (
              <div className="mt-3 space-y-1.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      'h-full rounded-full transition-[width]',
                      progress.spent > progress.budget ? 'bg-red-600' : 'bg-primary',
                    )}
                    style={{
                      width: `${Math.min(100, (progress.spent / progress.budget) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {progress.formatter(progress.spent)} of {progress.formatter(progress.budget)}
                </p>
              </div>
            )}

            {progress && (progress.budget == null || progress.budget <= 0) && (
              <p className="mt-3 text-xs text-muted-foreground">
                {progress.formatter(progress.spent)}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function KpiTrendIndicator({ trend }: { trend: KpiTrend }) {
  const change = pctChange(trend.current, trend.previous);
  const rawDirection = trendDirection(change);
  const higherIsBetter = trend.higherIsBetter ?? true;
  let effective: TrendDirection = rawDirection;
  let toneClass = colorByTrend[rawDirection].tone;
  if (rawDirection !== 'flat' && rawDirection !== 'new' && higherIsBetter === false) {
    effective = rawDirection === 'up' ? 'down' : 'up';
    toneClass = colorByTrend[effective].tone;
  }
  const Icon = colorByTrend[effective].icon;

  const formatNumber = trend.format ?? ((value: number) => String(value));
  const unit = trend.unit ?? '%';

  let label: string;
  if (rawDirection === 'new') {
    label = `New: ${formatNumber(change.delta)}`;
  } else if (rawDirection === 'flat') {
    label = 'No change';
  } else if (change.percent === null) {
    label = `+${formatNumber(change.delta)}`;
  } else {
    const sign = change.delta > 0 ? '+' : '';
    label = `${sign}${change.percent.toFixed(0)}${unit} vs prev 7d`;
  }

  return (
    <div className={cn('mt-2 inline-flex items-center gap-1 text-xs font-medium', toneClass)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span className="tabular-nums">{label}</span>
    </div>
  );
}
