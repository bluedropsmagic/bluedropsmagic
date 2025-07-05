/*
  # Fix constraint error with simple SQL

  1. Changes
    - Drop existing constraint safely
    - Add new constraint with all event types
    - Add vturb_loaded column if missing
    - Add necessary indexes

  2. Event Types Supported
    - page_enter: User enters the page
    - video_play: VTurb video loads successfully
    - video_progress: User reaches milestones
    - pitch_reached: User reaches pitch moment
    - offer_click: User clicks purchase buttons
    - page_exit: User leaves the page
*/

-- Drop existing constraint (ignore if doesn't exist)
ALTER TABLE vsl_analytics DROP CONSTRAINT IF EXISTS vsl_analytics_event_type_check;

-- Add new constraint with all supported event types
ALTER TABLE vsl_analytics ADD CONSTRAINT vsl_analytics_event_type_check 
CHECK (event_type IN (
  'page_enter',
  'video_play', 
  'video_progress',
  'pitch_reached',
  'offer_click',
  'page_exit'
));

-- Add vturb_loaded column if it doesn't exist
ALTER TABLE vsl_analytics ADD COLUMN IF NOT EXISTS vturb_loaded BOOLEAN DEFAULT false;

-- Create index for vturb_loaded
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_vturb_loaded ON vsl_analytics(vturb_loaded);