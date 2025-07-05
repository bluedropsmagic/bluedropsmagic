/*
  # Fix event type constraint

  1. Changes
    - Drop existing constraint if it exists (safe operation)
    - Add new constraint with simplified event types
    - Uses simple DROP IF EXISTS approach for reliability

  2. Event Types
    - 'play' - Video play events
    - 'click' - Button/link click events  
    - 'conversion' - Purchase/conversion events

  3. Notes
    - This approach is more reliable than DO blocks
    - PostgreSQL guarantees IF EXISTS operations work correctly
    - Avoids schema cache and timing issues
*/

-- Drop existing constraint safely
ALTER TABLE vsl_analytics 
DROP CONSTRAINT IF EXISTS vsl_analytics_event_type_check;

-- Add new constraint with simplified event types
ALTER TABLE vsl_analytics
ADD CONSTRAINT vsl_analytics_event_type_check
CHECK (event_type IN ('play', 'click', 'conversion'));