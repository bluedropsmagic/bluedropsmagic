// Cloaking System - Traffic Filtering
// Redirects to Google if utm_campaign doesn't contain ABO or CBO
// Disabled in Bolt environment for development

export interface CloakingConfig {
  enabled: boolean;
  redirectUrl: string;
  allowedCampaigns: string[];
  checkInterval: number;
  vslCloaking: {
    enabled: boolean;
    desktopVideoId: string;
    mobileVideoId: string;
  };
}

export const CLOAKING_CONFIG: CloakingConfig = {
  enabled: true,
  redirectUrl: 'https://google.com',
  allowedCampaigns: ['ABO', 'CBO'], // Campaign must contain one of these
  checkInterval: 1000, // Check every 1 second
  vslCloaking: {
    enabled: true,
    desktopVideoId: '681fdea4e3b3cfc4a1396f3c', // Desktop VSL
    mobileVideoId: '683ba3d1b87ae17c6e07e7db'   // Mobile VSL (original)
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
 * Check if traffic should be allowed based on utm_campaign
 */
export const isTrafficAllowed = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  const urlParams = new URLSearchParams(window.location.search);
  const utmCampaign = urlParams.get('utm_campaign');
  
  // If no utm_campaign parameter, block traffic
  if (!utmCampaign) {
    console.log('🚫 Cloaking: No utm_campaign parameter found');
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
  }
  
  return isAllowed;
};

/**
 * Check if current device is desktop (non-mobile)
 */
export const isDesktopDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check screen width (desktop = >= 1024px)
  const isDesktopWidth = window.innerWidth >= 1024;
  
  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  return isDesktopWidth && !isMobileUA;
};

/**
 * Get appropriate video ID based on device and cloaking settings
 */
export const getVideoId = (): string => {
  // Skip VSL cloaking in Bolt environment
  if (isBoltEnvironment()) {
    console.log('🔧 VSL Cloaking: Disabled in Bolt environment, using mobile VSL');
    return CLOAKING_CONFIG.vslCloaking.mobileVideoId;
  }
  
  // Skip if VSL cloaking is disabled
  if (!CLOAKING_CONFIG.vslCloaking.enabled) {
    console.log('⚠️ VSL Cloaking: Disabled in configuration, using mobile VSL');
    return CLOAKING_CONFIG.vslCloaking.mobileVideoId;
  }
  
  // Use desktop VSL for desktop devices
  if (isDesktopDevice()) {
    console.log('💻 VSL Cloaking: Desktop detected, using desktop VSL:', CLOAKING_CONFIG.vslCloaking.desktopVideoId);
    return CLOAKING_CONFIG.vslCloaking.desktopVideoId;
  } else {
    console.log('📱 VSL Cloaking: Mobile detected, using mobile VSL:', CLOAKING_CONFIG.vslCloaking.mobileVideoId);
    return CLOAKING_CONFIG.vslCloaking.mobileVideoId;
  }
};

/**
 * Toggle VSL cloaking on/off
 */
export const toggleVSLCloaking = (): boolean => {
  CLOAKING_CONFIG.vslCloaking.enabled = !CLOAKING_CONFIG.vslCloaking.enabled;
  console.log('🎬 VSL Cloaking toggled:', CLOAKING_CONFIG.vslCloaking.enabled ? 'ENABLED' : 'DISABLED');
  return CLOAKING_CONFIG.vslCloaking.enabled;
};

/**
 * Perform cloaking redirect if needed
 */
export const performCloaking = (): void => {
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
  if (!isTrafficAllowed()) {
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
export const getCloakingStatus = () => {
  const isBolt = isBoltEnvironment();
  const isAllowed = isTrafficAllowed();
  const isDesktop = isDesktopDevice();
  const currentVideoId = getVideoId();
  const urlParams = new URLSearchParams(window.location.search);
  const utmCampaign = urlParams.get('utm_campaign');
  
  return {
    enabled: CLOAKING_CONFIG.enabled && !isBolt,
    environment: isBolt ? 'development' : 'production',
    currentCampaign: utmCampaign,
    trafficAllowed: isAllowed,
    allowedKeywords: CLOAKING_CONFIG.allowedCampaigns,
    redirectUrl: CLOAKING_CONFIG.redirectUrl,
    vslCloaking: {
      enabled: CLOAKING_CONFIG.vslCloaking.enabled,
      isDesktop: isDesktop,
      currentVideoId: currentVideoId,
      desktopVideoId: CLOAKING_CONFIG.vslCloaking.desktopVideoId,
      mobileVideoId: CLOAKING_CONFIG.vslCloaking.mobileVideoId
    }
  };
};

/**
 * Test cloaking with different campaign values
 */
export const testCloaking = (testCampaign: string): boolean => {
  return CLOAKING_CONFIG.allowedCampaigns.some(keyword => 
    testCampaign.toUpperCase().includes(keyword.toUpperCase())
  );
};