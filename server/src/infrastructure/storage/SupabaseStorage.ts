import { injectable } from 'tsyringe';
import type { StoragePort } from '../../application/ports/StoragePort.js';
import { getSupabaseClient } from '../database/supabase-client.js';

@injectable()
export class SupabaseStorage implements StoragePort {
  async uploadObject(
    bucket: string,
    path: string,
    data: Buffer,
    contentType: string,
  ): Promise<{ key: string; publicUrl: string }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, data, { contentType, upsert: true });

    if (error) throw new Error(`Failed to upload to storage: ${error.message}`);

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    return { key: path, publicUrl };
  }

  async deleteObject(bucket: string, path: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw new Error(`Failed to delete from storage: ${error.message}`);
  }
}
