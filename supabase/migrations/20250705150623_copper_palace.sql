/*
  # Ensure RLS policies are correctly configured

  This migration ensures that Row Level Security policies are properly set up
  for the vsl_analytics table with safe SQL practices.
*/

-- Ensure RLS is enabled (safe check)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'vsl_analytics') THEN
    ALTER TABLE vsl_analytics ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist (safe removal)
DROP POLICY IF EXISTS "Allow public insert for analytics" ON vsl_analytics;
DROP POLICY IF EXISTS "Allow public read for analytics" ON vsl_analytics;

-- Create policies for public access (analytics data)
-- Only create if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'vsl_analytics') THEN
    -- Create insert policy
    EXECUTE 'CREATE POLICY "Allow public insert for analytics"
      ON vsl_analytics
      FOR INSERT
      TO public
      WITH CHECK (true)';
    
    -- Create select policy  
    EXECUTE 'CREATE POLICY "Allow public read for analytics"
      ON vsl_analytics
      FOR SELECT
      TO public
      USING (true)';
  END IF;
END $$;