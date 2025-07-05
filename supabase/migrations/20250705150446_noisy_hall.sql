/*
  # Fix policies that already exist

  1. Security
    - Drop existing policies if they exist
    - Recreate policies with proper checks
    - Ensure RLS is enabled

  2. Changes
    - Safe policy creation with IF NOT EXISTS equivalent
    - Clean up any duplicate policies
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert for analytics" ON vsl_analytics;
DROP POLICY IF EXISTS "Allow public read for analytics" ON vsl_analytics;

-- Ensure RLS is enabled
ALTER TABLE vsl_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (analytics data)
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