import { useState } from 'react';
import { EventList, EventForm, useEvents } from '@/features/events';
import type { Event, EventFormData } from '@/features/events';
import { PageHeader, ConfirmDialog, Button, Alert } from '@/shared/components/ui';

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
        action={<Button onClick={() => setShowForm(true)}>Add Event</Button>}
      />

      {error && <Alert variant="error">{error}</Alert>}

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
