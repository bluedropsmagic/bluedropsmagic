/*
  # Create factory videos table

  1. New Tables
    - `factory_videos`
      - `id` (text, primary key)
      - `title` (text) - Title of the factory process step
      - `description` (text) - Description of what the video shows
      - `video_id` (text) - VTurb video ID
      - `order_index` (integer) - Order in the slideshow
      - `active` (boolean) - Whether the video is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `factory_videos` table
    - Add policy for public read access
    - Add policy for public write access (admin controlled)

  3. Indexes
    - Index on order_index for sorting
    - Index on active status for filtering
*/

CREATE TABLE IF NOT EXISTS factory_videos (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  video_id text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE factory_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for factory videos"
  ON factory_videos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert for factory videos"
  ON factory_videos
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update for factory videos"
  ON factory_videos
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete for factory videos"
  ON factory_videos
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_factory_videos_order 
  ON factory_videos (order_index);

CREATE INDEX IF NOT EXISTS idx_factory_videos_active 
  ON factory_videos (active);

-- Insert default factory videos
INSERT INTO factory_videos (id, title, description, video_id, order_index, active) VALUES
  ('1', 'State-of-the-Art Manufacturing', 'Our FDA-registered facility uses cutting-edge technology to ensure every bottle meets pharmaceutical-grade standards.', 'factory_video_1', 1, true),
  ('2', 'Rigorous Quality Control', 'Every batch undergoes extensive testing for purity, potency, and safety before reaching your doorstep.', 'factory_video_2', 2, true),
  ('3', 'Premium Ingredient Sourcing', 'We source only the highest-grade natural ingredients from trusted suppliers worldwide.', 'factory_video_3', 3, true)
ON CONFLICT (id) DO NOTHING;