import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import type { Event } from '@/features/events';
import { formatDate } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/shared/components/ui';

interface UpcomingEventsProps {
  events: Event[];
  loading: boolean;
}

const typeLabels: Record<Event['type'], string> = {
  race: 'Race',
  gran_fondo: 'Gran Fondo',
  charity: 'Charity',
  group_ride: 'Group Ride',
  tour: 'Tour',
  other: 'Other',
};

export function UpcomingEvents({ events, loading }: UpcomingEventsProps) {
  if (loading) {
    return <div className="h-24 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No upcoming events"
        description="Add events to track your race calendar."
      />
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Upcoming Events</h3>
          <Link
            to="/events"
            className="text-xs font-medium text-primary hover:text-primary-dark hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-2.5">
          {events.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{event.name}</p>
                <p className="text-xs text-gray-400">{formatDate(event.date)}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {event.distance != null && (
                  <span className="text-xs text-gray-500">{event.distance} km</span>
                )}
                <Badge variant="info">{typeLabels[event.type]}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
