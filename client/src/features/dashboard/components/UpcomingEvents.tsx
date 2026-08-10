import type { Event } from '@/features/events';
import { formatDate } from '@/shared/lib/utils';

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
    return <div className="h-24 animate-pulse rounded-lg bg-gray-100" />;
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-500">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-700">Upcoming Events</h4>
      <div className="space-y-2">
        {events.slice(0, 4).map((event) => (
          <div key={event.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{event.name}</p>
              <p className="text-xs text-gray-400">
                {typeLabels[event.type]} • {formatDate(event.date)}
              </p>
            </div>
            {event.distance != null && (
              <span className="text-xs text-gray-500">{event.distance} km</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
