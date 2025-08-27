import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// More detailed error handling for production
if (!supabaseUrl) {
  console.warn('VITE_SUPABASE_URL is not defined. Using fallback configuration.');
}

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY is not defined. Using fallback configuration.');
}

// Create Supabase client with fallback for development
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // Disable auth persistence for analytics-only usage
      }
    })
  : null;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};

// Safe Supabase operations wrapper
export const safeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured, skipping operation');
    return fallback || null;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('❌ Supabase operation failed:', error);
    return fallback || null;
  }
};
export type Database = {
  public: {
    Tables: {
      vsl_analytics: {
        Row: {
          id: string;
          session_id: string;
          event_type: 'page_enter' | 'video_play' | 'video_progress' | 'pitch_reached' | 'offer_click' | 'page_exit';
          event_data: any;
          timestamp: string;
          created_at: string;
          ip: string | null;
          country_code: string | null;
          country_name: string | null;
          city: string | null;
          region: string | null;
          last_ping: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          event_type: 'page_enter' | 'video_play' | 'video_progress' | 'pitch_reached' | 'offer_click' | 'page_exit';
          event_data?: any;
          timestamp?: string;
          created_at?: string;
          ip?: string | null;
          country_code?: string | null;
          country_name?: string | null;
          city?: string | null;
          region?: string | null;
          last_ping?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          event_type?: 'page_enter' | 'video_play' | 'video_progress' | 'pitch_reached' | 'offer_click' | 'page_exit';
          event_data?: any;
          timestamp?: string;
          created_at?: string;
          ip?: string | null;
          country_code?: string | null;
          country_name?: string | null;
          city?: string | null;
          region?: string | null;
          last_ping?: string | null;
        };
      };
    };
  };
};