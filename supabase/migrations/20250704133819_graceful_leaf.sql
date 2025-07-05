/*
  # Update analytics tracking system

  1. New Fields
    - Add new fields to track page time vs video time
    - Add fields for VTurb loading status
    - Add fields for total time on page

  2. Changes
    - Update event_type check constraint to include new event types
    - Add indexes for new fields
*/

-- Add new fields to track page time vs video time
ALTER TABLE vsl_analytics
ADD COLUMN IF NOT EXISTS vturb_loaded BOOLEAN DEFAULT false;

-- Update event_type check constraint to include new event types
ALTER TABLE vsl_analytics
DROP CONSTRAINT IF EXISTS vsl_analytics_event_type_check;

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

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_vturb_loaded ON public.vsl_analytics USING btree (vturb_loaded);