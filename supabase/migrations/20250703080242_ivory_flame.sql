/*
  # Add IP and Country fields to VSL Analytics

  1. Schema Changes
    - Add `ip` column to store visitor IP address
    - Add `country_code` column to store ISO country code
    - Add `country_name` column to store full country name
    - Add `city` column to store visitor city
    - Add `region` column to store visitor region/state

  2. Indexes
    - Add index on country_code for filtering
    - Add index on ip for lookups

  3. Notes
    - These fields will be populated from ipapi.co API
    - Existing records will have NULL values for new fields
*/

-- Add new columns for geolocation data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'ip'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN ip text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN country_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'country_name'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN country_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'city'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'region'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN region text;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_country_code ON vsl_analytics(country_code);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_ip ON vsl_analytics(ip);