import { Link } from 'react-router-dom';
import type { Activity } from '../types/activity';

interface TrainingLoadSummaryProps {
  activity: Activity;
  ftp: number | null;
}

export function TrainingLoadSummary({ activity, ftp }: TrainingLoadSummaryProps) {
  const durationHours = activity.moving_time / 3600;

  // Intensity Factor (IF) = normalized power / FTP
  const np = activity.weighted_avg_watts;
  const ifValue = np && ftp && ftp > 0 ? np / ftp : null;

  // TSS = (duration_hours * IF^2 * 100)
  const tss = ifValue != null ? durationHours * ifValue * ifValue * 100 : null;

  const metrics = [
    {
      label: 'Avg Power',
      value: activity.avg_watts ? `${activity.avg_watts.toFixed(0)} W` : '-',
    },
    {
      label: 'Normalized Power',
      value: np ? `${np.toFixed(0)} W` : '-',
    },
    {
      label: 'Max Power',
      value: activity.max_watts ? `${activity.max_watts.toFixed(0)} W` : '-',
    },
    {
      label: 'Energy',
      value: activity.kilojoules ? `${activity.kilojoules.toFixed(0)} kJ` : '-',
    },
    {
      label: 'IF',
      value: ifValue != null ? ifValue.toFixed(2) : '-',
      hint: ftp ? `(FTP: ${ftp}W)` : null,
      hintLink: ftp ? null : { to: '/settings', label: 'Set FTP in Settings' },
    },
    {
      label: 'TSS',
      value: tss != null ? tss.toFixed(0) : '-',
    },
    {
      label: 'Avg Cadence',
      value: activity.avg_cadence ? `${activity.avg_cadence.toFixed(0)} rpm` : '-',
    },
    {
      label: 'Calories',
      value: activity.calories ? `${activity.calories.toFixed(0)} kcal` : '-',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {m.label}
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">{m.value}</p>
          {m.hint && <p className="text-xs text-muted-foreground">{m.hint}</p>}
          {'hintLink' in m && m.hintLink && (
            <Link to={m.hintLink.to} className="text-xs text-primary hover:underline">
              {m.hintLink.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
