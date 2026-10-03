import { useState } from 'react';
import type { EventFormData } from '../types/event';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { selectClass } from '@/shared/lib/form-styles';

interface EventFormProps {
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
}

const eventTypes: { value: EventFormData['type']; label: string }[] = [
  { value: 'race', label: 'Race' },
  { value: 'gran_fondo', label: 'Gran Fondo' },
  { value: 'charity', label: 'Charity' },
  { value: 'group_ride', label: 'Group Ride' },
  { value: 'tour', label: 'Tour' },
  { value: 'other', label: 'Other' },
];

export function EventForm({ onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    type: 'gran_fondo',
    date: new Date().toISOString().slice(0, 10),
    location: '',
    distance: null,
    registration_fee: null,
    status: 'registered',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...formData,
        location: formData.location || null,
        distance: formData.distance || null,
        registration_fee: formData.registration_fee || null,
        notes: formData.notes || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as EventFormData['type'] })
                }
                className={selectClass}
              >
                {eventTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              value={formData.location ?? ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                min="0"
                value={formData.distance ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    distance: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="registration_fee">Registration Fee (IDR)</Label>
              <Input
                id="registration_fee"
                type="number"
                min="0"
                value={formData.registration_fee ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registration_fee: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes ?? ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving…' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
