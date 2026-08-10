-- Migration: 012_add_ftp_to_profiles
-- Description: Add FTP (Functional Threshold Power) column to user_profiles
-- Needed for training load analysis (TSS, Intensity Factor)

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ftp integer DEFAULT 250;
