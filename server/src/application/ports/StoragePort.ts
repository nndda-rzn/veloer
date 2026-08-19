export interface StoragePort {
  uploadObject(
    bucket: string,
    path: string,
    data: Buffer,
    contentType: string,
  ): Promise<{ key: string; publicUrl: string }>;
  deleteObject(bucket: string, path: string): Promise<void>;
}
