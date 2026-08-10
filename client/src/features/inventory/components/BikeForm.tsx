import { useState } from 'react';
import type { Bike, BikeFormData } from '../types/inventory';

interface BikeFormProps {
  bike?: Bike | null;
  onSubmit: (data: BikeFormData) => Promise<void>;
  onCancel: () => void;
}

const bikeTypes: { value: Bike['type']; label: string }[] = [
  { value: 'road', label: 'Road' },
  { value: 'mtb', label: 'MTB' },
  { value: 'gravel', label: 'Gravel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'folding', label: 'Folding' },
  { value: 'other', label: 'Other' },
];

export function BikeForm({ bike, onSubmit, onCancel }: BikeFormProps) {
  const [formData, setFormData] = useState<BikeFormData>({
    name: bike?.name ?? '',
    brand: bike?.brand ?? '',
    model: bike?.model ?? '',
    type: bike?.type ?? 'road',
    purchase_date: bike?.purchase_date ?? '',
    purchase_price: bike?.purchase_price ?? null,
    notes: bike?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...formData,
        purchase_date: formData.purchase_date || null,
        purchase_price: formData.purchase_price || null,
        brand: formData.brand || null,
        model: formData.model || null,
        notes: formData.notes || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-gray-900">{bike ? 'Edit Bike' : 'Add Bike'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="brand" className="mb-1 block text-sm font-medium text-gray-700">
                Brand
              </label>
              <input
                id="brand"
                type="text"
                value={formData.brand ?? ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="model" className="mb-1 block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                id="model"
                type="text"
                value={formData.model ?? ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Bike['type'] })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {bikeTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="purchase_date"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Purchase Date
              </label>
              <input
                id="purchase_date"
                type="date"
                value={formData.purchase_date ?? ''}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="purchase_price"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Purchase Price (IDR)
              </label>
              <input
                id="purchase_price"
                type="number"
                min="0"
                value={formData.purchase_price ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    purchase_price: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              rows={2}
              value={formData.notes ?? ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : bike ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
