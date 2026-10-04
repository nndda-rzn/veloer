import { useState, useEffect } from 'react';
import { activityApi } from '@/features/activity';
import type { Activity } from '@/features/activity';
import { filterLinkable } from '../lib/filter-linkable';
import { Button } from '@/components/ui/button';
import { selectClass } from '@/shared/lib/form-styles';

interface ActivityLinkerProps {
  workoutId: string;
  planId: string;
  scheduledDate: string;
  currentActivityId: string | null;
  /** A strength workout can only be linked to a strength session. */
  workoutIsStrength: boolean;
  onLink: (workoutId: string, activityId: string) => Promise<void>;
}

export function ActivityLinker({
  workoutId,
  scheduledDate,
  currentActivityId,
  workoutIsStrength,
  onLink,
}: ActivityLinkerProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selected, setSelected] = useState(currentActivityId ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch activities ±2 days from scheduled date
    const base = new Date(scheduledDate);
    const from = new Date(base);
    from.setDate(from.getDate() - 2);
    const to = new Date(base);
    to.setDate(to.getDate() + 2);

    activityApi
      .list({
        startDate: from.toISOString().split('T')[0],
        endDate: to.toISOString().split('T')[0],
        limit: 20,
      })
      .then((rows) => setActivities(filterLinkable(rows, workoutIsStrength)))
      .catch(() => {});
  }, [scheduledDate, workoutIsStrength]);

  const handleLink = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await onLink(workoutId, selected);
    } finally {
      setLoading(false);
    }
  };

  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No matching {workoutIsStrength ? 'strength sessions' : 'rides'} within ±2 days of this
        workout.
      </p>
    );
  }

  return (
    <div className="flex gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className={`flex-1 ${selectClass}`}
      >
        <option value="">Select activity…</option>
        {activities.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} · {new Date(a.start_date).toLocaleDateString()}
          </option>
        ))}
      </select>
      <Button onClick={handleLink} disabled={!selected || loading} loading={loading}>
        {loading ? 'Linking…' : 'Link'}
      </Button>
    </div>
  );
}
