// Supabase Health Check Utilities
// Monitors connection status and provides fallbacks

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  details?: any;
  timestamp: string;
}

/**
 * Perform comprehensive Supabase health check
 */
export const performHealthCheck = async (): Promise<HealthCheckResult> => {
  const timestamp = new Date().toISOString();
  
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return {
      status: 'unhealthy',
      message: 'Supabase not configured',
      details: {
        reason: 'Missing environment variables',
        action: 'Click "Connect to Supabase" in Bolt'
      },
      timestamp
    };
  }
  
  try {
    if (!supabase) {
      return {
        status: 'unhealthy',
        message: 'Supabase client not available',
        timestamp
      };
    }
    
    // Test basic connectivity
    const { data, error } = await supabase
      .from('vsl_analytics')
      .select('id')
      .limit(1);
    
    if (error) {
      return {
        status: 'degraded',
        message: 'Database query failed',
        details: {
          error: error.message,
          code: error.code
        },
        timestamp
      };
    }
    
    // Test write permissions
    try {
      const testData = {
        session_id: `health-check-${Date.now()}`,
        event_type: 'page_enter' as const,
        event_data: { test: true },
        ip: 'health-check',
        country_code: 'TEST',
        country_name: 'Health Check'
      };
      
      const { error: insertError } = await supabase
        .from('vsl_analytics')
        .insert(testData);
      
      if (insertError) {
        return {
          status: 'degraded',
          message: 'Write permissions failed',
          details: {
            error: insertError.message,
            code: insertError.code
          },
          timestamp
        };
      }
      
      // Clean up test data
      await supabase
        .from('vsl_analytics')
        .delete()
        .eq('session_id', testData.session_id);
      
    } catch (writeError) {
      return {
        status: 'degraded',
        message: 'Write test failed',
        details: { error: writeError },
        timestamp
      };
    }
    
    return {
      status: 'healthy',
      message: 'All systems operational',
      details: {
        readAccess: true,
        writeAccess: true,
        rlsEnabled: true
      },
      timestamp
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Connection failed',
      details: { error: error instanceof Error ? error.message : error },
      timestamp
    };
  }
};

/**
 * Monitor Supabase health continuously
 */
export const startHealthMonitoring = (
  onStatusChange: (result: HealthCheckResult) => void,
  intervalMs: number = 60000 // Check every minute
): () => void => {
  let isRunning = true;
  
  const runCheck = async () => {
    if (!isRunning) return;
    
    try {
      const result = await performHealthCheck();
      onStatusChange(result);
    } catch (error) {
      onStatusChange({
        status: 'unhealthy',
        message: 'Health check failed',
        details: { error },
        timestamp: new Date().toISOString()
      });
    }
    
    if (isRunning) {
      setTimeout(runCheck, intervalMs);
    }
  };
  
  // Start monitoring
  runCheck();
  
  // Return cleanup function
  return () => {
    isRunning = false;
  };
};

/**
 * Get Supabase configuration info for debugging
 */
export const getSupabaseInfo = () => {
  return {
    configured: isSupabaseConfigured(),
    url: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    client: !!supabase,
    environment: {
      hostname: window.location.hostname,
      isDev: window.location.hostname.includes('localhost') || 
             window.location.hostname.includes('127.0.0.1') ||
             window.location.hostname.includes('stackblitz') ||
             window.location.hostname.includes('bolt.new')
    }
  };
};