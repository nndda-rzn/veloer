import type { Event } from '../types/event';
import { formatDate, formatIDR } from '@/shared/lib/utils';
import { Badge, Card, EmptyState, Button } from '@/shared/components/ui';
import { CalendarDays } from 'lucide-react';

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
          <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{event.name}</h4>
                <Badge variant={statusVariants[event.status]}>{event.status}</Badge>
              </div>
              <p className="text-sm text-gray-500">
                {typeLabels[event.type]} • {formatDate(event.date)}
              </p>
              {event.location && <p className="text-xs text-gray-400">📍 {event.location}</p>}
              <div className="mt-1 flex gap-4 text-xs text-gray-500">
                {event.distance != null && <span>{event.distance} km</span>}
                {event.registration_fee != null && (
                  <span>Fee: {formatIDR(event.registration_fee)}</span>
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
