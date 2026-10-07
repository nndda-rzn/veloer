import { useState } from 'react';
import {
  EventCalendar,
  UpcomingEventsPanel,
  EventDetail,
  EventForm,
  useEvents,
} from '@/features/events';
import type { Event, EventFormData } from '@/features/events';
import { PageHeader, ConfirmDialog } from '@/shared/components/ui';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Plus } from 'lucide-react';

export function EventsPage() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formDate, setFormDate] = useState<string | undefined>(undefined);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);

  const handleAdd = () => {
    setEditingEvent(null);
    setFormDate(undefined);
    setShowForm(true);
  };

  const handleSelectDate = (date: Date) => {
    setEditingEvent(null);
    setFormDate(date.toISOString().slice(0, 10));
    setShowForm(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(null);
    setEditingEvent(event);
    setFormDate(undefined);
    setShowForm(true);
  };

  const handleSubmit = async (data: EventFormData) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, data);
    } else {
      await createEvent(data);
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  const confirmDelete = async () => {
    if (deletingEvent) {
      await deleteEvent(deletingEvent.id);
      setDeletingEvent(null);
      setSelectedEvent(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Cycling events, races, and group rides"
        action={
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Event
          </Button>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventCalendar
            events={events}
            onSelectEvent={setSelectedEvent}
            onSelectDate={handleSelectDate}
          />
        </div>
        <div className="lg:col-span-1">
          <UpcomingEventsPanel events={events} loading={loading} />
        </div>
      </div>

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEdit}
          onDelete={setDeletingEvent}
        />
      )}

      {showForm && (
        <EventForm
          event={editingEvent}
          defaultDate={formDate}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deletingEvent !== null}
        onOpenChange={(open) => !open && setDeletingEvent(null)}
        title="Delete event"
        description={`Are you sure you want to delete “${deletingEvent?.name ?? ''}”? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
