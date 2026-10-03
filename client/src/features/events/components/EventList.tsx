import type { Event } from '../types/event';
import { formatDate, formatIDR } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/shared/components/ui';
import { CalendarDays, MapPin } from 'lucide-react';

interface EventListProps {
  events: Event[];
  loading: boolean;
  onDelete: (event: Event) => void;
}

const typeLabels: Record<Event['type'], string> = {
  race: 'Race',
  gran_fondo: 'Gran Fondo',
  charity: 'Charity',
  group_ride: 'Group Ride',
  tour: 'Tour',
  other: 'Other',
};

const statusVariants: Record<
  Event['status'],
  'info' | 'success' | 'neutral' | 'warning' | 'danger'
> = {
  registered: 'info',
  completed: 'success',
  cancelled: 'neutral',
  dns: 'warning',
  dnf: 'danger',
};

export function EventList({ events, loading, onDelete }: EventListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No events yet"
        description="Add your next race, gran fondo, or group ride."
      />
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-semibold text-foreground">{event.name}</h4>
                <Badge variant={statusVariants[event.status]}>{event.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {typeLabels[event.type]} • {formatDate(event.date)}
              </p>
              {event.location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {event.location}
                </p>
              )}
              <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {event.distance != null && (
                  <span className="tabular-nums">{event.distance} km</span>
                )}
                {event.registration_fee != null && (
                  <span className="tabular-nums">Fee: {formatIDR(event.registration_fee)}</span>
                )}
                {event.result && <span>Result: {event.result}</span>}
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => onDelete(event)}>
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
