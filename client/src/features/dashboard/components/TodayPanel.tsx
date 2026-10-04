import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import type { DashboardAlert, DashboardAlertLevel } from '../lib/dashboard-alerts';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TodayPanelProps {
  alerts: DashboardAlert[];
  loading: boolean;
}

const LEVEL_STYLES: Record<
  DashboardAlertLevel,
  { icon: typeof AlertTriangle; dot: string; text: string }
> = {
  critical: { icon: AlertTriangle, dot: 'bg-red-600', text: 'text-red-700' },
  warning: { icon: AlertTriangle, dot: 'bg-amber-500', text: 'text-amber-700' },
  info: { icon: Info, dot: 'bg-blue-500', text: 'text-blue-700' },
};

/**
 * One place that answers "what needs my attention today?". Warnings used to be
 * spread across four widgets, so nothing on the dashboard actually said what to
 * do next. Each row links to the screen where it can be resolved.
 */
export function TodayPanel({ alerts, loading }: TodayPanelProps) {
  if (loading) {
    return <div className="h-24 animate-pulse rounded-lg bg-secondary" />;
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
        <p className="text-sm text-foreground">
          All clear
          <span className="text-muted-foreground"> · nothing needs attention today</span>
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-h3 font-semibold text-foreground">Today</h2>
          <p className="text-xs tabular-nums text-muted-foreground">
            {alerts.length} item{alerts.length === 1 ? '' : 's'}
          </p>
        </div>

        <ul className="divide-y divide-border">
          {alerts.map((alert) => {
            const style = LEVEL_STYLES[alert.level];
            const Icon = style.icon;
            return (
              <li key={alert.id}>
                <Link
                  to={alert.href}
                  className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className={cn('h-4 w-4 shrink-0', style.text)} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {alert.title}
                    </span>
                    {alert.detail && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {alert.detail}
                      </span>
                    )}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
