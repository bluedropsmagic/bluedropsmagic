/*
  # Add last_ping field for live user tracking

  1. New Columns
    - `last_ping` (timestamptz) - Tracks when user was last active
    - Index on last_ping for efficient live user queries

  2. Purpose
    - Track active users in real-time
    - Enable live user count display
    - Support real-time analytics
*/

-- Add last_ping column to track active users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'last_ping'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN last_ping timestamptz DEFAULT now();
  END IF;
END $$;

-- Create index for efficient live user queries
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_last_ping ON vsl_analytics(last_ping);

-- Update existing records to have last_ping = created_at
UPDATE vsl_analytics 
SET last_ping = created_at 
WHERE last_ping IS NULL;