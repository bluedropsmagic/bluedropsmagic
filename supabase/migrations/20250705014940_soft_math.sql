/*
  # Fix constraint error - Update event types safely

  1. Changes
    - Safely drop existing constraint if it exists
    - Recreate constraint with updated event types
    - Ensure no data loss during migration

  2. Event Types Supported
    - page_enter, video_play, video_progress, pitch_reached, offer_click, page_exit

  3. Safety
    - Uses IF EXISTS to prevent errors
    - Maintains data integrity
*/

-- ✅ SAFE: Drop existing constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'vsl_analytics_event_type_check' 
    AND table_name = 'vsl_analytics'
  ) THEN
    ALTER TABLE vsl_analytics DROP CONSTRAINT vsl_analytics_event_type_check;
  END IF;
END $$;

-- ✅ SAFE: Recreate constraint with all supported event types
ALTER TABLE vsl_analytics
ADD CONSTRAINT vsl_analytics_event_type_check 
CHECK (event_type = ANY (ARRAY[
  'page_enter'::text, 
  'video_play'::text, 
  'video_progress'::text, 
  'pitch_reached'::text, 
  'offer_click'::text, 
  'page_exit'::text
]));

-- ✅ SAFE: Ensure vturb_loaded column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vsl_analytics' AND column_name = 'vturb_loaded'
  ) THEN
    ALTER TABLE vsl_analytics ADD COLUMN vturb_loaded BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ✅ SAFE: Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_vturb_loaded ON vsl_analytics(vturb_loaded);