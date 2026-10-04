-- Migration: 020_avatars_bucket
-- Description: Storage bucket + policies for profile photos.
--
-- Profile photos reuse the same storage path as bike photos (the server holds
-- the service-role key and uploads on the user's behalf). This mirrors
-- migration 017 for bike-photos.
--
-- Apply via the Supabase SQL Editor (no local psql/DATABASE_URL in this project).
-- The bucket must exist before POST /api/profile/avatar can succeed; until then
-- the endpoint returns 503 "Photo storage is not configured yet."

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read so <img src> works without a token.
DROP POLICY IF EXISTS "avatars public read" ON storage.objects;
CREATE POLICY "avatars public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated upload/update/delete, scoped to the owner.
DROP POLICY IF EXISTS "avatars auth insert" ON storage.objects;
CREATE POLICY "avatars auth insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "avatars owner update" ON storage.objects;
CREATE POLICY "avatars owner update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid() = owner);

DROP POLICY IF EXISTS "avatars owner delete" ON storage.objects;
CREATE POLICY "avatars owner delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid() = owner);
