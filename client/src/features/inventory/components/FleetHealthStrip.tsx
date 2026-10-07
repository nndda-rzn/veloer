import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { FleetHealth } from '../lib/garage-metrics';

interface FleetHealthStripProps {
  health: FleetHealth;
}

/**
 * One-line fleet status band. Deliberately not a KPI card row: the garage is a
 * small, personal collection, so the useful signal is "what needs attention",
 * expressed as a sentence with clickable worst offenders.
 */
export function FleetHealthStrip({ health }: FleetHealthStripProps) {
  const totalIssues = health.overdue + health.dueSoon;

  if (totalIssues === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
        <p className="text-sm text-foreground">
          All gear healthy
          <span className="text-muted-foreground">
            {' '}
            · {health.ok} {health.ok === 1 ? 'component' : 'components'} within lifespan
          </span>
        </p>
      </div>
    );
  }

  const topAlerts = health.alerts.slice(0, 3);
  const remaining = health.alerts.length - topAlerts.length;

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {health.overdue > 0 && <span>{health.overdue} past lifespan</span>}
          {health.overdue > 0 && health.dueSoon > 0 && (
            <span className="text-muted-foreground">·</span>
          )}
          {health.dueSoon > 0 && <span className="font-normal">{health.dueSoon} due soon</span>}
        </span>

        <span className="hidden text-muted-foreground sm:inline" aria-hidden="true">
          ·
        </span>

        <ul className="flex flex-wrap items-center gap-1.5">
          {topAlerts.map((alert) => (
            <li key={alert.componentId}>
              <Link
                to={`/inventory/${alert.bikeId}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-xs transition-colors hover:border-stone-300 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={`${alert.bikeName} · ${alert.componentName}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    alert.band === 'overdue' ? 'bg-red-600' : 'bg-orange-500'
                  }`}
                  aria-hidden="true"
                />
                <span className="font-medium text-foreground">{alert.componentName}</span>
                <span className="tabular-nums text-muted-foreground">{alert.percent}%</span>
              </Link>
            </li>
          ))}
          {remaining > 0 && <li className="text-xs text-muted-foreground">+{remaining} more</li>}
        </ul>
      </div>
    </div>
  );
}
