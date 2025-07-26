// VSL Cloaking System - Different video for desktop users
// Shows desktop video (681fdea4e3b3cfc4a1396f3c) instead of mobile video (683ba3d1b87ae17c6e07e7db)
// Disabled in Bolt environment for development

export interface VSLCloakingConfig {
  enabled: boolean;
  mobileVideoId: string;
  desktopVideoId: string;
  breakpoint: number; // px width to consider desktop
}

export const VSL_CLOAKING_CONFIG: VSLCloakingConfig = {
  enabled: true,
  mobileVideoId: '683ba3d1b87ae17c6e07e7db', // Original mobile VSL
  desktopVideoId: '681fdea4e3b3cfc4a1396f3c', // Desktop VSL
  breakpoint: 1024 // 1024px and above = desktop
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
 * Check if current device is desktop
 */
export const isDesktopDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth >= VSL_CLOAKING_CONFIG.breakpoint;
};

/**
 * Get the appropriate video ID based on device and settings
 */
export const getVideoId = (): string => {
  // Skip cloaking in Bolt environment
  if (isBoltEnvironment()) {
    console.log('🔧 VSL Cloaking: Disabled in Bolt environment - using mobile video');
    return VSL_CLOAKING_CONFIG.mobileVideoId;
  }
  
  // Skip if cloaking is disabled
  if (!VSL_CLOAKING_CONFIG.enabled) {
    console.log('⚠️ VSL Cloaking: Disabled in configuration - using mobile video');
    return VSL_CLOAKING_CONFIG.mobileVideoId;
  }
  
  // Check device type
  if (isDesktopDevice()) {
    console.log('💻 VSL Cloaking: Desktop detected - using desktop video');
    return VSL_CLOAKING_CONFIG.desktopVideoId;
  } else {
    console.log('📱 VSL Cloaking: Mobile detected - using mobile video');
    return VSL_CLOAKING_CONFIG.mobileVideoId;
  }
};

/**
 * Get video container HTML based on video ID
 */
export const getVideoContainerHTML = (videoId: string): string => {
  if (videoId === VSL_CLOAKING_CONFIG.desktopVideoId) {
    // Desktop video HTML (landscape aspect ratio)
    return `
      <div id="vid_${videoId}" style="position: relative; width: 100%; padding: 56.25% 0 0;">
        <img id="thumb_${videoId}" src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/thumbnail.jpg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; display: block;" alt="thumbnail">
        <div id="backdrop_${videoId}" style="-webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); position: absolute; top: 0; height: 100%; width: 100%;"></div>
      </div>
    `;
  } else {
    // Mobile video HTML (portrait aspect ratio)
    return `
      <img id="thumb_${videoId}" src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/thumbnail.jpg" class="absolute inset-0 w-full h-full object-cover cursor-pointer" alt="VSL Thumbnail" loading="eager" style="touch-action: manipulation; z-index: 1;" />
      <div id="backdrop_${videoId}" class="absolute inset-0 w-full h-full cursor-pointer" style="webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); z-index: 2; touch-action: manipulation;" />
    `;
  }
};

/**
 * Get video script source based on video ID
 */
export const getVideoScriptSrc = (videoId: string): string => {
  return `https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/player.js`;
};

/**
 * Check if VSL cloaking should be applied
 */
export const shouldApplyVSLCloaking = (): boolean => {
  return VSL_CLOAKING_CONFIG.enabled && !isBoltEnvironment() && isDesktopDevice();
};

/**
 * Get VSL cloaking status for admin dashboard
 */
export const getVSLCloakingStatus = () => {
  const isBolt = isBoltEnvironment();
  const isDesktop = isDesktopDevice();
  const currentVideoId = getVideoId();
  
  return {
    enabled: VSL_CLOAKING_CONFIG.enabled,
    environment: isBolt ? 'development' : 'production',
    deviceType: isDesktop ? 'desktop' : 'mobile',
    currentVideoId,
    isUsingDesktopVideo: currentVideoId === VSL_CLOAKING_CONFIG.desktopVideoId,
    breakpoint: VSL_CLOAKING_CONFIG.breakpoint,
    mobileVideoId: VSL_CLOAKING_CONFIG.mobileVideoId,
    desktopVideoId: VSL_CLOAKING_CONFIG.desktopVideoId
  };
};

/**
 * Toggle VSL cloaking on/off
 */
export const toggleVSLCloaking = (): boolean => {
  VSL_CLOAKING_CONFIG.enabled = !VSL_CLOAKING_CONFIG.enabled;
  console.log(`🎬 VSL Cloaking ${VSL_CLOAKING_CONFIG.enabled ? 'ENABLED' : 'DISABLED'}`);
  
  // Store in localStorage for persistence
  localStorage.setItem('vsl_cloaking_enabled', VSL_CLOAKING_CONFIG.enabled.toString());
  
  return VSL_CLOAKING_CONFIG.enabled;
};

/**
 * Initialize VSL cloaking system
 */
export const initializeVSLCloaking = (): void => {
  // Load saved setting from localStorage
  const savedSetting = localStorage.getItem('vsl_cloaking_enabled');
  if (savedSetting !== null) {
    VSL_CLOAKING_CONFIG.enabled = savedSetting === 'true';
  }
  
  console.log('🎬 VSL Cloaking system initialized');
  console.log(`📱 Mobile video: ${VSL_CLOAKING_CONFIG.mobileVideoId}`);
  console.log(`💻 Desktop video: ${VSL_CLOAKING_CONFIG.desktopVideoId}`);
  console.log(`🔧 Bolt environment: ${isBoltEnvironment() ? 'YES (cloaking disabled)' : 'NO'}`);
  console.log(`⚙️ Cloaking enabled: ${VSL_CLOAKING_CONFIG.enabled}`);
  console.log(`📏 Current device: ${isDesktopDevice() ? 'Desktop' : 'Mobile'} (${window.innerWidth}px)`);
  console.log(`🎯 Using video: ${getVideoId()}`);
};