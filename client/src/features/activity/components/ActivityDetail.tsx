import type { Activity } from '../types/activity';
import { formatDistance, formatDuration, formatSpeed, formatDateTime } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { activityTypeAccent } from '../lib/activity-type-style';
import { tssTone, tssToneClass } from '../lib/activity-grouping';
import { cn } from '@/lib/utils';

interface ActivityDetailProps {
  activity: Activity;
}

interface Metric {
  label: string;
  value: string;
  hint?: string;
}

const dash = '–';

function m(label: string, value: string | null | undefined, hint?: string): Metric {
  return { label, value: value ?? dash, hint };
}

export function ActivityDetail({ activity }: ActivityDetailProps) {
  const accent = activityTypeAccent(activity.type);

  const summary: Metric[] = [
    m('Distance', formatDistance(activity.distance)),
    m('Moving Time', formatDuration(activity.moving_time)),
    m('Elapsed Time', formatDuration(activity.elapsed_time)),
    m(
      'Elevation Gain',
      activity.total_elevation_gain != null
        ? `${activity.total_elevation_gain.toFixed(0)} m`
        : null,
    ),
    m('Avg Speed', activity.avg_speed ? formatSpeed(activity.avg_speed) : null),
    m('Max Speed', activity.max_speed ? formatSpeed(activity.max_speed) : null),
    m('Elev. High', activity.elev_high != null ? `${activity.elev_high.toFixed(0)} m` : null),
    m('Elev. Low', activity.elev_low != null ? `${activity.elev_low.toFixed(0)} m` : null),
  ];

  const performance: Metric[] = [
    m('Avg Power', activity.avg_watts ? `${activity.avg_watts.toFixed(0)} W` : null),
    m(
      'Normalized Power',
      activity.weighted_avg_watts ? `${activity.weighted_avg_watts.toFixed(0)} W` : null,
    ),
    m('Max Power', activity.max_watts ? `${activity.max_watts.toFixed(0)} W` : null),
    m('Energy', activity.kilojoules ? `${activity.kilojoules.toFixed(0)} kJ` : null),
    m('Avg Cadence', activity.avg_cadence ? `${activity.avg_cadence.toFixed(0)} rpm` : null),
    m('Max Cadence', activity.max_cadence ? `${activity.max_cadence.toFixed(0)} rpm` : null),
    m('Training Load', activity.tss != null ? `${activity.tss.toFixed(0)} TSS` : null),
    m('Calories', activity.calories ? `${activity.calories.toFixed(0)} kcal` : null),
  ];

  const body: Metric[] = [
    m('Avg Heart Rate', activity.avg_hr != null ? `${activity.avg_hr} bpm` : null),
    m('Max Heart Rate', activity.max_hr != null ? `${activity.max_hr} bpm` : null),
    m('Avg Temp', activity.avg_temp != null ? `${activity.avg_temp.toFixed(1)} °C` : null),
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2.5">
          <span className={cn('h-2.5 w-2.5 rounded-full', accent.dot)} aria-hidden="true" />
          <h3 className="text-xl font-semibold text-foreground">{activity.name}</h3>
          <Badge variant="neutral">{activity.type}</Badge>
          {activity.device_watts && <Badge variant="success">Power meter</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDateTime(activity.start_date)}
          {activity.tss != null && (
            <>
              {' · '}
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums',
                  tssToneClass[tssTone(activity.tss)],
                )}
              >
                {activity.tss.toFixed(0)} TSS
              </span>
            </>
          )}
        </p>
      </div>

      <MetricSection title="Summary" metrics={summary} />
      <MetricSection title="Performance" metrics={performance} />
      <MetricSection title="Heart & Environment" metrics={body} />
    </div>
  );
}

function MetricSection({ title, metrics }: { title: string; metrics: Metric[] }) {
  return (
    <section>
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} size="sm">
            <CardContent>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
                {metric.value}
              </p>
              {metric.hint && <p className="text-xs text-muted-foreground">{metric.hint}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
