import { useState } from 'react';
import type { Component, ComponentFormData } from '../types/inventory';

interface ComponentFormProps {
  bikeId: string;
  component?: Component | null;
  onSubmit: (data: ComponentFormData) => Promise<void>;
  onCancel: () => void;
}

const categories: { value: Component['category']; label: string }[] = [
  { value: 'drivetrain', label: 'Drivetrain' },
  { value: 'braking', label: 'Braking' },
  { value: 'wheel', label: 'Wheel' },
  { value: 'cockpit', label: 'Cockpit' },
  { value: 'frame', label: 'Frame' },
  { value: 'other', label: 'Other' },
];

export function ComponentForm({ bikeId, component, onSubmit, onCancel }: ComponentFormProps) {
  const [formData, setFormData] = useState<ComponentFormData>({
    bike_id: bikeId,
    name: component?.name ?? '',
    category: component?.category ?? 'drivetrain',
    brand: component?.brand ?? '',
    model: component?.model ?? '',
    install_date: component?.install_date ?? new Date().toISOString().slice(0, 10),
    install_km: component?.install_km ?? 0,
    expected_lifespan_km: component?.expected_lifespan_km ?? null,
    notes: component?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...formData,
        brand: formData.brand || null,
        model: formData.model || null,
        expected_lifespan_km: formData.expected_lifespan_km || null,
        notes: formData.notes || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-gray-900">
          {component ? 'Edit Component' : 'Add Component'}
        </h3>
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

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as Component['category'] })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="install_date"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Install Date *
              </label>
              <input
                id="install_date"
                type="date"
                required
                value={formData.install_date}
                onChange={(e) => setFormData({ ...formData, install_date: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="install_km" className="mb-1 block text-sm font-medium text-gray-700">
                Install KM
              </label>
              <input
                id="install_km"
                type="number"
                min="0"
                value={formData.install_km}
                onChange={(e) => setFormData({ ...formData, install_km: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="expected_lifespan_km"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Expected Lifespan (km)
            </label>
            <input
              id="expected_lifespan_km"
              type="number"
              min="0"
              value={formData.expected_lifespan_km ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expected_lifespan_km: e.target.value ? Number(e.target.value) : null,
                })
              }
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
              {saving ? 'Saving...' : component ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
