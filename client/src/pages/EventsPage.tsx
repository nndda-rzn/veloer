import { useState } from 'react';
import { EventList, EventForm, useEvents } from '@/features/events';
import type { Event, EventFormData } from '@/features/events';
import { PageHeader, ConfirmDialog } from '@/shared/components/ui';

export function EventsPage() {
  const { events, loading, error, createEvent, deleteEvent } = useEvents();
  const [showForm, setShowForm] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);

  const handleSubmit = async (data: EventFormData) => {
    await createEvent(data);
    setShowForm(false);
  };

  const confirmDelete = async () => {
    if (deletingEvent) {
      await deleteEvent(deletingEvent.id);
      setDeletingEvent(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Cycling events, races, and group rides"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Add Event
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <EventList events={events} loading={loading} onDelete={setDeletingEvent} />

      {showForm && <EventForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}

      {deletingEvent && (
        <ConfirmDialog
          title="Delete Event"
          description={`Are you sure you want to delete "${deletingEvent.name}"?`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeletingEvent(null)}
        />
      )}
    </div>
  );
}
