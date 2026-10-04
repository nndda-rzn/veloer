import { useState, useEffect, useCallback } from 'react';
import { eventApi } from '../api/event.api';
import type { Event, EventFormData } from '../types/event';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createEvent: (data: EventFormData) => Promise<void>;
  updateEvent: (id: string, data: Partial<EventFormData>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export function useEvents(upcoming?: boolean): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(0);

  useEffect(() => {
    setLoading(true);
    eventApi
      .list(upcoming)
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load events'))
      .finally(() => setLoading(false));
  }, [upcoming, refetchFlag]);

  const refetch = useCallback(() => setRefetchFlag((f) => f + 1), []);

  const createEvent = useCallback(async (data: EventFormData) => {
    await eventApi.create(data);
    setRefetchFlag((f) => f + 1);
  }, []);

  const updateEvent = useCallback(async (id: string, data: Partial<EventFormData>) => {
    await eventApi.update(id, data);
    setRefetchFlag((f) => f + 1);
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    await eventApi.delete(id);
    setRefetchFlag((f) => f + 1);
  }, []);

  return { events, loading, error, refetch, createEvent, updateEvent, deleteEvent };
}
