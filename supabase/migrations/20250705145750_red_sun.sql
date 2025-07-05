/*
  # Fix Event Type Constraint with DO Block

  1. Changes
    - Safely remove existing constraint if it exists
    - Add new constraint with simplified event types
    - Use DO block for idempotent operation

  2. Event Types
    - Old: page_enter, video_play, video_progress, pitch_reached, offer_click, page_exit
    - New: play, click, conversion

  3. Safety
    - Uses conditional logic to prevent duplicate constraint errors
    - Can be run multiple times safely
*/

DO $$
BEGIN
    -- Remove existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'vsl_analytics_event_type_check' 
        AND table_name = 'vsl_analytics'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE vsl_analytics DROP CONSTRAINT vsl_analytics_event_type_check;
        RAISE NOTICE 'Dropped existing constraint: vsl_analytics_event_type_check';
    ELSE
        RAISE NOTICE 'Constraint vsl_analytics_event_type_check does not exist, skipping drop';
    END IF;
    
    -- Add the new simplified constraint
    ALTER TABLE vsl_analytics
    ADD CONSTRAINT vsl_analytics_event_type_check
    CHECK (event_type IN ('play', 'click', 'conversion'));
    
    RAISE NOTICE 'Added new constraint with simplified event types: play, click, conversion';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
        RAISE;
END $$;