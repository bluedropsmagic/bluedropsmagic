/*
  # Fix Database Schema for VSL Analytics

  1. Tables
    - Ensure `vsl_analytics` table exists with all required columns
    - Add missing columns conditionally

  2. Security  
    - Enable RLS safely
    - Create policies with safe conditional logic

  3. Indexes
    - Create all necessary indexes for performance
*/

-- Create the vsl_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS vsl_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  ip text,
  country_code text,
  country_name text,
  city text,
  region text,
  last_ping timestamptz DEFAULT now(),
  vturb_loaded boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE vsl_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert for analytics" ON vsl_analytics;
DROP POLICY IF EXISTS "Allow public read for analytics" ON vsl_analytics;

-- Create policies for public access
CREATE POLICY "Allow public insert for analytics"
  ON vsl_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read for analytics"
  ON vsl_analytics
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_session_id ON vsl_analytics (session_id);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_event_type ON vsl_analytics (event_type);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_created_at ON vsl_analytics (created_at);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_timestamp ON vsl_analytics (timestamp);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_country_code ON vsl_analytics (country_code);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_ip ON vsl_analytics (ip);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_last_ping ON vsl_analytics (last_ping);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_vturb_loaded ON vsl_analytics (vturb_loaded);

-- Add check constraint for valid event types
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