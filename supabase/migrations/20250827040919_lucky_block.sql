/*
  # Fix Analytics Schema and Permissions

  1. Tables
    - Ensure `vsl_analytics` table exists with correct structure
    - Add missing columns if needed
    - Update constraints and indexes
    
  2. Security
    - Enable RLS on all tables
    - Add proper policies for public access
    - Ensure analytics can be inserted and read publicly
    
  3. Performance
    - Add optimized indexes for common queries
    - Ensure proper data types for analytics
*/

-- Ensure vsl_analytics table exists with all required columns
CREATE TABLE IF NOT EXISTS vsl_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['page_enter'::text, 'video_play'::text, 'video_progress'::text, 'pitch_reached'::text, 'offer_click'::text, 'page_exit'::text])),
  event_data jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  ip text,
  country_code text,
  country_name text,
  city text,
  region text,
  last_ping timestamptz DEFAULT now(),
  vturb_loaded boolean DEFAULT false,
  fallback_geolocation jsonb DEFAULT '{}'::jsonb,
  is_browser_location boolean DEFAULT false,
  error_log jsonb DEFAULT '{}'::jsonb,
  api_attempts integer DEFAULT 0,
  browser_info jsonb DEFAULT '{}'::jsonb,
  is_brazilian_ip boolean DEFAULT false,
  is_counted boolean DEFAULT false,
  dashboard_category text,
  dashboard_timestamp timestamptz DEFAULT now()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Check and add vturb_loaded column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'vturb_loaded'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN vturb_loaded boolean DEFAULT false;
  END IF;
  
  -- Check and add fallback_geolocation column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'fallback_geolocation'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN fallback_geolocation jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Check and add is_browser_location column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'is_browser_location'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN is_browser_location boolean DEFAULT false;
  END IF;
  
  -- Check and add error_log column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'error_log'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN error_log jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Check and add api_attempts column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'api_attempts'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN api_attempts integer DEFAULT 0;
  END IF;
  
  -- Check and add browser_info column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'browser_info'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN browser_info jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Check and add is_brazilian_ip column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'is_brazilian_ip'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN is_brazilian_ip boolean DEFAULT false;
  END IF;
  
  -- Check and add is_counted column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'is_counted'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN is_counted boolean DEFAULT false;
  END IF;
  
  -- Check and add dashboard_category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'dashboard_category'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN dashboard_category text;
  END IF;
  
  -- Check and add dashboard_timestamp column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'dashboard_timestamp'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN dashboard_timestamp timestamptz DEFAULT now();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE vsl_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Allow public insert for analytics" ON vsl_analytics;
DROP POLICY IF EXISTS "Allow public read for analytics" ON vsl_analytics;
DROP POLICY IF EXISTS "Allow public update for analytics" ON vsl_analytics;

-- Create comprehensive policies for public access
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

CREATE POLICY "Allow public update for analytics"
  ON vsl_analytics
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create optimized indexes for performance
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_session_id ON vsl_analytics (session_id);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_event_type ON vsl_analytics (event_type);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_created_at ON vsl_analytics (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_timestamp ON vsl_analytics (timestamp);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_country_code ON vsl_analytics (country_code);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_last_ping ON vsl_analytics (last_ping);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_is_brazilian_ip ON vsl_analytics (is_brazilian_ip);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_is_counted ON vsl_analytics (is_counted);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_dashboard_category ON vsl_analytics (dashboard_category);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_vturb_loaded ON vsl_analytics (vturb_loaded);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_is_browser_location ON vsl_analytics (is_browser_location);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_api_attempts ON vsl_analytics (api_attempts);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_ip ON vsl_analytics (ip);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_country_date ON vsl_analytics (country_code, created_at DESC) WHERE country_code != 'BR';
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_event_date ON vsl_analytics (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_session_event ON vsl_analytics (session_id, event_type, created_at);

-- Ensure other tables exist and have proper permissions
CREATE TABLE IF NOT EXISTS refund_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  address text NOT NULL,
  days_since_purchase text NOT NULL,
  bottles_used text DEFAULT ''::text,
  days_used text DEFAULT ''::text,
  daily_doses text DEFAULT ''::text,
  missed_days text DEFAULT ''::text,
  other_supplements text DEFAULT ''::text,
  expectations text DEFAULT ''::text,
  improvements text DEFAULT ''::text,
  delivery_experience text DEFAULT ''::text,
  partner_comments text DEFAULT ''::text,
  treatment_knowledge text DEFAULT ''::text,
  continue_treatment text DEFAULT ''::text,
  change_of_mind text DEFAULT ''::text,
  additional_comments text DEFAULT ''::text,
  photos jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  deleted boolean DEFAULT false,
  deleted_at timestamptz,
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_agent text,
  version text DEFAULT '1.0'::text
);

ALTER TABLE refund_forms ENABLE ROW LEVEL SECURITY;

-- Refund forms policies
CREATE POLICY IF NOT EXISTS "Allow public insert for refund forms"
  ON refund_forms
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public read for refund forms"
  ON refund_forms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow public update for refund forms"
  ON refund_forms
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for refund forms
CREATE INDEX IF NOT EXISTS idx_refund_forms_email ON refund_forms (email);
CREATE INDEX IF NOT EXISTS idx_refund_forms_status ON refund_forms (status);
CREATE INDEX IF NOT EXISTS idx_refund_forms_submitted_at ON refund_forms (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_refund_forms_deleted ON refund_forms (deleted);

-- Ensure webhooks table exists
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public access for webhooks"
  ON webhooks
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure country_filters table exists
CREATE TABLE IF NOT EXISTS country_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text UNIQUE NOT NULL,
  country_name text NOT NULL,
  region text NOT NULL CHECK (region = ANY (ARRAY['USA'::text, 'EUROPE'::text, 'OTHER'::text])),
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE country_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read for country filters"
  ON country_filters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow public update for country filters"
  ON country_filters
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for country filters
CREATE INDEX IF NOT EXISTS idx_country_filters_country_code ON country_filters (country_code);
CREATE INDEX IF NOT EXISTS idx_country_filters_region ON country_filters (region);
CREATE INDEX IF NOT EXISTS idx_country_filters_enabled ON country_filters (region, enabled);

-- Create update trigger function for country_filters
CREATE OR REPLACE FUNCTION update_country_filters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for country_filters
DROP TRIGGER IF EXISTS trigger_update_country_filters_updated_at ON country_filters;
CREATE TRIGGER trigger_update_country_filters_updated_at
  BEFORE UPDATE ON country_filters
  FOR EACH ROW
  EXECUTE FUNCTION update_country_filters_updated_at();

-- Ensure blocked_users table exists
CREATE TABLE IF NOT EXISTS blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text UNIQUE NOT NULL,
  ip_address text,
  user_agent text,
  first_blocked_at timestamptz DEFAULT now(),
  last_attempt_at timestamptz DEFAULT now(),
  attempt_count integer DEFAULT 1,
  utm_campaign text,
  country_code text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public insert for blocked users"
  ON blocked_users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public read for blocked users"
  ON blocked_users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow public update for blocked users"
  ON blocked_users
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for blocked_users
CREATE INDEX IF NOT EXISTS idx_blocked_users_identifier ON blocked_users (user_identifier);
CREATE INDEX IF NOT EXISTS idx_blocked_users_ip ON blocked_users (ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_users_last_attempt ON blocked_users (last_attempt_at);
CREATE INDEX IF NOT EXISTS idx_blocked_users_created_at ON blocked_users (created_at);

-- Ensure factory_videos table exists
CREATE TABLE IF NOT EXISTS factory_videos (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  video_id text NOT NULL DEFAULT ''::text,
  order_index integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE factory_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public insert for factory videos"
  ON factory_videos
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public read for factory videos"
  ON factory_videos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow public update for factory videos"
  ON factory_videos
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public delete for factory videos"
  ON factory_videos
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for factory_videos
CREATE INDEX IF NOT EXISTS idx_factory_videos_active ON factory_videos (active);
CREATE INDEX IF NOT EXISTS idx_factory_videos_order ON factory_videos (order_index);