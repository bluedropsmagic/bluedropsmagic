/*
  # Safe Policy Management for VSL Analytics

  1. Tables
    - Ensures `vsl_analytics` table exists with all required columns
    - Adds missing columns conditionally

  2. Security  
    - Enables RLS safely
    - Drops existing policies before creating new ones
    - Uses conditional logic to prevent conflicts

  3. Policies
    - "Allow public insert for analytics" - Allows public to insert analytics data
    - "Allow public read for analytics" - Allows public to read analytics data

  4. Indexes
    - Creates all performance indexes safely with IF NOT EXISTS

  5. Constraints
    - Adds event_type constraint with safe conditional logic
*/

-- Ensure table exists with all required columns
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

-- Add missing columns conditionally
DO $$
BEGIN
  -- Check and add ip column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'ip'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN ip text;
  END IF;

  -- Check and add country_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN country_code text;
  END IF;

  -- Check and add country_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'country_name'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN country_name text;
  END IF;

  -- Check and add city column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'city'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN city text;
  END IF;

  -- Check and add region column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'region'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN region text;
  END IF;

  -- Check and add last_ping column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'last_ping'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN last_ping timestamptz DEFAULT now();
  END IF;

  -- Check and add vturb_loaded column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'vturb_loaded'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN vturb_loaded boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS safely
ALTER TABLE vsl_analytics ENABLE ROW LEVEL SECURITY;

-- Remove a policy caso ela já exista
DROP POLICY IF EXISTS "Allow public insert for analytics" ON vsl_analytics;

-- Cria a policy somente se ela ainda não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Allow public insert for analytics'
    AND tablename = 'vsl_analytics'
  ) THEN
    CREATE POLICY "Allow public insert for analytics"
      ON vsl_analytics
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- Remove a policy caso ela já exista
DROP POLICY IF EXISTS "Allow public read for analytics" ON vsl_analytics;

-- Cria a policy somente se ela ainda não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Allow public read for analytics'
    AND tablename = 'vsl_analytics'
  ) THEN
    CREATE POLICY "Allow public read for analytics"
      ON vsl_analytics
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Create all indexes safely
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_session_id ON vsl_analytics (session_id);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_event_type ON vsl_analytics (event_type);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_created_at ON vsl_analytics (created_at);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_timestamp ON vsl_analytics (timestamp);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_country_code ON vsl_analytics (country_code);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_ip ON vsl_analytics (ip);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_last_ping ON vsl_analytics (last_ping);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_vturb_loaded ON vsl_analytics (vturb_loaded);

-- Add constraints safely
DO $$
BEGIN
  -- Remove existing event_type constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'vsl_analytics_event_type_check'
    AND conrelid = 'vsl_analytics'::regclass
  ) THEN
    ALTER TABLE vsl_analytics DROP CONSTRAINT vsl_analytics_event_type_check;
  END IF;
  
  -- Add the event_type constraint
  ALTER TABLE vsl_analytics
  ADD CONSTRAINT vsl_analytics_event_type_check
  CHECK (event_type = ANY (ARRAY['page_enter'::text, 'video_play'::text, 'video_progress'::text, 'pitch_reached'::text, 'offer_click'::text, 'page_exit'::text]));
END $$;

-- Ensure primary key exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'vsl_analytics_pkey'
    AND conrelid = 'vsl_analytics'::regclass
  ) THEN
    ALTER TABLE vsl_analytics ADD CONSTRAINT vsl_analytics_pkey PRIMARY KEY (id);
  END IF;
END $$;