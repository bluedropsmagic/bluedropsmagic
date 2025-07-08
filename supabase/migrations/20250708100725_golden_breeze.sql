/*
  # Fix Analytics Errors and Improve Geolocation Fallbacks

  1. Changes
    - Add fallback_geolocation column to store browser-based location when API fails
    - Add is_browser_location flag to indicate when fallback was used
    - Add error_log column to store any errors encountered during tracking
    - Add api_attempts column to track number of geolocation API attempts
    - Add browser_info column to store user agent and other browser data
    - Add is_brazilian_ip flag for better filtering

  2. Performance
    - Add indexes for new columns to maintain query performance
    - Add index for is_brazilian_ip for faster filtering

  3. Security
    - Maintain existing RLS policies
*/

-- Add new columns to the vsl_analytics table
ALTER TABLE IF EXISTS vsl_analytics 
  ADD COLUMN IF NOT EXISTS fallback_geolocation jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_browser_location boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS error_log jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS api_attempts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS browser_info jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_brazilian_ip boolean DEFAULT false;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_is_browser_location ON vsl_analytics (is_browser_location);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_api_attempts ON vsl_analytics (api_attempts);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_is_brazilian_ip ON vsl_analytics (is_brazilian_ip);

-- Update the check constraint for event_type to ensure it's up to date
DO $$
BEGIN
  -- Remove existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'vsl_analytics_event_type_check'
    AND conrelid = 'vsl_analytics'::regclass
  ) THEN
    ALTER TABLE vsl_analytics DROP CONSTRAINT vsl_analytics_event_type_check;
  END IF;
  
  -- Add the constraint
  ALTER TABLE vsl_analytics
  ADD CONSTRAINT vsl_analytics_event_type_check
  CHECK (event_type = ANY (ARRAY['page_enter'::text, 'video_play'::text, 'video_progress'::text, 'pitch_reached'::text, 'offer_click'::text, 'page_exit'::text]));
END $$;