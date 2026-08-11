-- Migration: 014_add_tss_to_activities
-- Description: Add TSS (Training Stress Score) column to activities table
-- TSS is computed at sync time from weighted_avg_watts (NP), moving_time, and FTP
-- Formula: TSS = (moving_time_hours * IF^2 * 100) where IF = NP / FTP

ALTER TABLE activities ADD COLUMN IF NOT EXISTS tss double precision;
