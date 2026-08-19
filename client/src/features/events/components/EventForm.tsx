import { useState } from 'react';
import type { EventFormData } from '../types/event';
import { Modal, Button } from '@/shared/components/ui';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

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
    <Modal open onClose={onCancel} title="Add Event">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Event Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="type" className={labelClass}>
              Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as EventFormData['type'] })
              }
              className={inputClass}
            >
              {eventTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className={labelClass}>
              Date *
            </label>
            <input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            type="text"
            value={formData.location ?? ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="distance" className={labelClass}>
              Distance (km)
            </label>
            <input
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
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="registration_fee" className={labelClass}>
              Registration Fee (IDR)
            </label>
            <input
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
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {saving ? 'Saving...' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
