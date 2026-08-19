import { useState } from 'react';
import type { MaintenanceLogFormData } from '../types/maintenance';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

const selectClass =
  'flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

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
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Maintenance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="service_date">Service Date *</Label>
              <Input
                id="service_date"
                type="date"
                required
                value={formData.service_date}
                onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service_km">Service KM *</Label>
              <Input
                id="service_km"
                type="number"
                required
                min="0"
                value={formData.service_km}
                onChange={(e) => setFormData({ ...formData, service_km: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Type *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as MaintenanceLogFormData['type'] })
              }
              className={selectClass}
            >
              {logTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cost">Cost (IDR)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                value={formData.cost ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="performed_by">Performed By</Label>
              <select
                id="performed_by"
                value={formData.performed_by}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    performed_by: e.target.value as 'self' | 'shop',
                  })
                }
                className={selectClass}
              >
                <option value="self">Self</option>
                <option value="shop">Shop</option>
              </select>
            </div>
          </div>

          {formData.performed_by === 'shop' && (
            <div className="space-y-1.5">
              <Label htmlFor="shop_name">Shop Name</Label>
              <Input
                id="shop_name"
                type="text"
                value={formData.shop_name ?? ''}
                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="next_service_km">Next Service (km)</Label>
              <Input
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
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next_service_date">Next Service Date</Label>
              <Input
                id="next_service_date"
                type="date"
                value={formData.next_service_date ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, next_service_date: e.target.value || null })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving…' : 'Log'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
