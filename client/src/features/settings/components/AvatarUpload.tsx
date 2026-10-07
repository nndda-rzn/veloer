import { useRef, useState } from 'react';
import type { Area } from 'react-easy-crop';
import { Camera, Loader2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AvatarCropDialog } from './AvatarCropDialog';
import { blobToFile, cropImageToBlob } from '../lib/crop-image';

interface AvatarUploadProps {
  /** Current image URL, or null. */
  value: string | null;
  /** Name used for the initials fallback. */
  name: string;
  uploading: boolean;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<void>;
  onError: (message: string) => void;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

function getInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials || '?';
}

/**
 * Avatar with photo upload, an initials fallback, and a crop step.
 *
 * The crop step matters: without it the avatar was cropped from the centre
 * automatically, so a landscape photo could lose its subject and the rider
 * would only see the damage after saving.
 */
export function AvatarUpload({
  value,
  name,
  uploading,
  onChange,
  onUpload,
  onError,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      onError('Use a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      onError('Image must be 5 MB or smaller.');
      return;
    }

    onError('');
    // Hand the picked file to the cropper as a local object URL.
    setPendingSrc(URL.createObjectURL(file));
  };

  const closeCropper = () => {
    if (pendingSrc) URL.revokeObjectURL(pendingSrc);
    setPendingSrc(null);
  };

  const handleCropConfirm = async (area: Area) => {
    if (!pendingSrc) return;
    setBusy(true);
    try {
      const blob = await cropImageToBlob(pendingSrc, area);
      await onUpload(blobToFile(blob));
      closeCropper();
    } catch {
      onError('Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const isBusy = busy || uploading;

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-14 w-14">
        {value && <AvatarImage src={value} alt="" />}
        <AvatarFallback className="text-base">{getInitials(name)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isBusy}
          onClick={() => inputRef.current?.click()}
        >
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="h-4 w-4" aria-hidden="true" />
          )}
          {isBusy ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}
        </Button>

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Remove
          </Button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={handleSelect}
          className="sr-only"
          aria-label="Upload profile photo"
        />
      </div>

      {pendingSrc && (
        <AvatarCropDialog
          imageSrc={pendingSrc}
          onCancel={closeCropper}
          onConfirm={handleCropConfirm}
          saving={busy}
        />
      )}
    </div>
  );
}
