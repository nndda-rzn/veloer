import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface AvatarCropDialogProps {
  /** Object URL of the file the rider picked. */
  imageSrc: string;
  onCancel: () => void;
  /** Called with the crop area once the rider confirms. */
  onConfirm: (area: Area) => void | Promise<void>;
  saving?: boolean;
}

/**
 * Circular crop step between picking a photo and uploading it.
 *
 * Without this the avatar was cropped from the centre automatically, so a
 * landscape photo could lose the subject entirely and the rider only found out
 * after it was saved. Here they see exactly what will be stored.
 */
export function AvatarCropDialog({
  imageSrc,
  onCancel,
  onConfirm,
  saving = false,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setArea(areaPixels);
  }, []);

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative h-64 w-full overflow-hidden rounded-lg bg-stone-900">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatar-zoom">Zoom</Label>
            <input
              id="avatar-zoom"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Drag to reposition, or use the arrow keys. Scroll or use the slider to zoom.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => area && void onConfirm(area)}
              loading={saving}
              disabled={!area}
            >
              {saving ? 'Saving…' : 'Save photo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
