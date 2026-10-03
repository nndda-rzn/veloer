import { useState, useRef } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { bikeApi } from '../api/bike.api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { selectClass } from '@/shared/lib/form-styles';
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
    photo_url: bike?.photo_url ?? null,
    notes: bike?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type + size client-side for fast feedback
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Only JPG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large (max 5 MB).');
      return;
    }

    // Preview immediately
    setPreviewUrl(URL.createObjectURL(file));
    setUploadError(null);

    if (!bike) {
      // No bike id yet: user must save the bike first, then photo will upload
      setUploadError('Save the bike first, then add a photo from Edit.');
      URL.revokeObjectURL(previewUrl ?? '');
      setPreviewUrl(null);
      return;
    }

    setUploading(true);
    try {
      const result = await bikeApi.uploadPhoto(bike.id, file);
      setFormData((prev) => ({ ...prev, photo_url: result.photo_url }));
      setPreviewUrl(result.photo_url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearPhoto = () => {
    setFormData((prev) => ({ ...prev, photo_url: null }));
    setPreviewUrl(null);
    setUploadError(null);
  };

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

  const displayImage = previewUrl ?? formData.photo_url ?? null;

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bike ? 'Edit Bike' : 'Add Bike'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo upload */}
          <div className="space-y-1.5">
            <Label>Bike Photo</Label>
            {displayImage ? (
              <div className="relative overflow-hidden rounded-lg border border-border">
                <img
                  src={displayImage}
                  alt={formData.name || 'Bike'}
                  className="aspect-video w-full object-cover"
                />
                {bike && (
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                <label className="absolute bottom-2 right-2 cursor-pointer rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white hover:bg-black/80">
                  Change
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => void handleFileSelect(e)}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input bg-secondary py-6 text-center hover:border-primary hover:bg-primary-50">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="text-sm text-muted-foreground">
                  {uploading ? 'Uploading…' : bike ? 'Upload a photo' : 'Add photo after saving'}
                </span>
                <span className="text-xs text-muted-foreground">JPG, PNG or WebP · max 5 MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => void handleFileSelect(e)}
                  className="hidden"
                  disabled={!bike || uploading}
                />
              </label>
            )}
            {uploadError && <p className="text-xs text-danger">{uploadError}</p>}
          </div>

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

          <div className="space-y-1.5">
            <Label htmlFor="type">Type *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Bike['type'] })}
              className={selectClass}
            >
              {bikeTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date ?? ''}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchase_price">Purchase Price (IDR)</Label>
              <Input
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
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              value={formData.notes ?? ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving…' : bike ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
