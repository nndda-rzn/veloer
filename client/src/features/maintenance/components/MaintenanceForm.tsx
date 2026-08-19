import { useState } from 'react';
import type { MaintenanceLogFormData } from '../types/maintenance';
import { Modal, Button } from '@/shared/components/ui';

interface MaintenanceFormProps {
  bikeId: string;
  currentKm: number;
  onSubmit: (data: MaintenanceLogFormData) => Promise<void>;
  onCancel: () => void;
}

const logTypes: { value: MaintenanceLogFormData['type']; label: string }[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'repair', label: 'Repair' },
  { value: 'replacement', label: 'Replacement' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'tuning', label: 'Tuning' },
];

export function MaintenanceForm({ bikeId, currentKm, onSubmit, onCancel }: MaintenanceFormProps) {
  const [formData, setFormData] = useState<MaintenanceLogFormData>({
    bike_id: bikeId,
    service_date: new Date().toISOString().slice(0, 10),
    service_km: Math.round(currentKm),
    type: 'routine',
    description: '',
    cost: null,
    performed_by: 'self',
    shop_name: null,
    next_service_km: null,
    next_service_date: null,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...formData,
        cost: formData.cost || null,
        shop_name: formData.shop_name || null,
        next_service_km: formData.next_service_km || null,
        next_service_date: formData.next_service_date || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onCancel} title="Log Maintenance">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="service_date" className="mb-1 block text-sm font-medium text-gray-700">
              Service Date *
            </label>
            <input
              id="service_date"
              type="date"
              required
              value={formData.service_date}
              onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="service_km" className="mb-1 block text-sm font-medium text-gray-700">
              Service KM *
            </label>
            <input
              id="service_km"
              type="number"
              required
              min="0"
              value={formData.service_km}
              onChange={(e) => setFormData({ ...formData, service_km: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
            Type *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as MaintenanceLogFormData['type'] })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {logTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            required
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cost" className="mb-1 block text-sm font-medium text-gray-700">
              Cost (IDR)
            </label>
            <input
              id="cost"
              type="number"
              min="0"
              value={formData.cost ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, cost: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="performed_by" className="mb-1 block text-sm font-medium text-gray-700">
              Performed By
            </label>
            <select
              id="performed_by"
              value={formData.performed_by}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  performed_by: e.target.value as 'self' | 'shop',
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="self">Self</option>
              <option value="shop">Shop</option>
            </select>
          </div>
        </div>

        {formData.performed_by === 'shop' && (
          <div>
            <label htmlFor="shop_name" className="mb-1 block text-sm font-medium text-gray-700">
              Shop Name
            </label>
            <input
              id="shop_name"
              type="text"
              value={formData.shop_name ?? ''}
              onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="next_service_km"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Next Service (km)
            </label>
            <input
              id="next_service_km"
              type="number"
              min="0"
              value={formData.next_service_km ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  next_service_km: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label
              htmlFor="next_service_date"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Next Service Date
            </label>
            <input
              id="next_service_date"
              type="date"
              value={formData.next_service_date ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, next_service_date: e.target.value || null })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {saving ? 'Saving...' : 'Log'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
