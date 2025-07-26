/*
  # Create blocked users tracking table

  1. New Tables
    - `blocked_users`
      - `id` (uuid, primary key)
      - `user_identifier` (text, unique) - Browser fingerprint or IP
      - `ip_address` (text) - User's IP address
      - `user_agent` (text) - Browser user agent
      - `first_blocked_at` (timestamp) - When first blocked
      - `last_attempt_at` (timestamp) - Last access attempt
      - `attempt_count` (integer) - Number of access attempts
      - `utm_campaign` (text) - Campaign that caused blocking
      - `country_code` (text) - User's country
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `blocked_users` table
    - Add policy for public insert (to track blocked users)
    - Add policy for public read (to check if user is blocked)

  3. Indexes
    - Index on user_identifier for fast lookups
    - Index on ip_address for IP-based blocking
    - Index on created_at for cleanup queries
*/

CREATE TABLE IF NOT EXISTS blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text UNIQUE NOT NULL,
  ip_address text,
  user_agent text,
  first_blocked_at timestamptz DEFAULT now(),
  last_attempt_at timestamptz DEFAULT now(),
  attempt_count integer DEFAULT 1,
  utm_campaign text,
  country_code text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Allow public to insert blocked users (for tracking)
CREATE POLICY "Allow public insert for blocked users"
  ON blocked_users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to read blocked users (for checking if blocked)
CREATE POLICY "Allow public read for blocked users"
  ON blocked_users
  FOR SELECT
  TO public
  USING (true);

-- Allow public to update blocked users (for updating attempt count)
CREATE POLICY "Allow public update for blocked users"
  ON blocked_users
  FOR UPDATE
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocked_users_identifier ON blocked_users (user_identifier);
CREATE INDEX IF NOT EXISTS idx_blocked_users_ip ON blocked_users (ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_users_created_at ON blocked_users (created_at);
CREATE INDEX IF NOT EXISTS idx_blocked_users_last_attempt ON blocked_users (last_attempt_at);