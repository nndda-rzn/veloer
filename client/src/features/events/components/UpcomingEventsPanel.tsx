import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Route } from 'lucide-react';
import type { Event } from '../types/event';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/shared/components/ui';
import { formatDate } from '@/shared/lib/utils';
import {
  countdownLabel,
  daysUntil,
  EVENT_STATUS_VARIANTS,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
} from '../lib/event-style';

interface UpcomingEventsPanelProps {
  events: Event[];
  loading: boolean;
}

export function UpcomingEventsPanel({ events, loading }: UpcomingEventsPanelProps) {
  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-secondary" />;
  }

  const upcoming = events
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const next = upcoming[0] ?? null;
  const rest = upcoming.slice(1, 6);

  if (!next) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No upcoming events"
        description="Add your next race, gran fondo, or group ride to see it here."
      />
    );
  }

  const days = daysUntil(next.date);

  return (
    <div className="space-y-4">
      {/* Next event: highlighted */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: EVENT_TYPE_COLORS[next.type] }} />
        <CardContent className="pt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Next event
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">{next.name}</h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold tabular-nums text-primary">
              {days}
            </span>
            <span className="text-sm text-muted-foreground">
              {days === 0 ? 'today' : days === 1 ? 'day to go' : 'days to go'}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              {formatDate(next.date)}
            </span>
            {next.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {next.location}
              </span>
            )}
            {next.distance != null && (
              <span className="inline-flex items-center gap-1">
                <Route className="h-3 w-3" aria-hidden="true" />
                <span className="tabular-nums">{next.distance} km</span>
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Badge variant="neutral">{EVENT_TYPE_LABELS[next.type]}</Badge>
            <Badge variant={EVENT_STATUS_VARIANTS[next.status]}>{next.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* The rest */}
      {rest.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="mb-2 text-base font-semibold text-foreground">Coming up</h3>
            <ul className="divide-y divide-border">
              {rest.map((event) => (
                <li key={event.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className="h-8 w-1 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: EVENT_TYPE_COLORS[event.type] }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{event.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {EVENT_TYPE_LABELS[event.type]} · {formatDate(event.date)}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs tabular-nums text-muted-foreground">
                    {countdownLabel(event.date)}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/events"
              className="mt-2 inline-block text-xs font-medium text-primary hover:text-primary-dark hover:underline"
            >
              View all events →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
