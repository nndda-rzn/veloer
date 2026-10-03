import { useState } from 'react';
import type { Component, ComponentFormData } from '../types/inventory';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { selectClass } from '@/shared/lib/form-styles';

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
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{component ? 'Edit Component' : 'Add Component'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as Component['category'] })
              }
              className={selectClass}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                type="text"
                value={formData.brand ?? ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                type="text"
                value={formData.model ?? ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="install_date">Install Date *</Label>
              <Input
                id="install_date"
                type="date"
                required
                value={formData.install_date}
                onChange={(e) => setFormData({ ...formData, install_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="install_km">Install KM</Label>
              <Input
                id="install_km"
                type="number"
                min="0"
                value={formData.install_km}
                onChange={(e) => setFormData({ ...formData, install_km: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expected_lifespan_km">Expected Lifespan (km)</Label>
            <Input
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
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving…' : component ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
