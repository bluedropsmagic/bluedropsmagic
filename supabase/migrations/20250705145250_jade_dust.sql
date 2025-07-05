/*
  # Update Event Type Constraint

  1. Changes
    - Remove existing event_type constraint that includes: 'page_enter', 'video_play', 'video_progress', 'pitch_reached', 'offer_click', 'page_exit'
    - Add new simplified constraint with only: 'play', 'click', 'conversion'

  2. Impact
    - Simplifies event tracking to three core events
    - Existing data with old event types will need to be migrated or handled
    - Application code will need to be updated to use new event types

  3. Migration Notes
    - This is a breaking change that will affect existing data
    - Consider data migration strategy for existing records
*/

-- Drop the existing constraint
ALTER TABLE vsl_analytics
DROP CONSTRAINT IF EXISTS vsl_analytics_event_type_check;

-- Add the new simplified constraint
ALTER TABLE vsl_analytics
ADD CONSTRAINT vsl_analytics_event_type_check
CHECK (event_type IN ('play', 'click', 'conversion'));