import { inject, injectable } from 'tsyringe';
import type { BikeRepository } from '../../../domain/repositories/inventory/BikeRepository.js';
import type { StoragePort } from '../../ports/StoragePort.js';
import type { Bike } from '../../../domain/entities/inventory/Bike.js';

export interface UploadBikePhotoResult {
  photo_url: string;
  bike: Bike;
}

const BUCKET = 'bike-photos';

@injectable()
export class UploadBikePhoto {
  constructor(
    @inject('BikeRepository') private bikeRepo: BikeRepository,
    @inject('StoragePort') private storage: StoragePort,
  ) {}

  async execute(
    bikeId: string,
    userId: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<UploadBikePhotoResult> {
    const bike = await this.bikeRepo.findById(bikeId);
    if (!bike || bike.user_id !== userId) {
      throw new Error('NOT_FOUND');
    }

    // Derive file extension from MIME type
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const ext = extMap[file.mimetype];
    if (!ext) {
      throw new Error('INVALID_FILE_TYPE');
    }

    // Path convention: bike-photos/{userId}/{bikeId}.{ext}
    const path = `${userId}/${bikeId}.${ext}`;
    const { publicUrl } = await this.storage.uploadObject(BUCKET, path, file.buffer, file.mimetype);

    const updated = await this.bikeRepo.update(bikeId, { photo_url: publicUrl });
    if (!updated) throw new Error('NOT_FOUND');

    return { photo_url: publicUrl, bike: updated };
  }
}
