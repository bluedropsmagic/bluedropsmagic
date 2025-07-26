import { supabase } from '../lib/supabase';

// Cloaking System - Traffic Filtering
// Redirects to Google if utm_campaign doesn't contain ABO or CBO
// Disabled in Bolt environment for development
// Now includes permanent blocking system with Supabase tracking

export interface CloakingConfig {
  enabled: boolean;
  redirectUrl: string;
  allowedCampaigns: string[];
  checkInterval: number;
  permanentBlocking: boolean;
}

export const CLOAKING_CONFIG: CloakingConfig = {
  enabled: true,
  redirectUrl: 'https://google.com',
  allowedCampaigns: ['ABO', 'CBO'], // Campaign must contain one of these
  checkInterval: 1000, // Check every 1 second
  permanentBlocking: true // Enable permanent blocking system
};

/**
 * Generate a unique browser fingerprint for user identification
 */
export const generateUserFingerprint = (): string => {
  if (typeof window === 'undefined') return 'server-side';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.deviceMemory || 'unknown'
  ].join('|');
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Get user's IP address (simplified for demo)
 */
export const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'unknown';
  }
};

/**
 * Check if user is permanently blocked
 */
export const isUserBlocked = async (): Promise<boolean> => {
  if (!CLOAKING_CONFIG.permanentBlocking) return false;
  
  try {
    const userIdentifier = generateUserFingerprint();
    
    const { data, error } = await supabase
      .from('blocked_users')
      .select('id, first_blocked_at, attempt_count')
      .eq('user_identifier', userIdentifier)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking blocked status:', error);
      return false;
    }
    
    if (data) {
      console.log('🚫 User is permanently blocked:', {
        blockedAt: data.first_blocked_at,
        attempts: data.attempt_count
      });
      
      // Update attempt count
      await supabase
        .from('blocked_users')
        .update({ 
          last_attempt_at: new Date().toISOString(),
          attempt_count: data.attempt_count + 1
        })
        .eq('user_identifier', userIdentifier);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error in isUserBlocked:', error);
    return false;
  }
};

/**
 * Add user to permanent block list
 */
export const addUserToBlockList = async (utmCampaign?: string): Promise<void> => {
  if (!CLOAKING_CONFIG.permanentBlocking) return;
  
  try {
    const userIdentifier = generateUserFingerprint();
    const ipAddress = await getUserIP();
    
    const blockData = {
      user_identifier: userIdentifier,
      ip_address: ipAddress,
      user_agent: navigator.userAgent,
      utm_campaign: utmCampaign || 'none',
      country_code: 'unknown', // Could be enhanced with geolocation
      first_blocked_at: new Date().toISOString(),
      last_attempt_at: new Date().toISOString(),
      attempt_count: 1
    };
    
    const { error } = await supabase
      .from('blocked_users')
      .insert(blockData);
    
    if (error) {
      console.error('Error adding user to block list:', error);
    } else {
      console.log('🚫 User added to permanent block list:', userIdentifier);
    }
  } catch (error) {
    console.error('Error in addUserToBlockList:', error);
  }
};

/**
 * Check if current environment is Bolt (development)
 */
export const isBoltEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname.includes('stackblitz') || 
         hostname.includes('bolt.new') ||
         hostname.includes('webcontainer') ||
         hostname.includes('localhost') ||
         hostname.includes('127.0.0.1');
};

/**
 * Check if traffic should be allowed based on utm_campaign and permanent blocking
 */
export const isTrafficAllowed = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return true;
  
  // Check permanent blocking first
  if (await isUserBlocked()) {
    console.log('🚫 Cloaking: User is permanently blocked');
    return false;
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const utmCampaign = urlParams.get('utm_campaign');
  
  // If no utm_campaign parameter, block traffic
  if (!utmCampaign) {
    console.log('🚫 Cloaking: No utm_campaign parameter found');
    // Add to permanent block list
    await addUserToBlockList();
    return false;
  }
  
  // Check if campaign contains allowed keywords
  const isAllowed = CLOAKING_CONFIG.allowedCampaigns.some(keyword => 
    utmCampaign.toUpperCase().includes(keyword.toUpperCase())
  );
  
  if (isAllowed) {
    console.log('✅ Cloaking: Traffic allowed for campaign:', utmCampaign);
  } else {
    console.log('🚫 Cloaking: Traffic blocked for campaign:', utmCampaign);
    // Add to permanent block list
    await addUserToBlockList(utmCampaign);
  }
  
  return isAllowed;
};

/**
 * Perform cloaking redirect if needed
 */
export const performCloaking = async (): Promise<void> => {
  // Skip cloaking in Bolt environment
  if (isBoltEnvironment()) {
    console.log('🔧 Cloaking: Disabled in Bolt environment');
    return;
  }
  
  // Skip if cloaking is disabled
  if (!CLOAKING_CONFIG.enabled) {
    console.log('⚠️ Cloaking: Disabled in configuration');
    return;
  }
  
  // Check if traffic is allowed
  if (!(await isTrafficAllowed())) {
    console.log('🚫 Cloaking: Redirecting to', CLOAKING_CONFIG.redirectUrl);
    
    // Add small delay to avoid detection
    setTimeout(() => {
      window.location.href = CLOAKING_CONFIG.redirectUrl;
    }, 100);
  }
};

/**
 * Initialize cloaking system
 */
export const initializeCloaking = (): void => {
  if (typeof window === 'undefined') return;
  
  console.log('🛡️ Cloaking system initializing...');
  console.log('🔒 Permanent blocking:', CLOAKING_CONFIG.permanentBlocking ? 'ENABLED' : 'DISABLED');
  
  // Show status in Bolt environment
  if (isBoltEnvironment()) {
    console.log('🔧 Bolt environment detected - cloaking DISABLED for development');
    
    // Show debug info in development
    const urlParams = new URLSearchParams(window.location.search);
    const utmCampaign = urlParams.get('utm_campaign');
    
    if (utmCampaign) {
      const wouldBeAllowed = CLOAKING_CONFIG.allowedCampaigns.some(keyword => 
        utmCampaign.toUpperCase().includes(keyword.toUpperCase())
      );
      
      console.log(`🧪 Debug: Campaign "${utmCampaign}" would be ${wouldBeAllowed ? 'ALLOWED' : 'BLOCKED'} in production`);
    } else {
      console.log('🧪 Debug: No utm_campaign - would be BLOCKED in production');
    }
    
    return;
  }
  
  // Perform initial check
  performCloaking();
  
  // Set up periodic checks (in case URL changes)
  setInterval(() => {
    performCloaking();
  }, CLOAKING_CONFIG.checkInterval);
  
  console.log('🛡️ Cloaking system active - monitoring traffic');
};

/**
 * Get cloaking status for admin dashboard
 */
export const getCloakingStatus = async () => {
  const isBolt = isBoltEnvironment();
  const isAllowed = await isTrafficAllowed();
  const urlParams = new URLSearchParams(window.location.search);
  const utmCampaign = urlParams.get('utm_campaign');
  const userIdentifier = generateUserFingerprint();
  const isBlocked = await isUserBlocked();
  
  return {
    enabled: CLOAKING_CONFIG.enabled && !isBolt,
    environment: isBolt ? 'development' : 'production',
    currentCampaign: utmCampaign,
    trafficAllowed: isAllowed,
    allowedKeywords: CLOAKING_CONFIG.allowedCampaigns,
    redirectUrl: CLOAKING_CONFIG.redirectUrl,
    permanentBlocking: CLOAKING_CONFIG.permanentBlocking,
    userIdentifier: userIdentifier,
    isBlocked: isBlocked
  };
};

/**
 * Test cloaking with different campaign values
 */
export const testCloaking = (testCampaign: string): boolean => {
  return CLOAKING_CONFIG.allowedCampaigns.some(keyword => 
    testCampaign.toUpperCase().includes(keyword.toUpperCase())
  );