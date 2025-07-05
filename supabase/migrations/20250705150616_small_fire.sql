/*
  # Optional seed data for testing

  This migration provides optional test data for development environments.
  Uncomment the INSERT statements below if you want to add test data.
*/

-- Seed data for testing (optional)
-- Uncomment the lines below to add test data for development

-- DO $$
-- BEGIN
--   -- Only insert test data if table is empty
--   IF NOT EXISTS (SELECT 1 FROM vsl_analytics LIMIT 1) THEN
--     INSERT INTO vsl_analytics (session_id, event_type, event_data, country_code, country_name) VALUES
--     ('test-session-1', 'page_enter', '{"test": true, "page": "home"}', 'US', 'United States'),
--     ('test-session-1', 'video_play', '{"test": true, "vturb_loaded": true}', 'US', 'United States'),
--     ('test-session-1', 'video_progress', '{"test": true, "milestone": "lead_reached"}', 'US', 'United States'),
--     ('test-session-1', 'pitch_reached', '{"test": true, "time_reached": 2155}', 'US', 'United States'),
--     ('test-session-1', 'offer_click', '{"offer_type": "6-bottle", "test": true}', 'US', 'United States'),
--     ('test-session-2', 'page_enter', '{"test": true, "page": "home"}', 'CA', 'Canada'),
--     ('test-session-2', 'video_play', '{"test": true, "vturb_loaded": true}', 'CA', 'Canada'),
--     ('test-session-2', 'offer_click', '{"offer_type": "3-bottle", "test": true}', 'CA', 'Canada');
--   END IF;
-- END $$;