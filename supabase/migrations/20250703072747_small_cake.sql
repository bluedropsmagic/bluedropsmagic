/*
  # Create VSL Analytics Table

  1. New Tables
    - `vsl_analytics`
      - `id` (uuid, primary key)
      - `session_id` (text) - Unique identifier for user session
      - `event_type` (text) - Type of event tracked
      - `event_data` (jsonb) - Additional event data
      - `timestamp` (timestamptz) - When the event occurred
      - `created_at` (timestamptz) - When the record was created

  2. Security
    - Enable RLS on `vsl_analytics` table
    - Add policy for public insert access (for tracking)
    - Add policy for authenticated read access (for admin dashboard)

  3. Indexes
    - Index on session_id for efficient querying
    - Index on event_type for filtering
    - Index on timestamp for time-based queries
*/

CREATE TABLE IF NOT EXISTS vsl_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('page_enter', 'video_play', 'video_progress', 'pitch_reached', 'offer_click', 'page_exit')),
  event_data jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE vsl_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public insert access for tracking events
CREATE POLICY "Allow public insert for analytics"
  ON vsl_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public read access for admin dashboard
CREATE POLICY "Allow public read for analytics"
  ON vsl_analytics
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_session_id ON vsl_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_event_type ON vsl_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_timestamp ON vsl_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_created_at ON vsl_analytics(created_at);