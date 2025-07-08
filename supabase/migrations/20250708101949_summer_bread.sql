/*
  # Simplify Dashboard Analytics

  1. New Columns
    - `is_counted` (boolean, default false) - Flag to mark if session was counted in dashboard
    - `dashboard_category` (text, nullable) - Category for dashboard grouping
    - `dashboard_timestamp` (timestamptz, default now()) - When the session was counted in dashboard

  2. Indexes
    - Index on is_counted for faster filtering
    - Index on dashboard_category for grouping

  3. Changes
    - Add columns to support simplified dashboard counting
*/

-- Add new columns to the vsl_analytics table
ALTER TABLE IF EXISTS vsl_analytics 
  ADD COLUMN IF NOT EXISTS is_counted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS dashboard_category text,
  ADD COLUMN IF NOT EXISTS dashboard_timestamp timestamptz DEFAULT now();

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_is_counted ON vsl_analytics (is_counted);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_dashboard_category ON vsl_analytics (dashboard_category);