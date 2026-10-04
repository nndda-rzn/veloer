import type { Area } from 'react-easy-crop';

/** Output size: 2x the largest on-screen avatar (256px), so it stays sharp. */
export const AVATAR_SIZE = 512;

/**
 * Render the selected crop area to a square image blob.
 *
 * Runs in the browser so only the small cropped result is uploaded, not the
 * original file. Returns a JPEG blob; avatars do not need transparency and JPEG
 * keeps the payload small.
 */
export async function cropImageToBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser');

  // Fill first so any transparent source does not come out black in JPEG.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);

  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create image'))),
      'image/jpeg',
      0.9,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Could not read that image')));
    image.crossOrigin = 'anonymous';
    image.src = src;
  });
}

/** Turn a blob into a File so the existing upload API can take it. */
export function blobToFile(blob: Blob, filename = 'avatar.jpg'): File {
  return new File([blob], filename, { type: blob.type });
}
