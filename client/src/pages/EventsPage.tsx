import { useState } from 'react';
import { EventList, EventForm, useEvents } from '@/features/events';
import type { Event, EventFormData } from '@/features/events';
import { PageHeader } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
        <AlertDialog open onOpenChange={(open) => !open && setDeletingEvent(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{deletingEvent.name}&quot;?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="danger" onClick={() => void confirmDelete()}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
