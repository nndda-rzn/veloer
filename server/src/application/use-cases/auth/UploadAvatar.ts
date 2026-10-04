import { inject, injectable } from 'tsyringe';
import type { UserProfileRepository } from '../../../domain/repositories/auth/UserProfileRepository.js';
import type { StoragePort } from '../../ports/StoragePort.js';
import type { UserProfile } from '../../../domain/entities/auth/User.js';

export interface UploadAvatarResult {
  avatar_url: string;
  profile: UserProfile;
}

const BUCKET = 'avatars';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Store a profile photo and point the profile at it.
 *
 * Same storage path as bike photos: the server holds the service-role key, so
 * the write happens here rather than from the browser.
 */
@injectable()
export class UploadAvatar {
  constructor(
    @inject('UserProfileRepository') private profileRepo: UserProfileRepository,
    @inject('StoragePort') private storage: StoragePort,
  ) {}

  async execute(
    userId: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<UploadAvatarResult> {
    const ext = EXT_BY_MIME[file.mimetype];
    if (!ext) throw new Error('INVALID_FILE_TYPE');

    // One object per user, so a new upload replaces the old one.
    const path = `${userId}/avatar.${ext}`;
    const { publicUrl } = await this.storage.uploadObject(BUCKET, path, file.buffer, file.mimetype);

    const profile = await this.profileRepo.update(userId, { avatar_url: publicUrl });
    if (!profile) throw new Error('NOT_FOUND');

    return { avatar_url: publicUrl, profile };
  }
}
