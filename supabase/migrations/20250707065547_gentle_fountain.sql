/*
  # Create VSL Analytics Table

  1. New Tables
    - `vsl_analytics`
      - `id` (uuid, primary key)
      - `session_id` (text, not null)
      - `event_type` (text, not null) - page_enter, video_play, video_progress, pitch_reached, offer_click, page_exit
      - `event_data` (jsonb, default '{}')
      - `timestamp` (timestamptz, default now())
      - `created_at` (timestamptz, default now())
      - `ip` (text, nullable)
      - `country_code` (text, nullable)
      - `country_name` (text, nullable)
      - `city` (text, nullable)
      - `region` (text, nullable)
      - `last_ping` (timestamptz, default now())
      - `vturb_loaded` (boolean, default false)

  2. Security
    - Enable RLS on `vsl_analytics` table
    - Add policy for public insert (analytics data)
    - Add policy for public read (dashboard access)

  3. Indexes
    - Primary key on id
    - Index on session_id for performance
    - Index on event_type for filtering
    - Index on created_at for time-based queries
    - Index on country_code for geographic filtering
    - Index on last_ping for live user tracking

  4. Constraints
    - Check constraint for valid event types
*/

-- Create the vsl_analytics table
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

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public insert for analytics" ON vsl_analytics;
DROP POLICY IF EXISTS "Allow public read for analytics" ON vsl_analytics;

-- Create policy for public insert (analytics data)
CREATE POLICY "Allow public insert for analytics"
  ON vsl_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy for public read (dashboard access)
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