import type { Event } from '../types/event';
import { formatDate, formatIDR } from '@/shared/lib/utils';

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

const statusColors: Record<Event['status'], string> = {
  registered: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  dns: 'bg-orange-100 text-orange-700',
  dnf: 'bg-red-100 text-red-700',
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
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">No events yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{event.name}</h4>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${statusColors[event.status]}`}
                >
                  {event.status}
                </span>
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
            <button
              onClick={() => onDelete(event)}
              className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
