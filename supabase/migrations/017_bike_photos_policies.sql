-- Migration: 017_bike_photos_policies
-- Description: Storage policies for the bike-photos bucket
-- Note: If bucket 'bike-photos' was already created manually in the
-- Supabase dashboard, only the policy part below is needed.

-- ============================================================
-- Storage Policies for bucket: bike-photos
-- ============================================================

-- 1. Public read (bucket is public, anyone can view images)
CREATE POLICY "bike-photos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'bike-photos');

-- 2. Authenticated users can upload
CREATE POLICY "bike-photos auth upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bike-photos'
  AND auth.role() = 'authenticated'
);

-- 3. File owner can update
CREATE POLICY "bike-photos owner update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'bike-photos' AND auth.uid() = owner);

-- 4. File owner can delete
CREATE POLICY "bike-photos owner delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'bike-photos' AND auth.uid() = owner);
