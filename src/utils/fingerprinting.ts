// Native Fingerprinting System
// Replaces ClickHidden with custom, lightweight fingerprinting

export interface FingerprintData {
  id: string;
  timestamp: number;
  browser: {
    userAgent: string;
    language: string;
    languages: string[];
    platform: string;
    cookieEnabled: boolean;
    doNotTrack: string | null;
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
    availWidth: number;
    availHeight: number;
  };
  timezone: {
    offset: number;
    name: string;
  };
  hardware: {
    cores: number;
    memory: number;
    connection?: string;
  };
  features: {
    webgl: boolean;
    canvas: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    webRTC: boolean;
  };
  plugins: string[];
  fonts: string[];
  hash: string;
}

/**
 * Generate browser fingerprint
 */
export const generateFingerprint = async (): Promise<FingerprintData> => {
  const timestamp = Date.now();
  
  // Basic browser info
  const browser = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: Array.from(navigator.languages || []),
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack
  };

  // Screen information
  const screen = {
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight
  };

  // Timezone
  const timezone = {
    offset: new Date().getTimezoneOffset(),
    name: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  // Hardware info
  const hardware = {
    cores: (navigator as any).hardwareConcurrency || 1,
    memory: (navigator as any).deviceMemory || 0,
    connection: (navigator as any).connection?.effectiveType || undefined
  };

  // Feature detection
  const features = {
    webgl: !!getWebGLContext(),
    canvas: !!document.createElement('canvas').getContext('2d'),
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    indexedDB: !!window.indexedDB,
    webRTC: !!(navigator as any).mediaDevices?.getUserMedia
  };

  // Plugin detection
  const plugins = Array.from(navigator.plugins || []).map(plugin => plugin.name);

  // Font detection
  const fonts = await detectFonts();

  // Generate components for hash
  const components = [
    browser.userAgent,
    browser.language,
    browser.platform,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    screen.pixelRatio,
    timezone.offset,
    timezone.name,
    hardware.cores,
    hardware.memory,
    Object.values(features).join(''),
    plugins.join(''),
    fonts.join('')
  ];

  // Generate hash
  const hash = await generateHash(components.join('|'));
  
  // Generate unique ID
  const id = `fp_${hash.substring(0, 16)}_${timestamp}`;

  return {
    id,
    timestamp,
    browser,
    screen,
    timezone,
    hardware,
    features,
    plugins,
    fonts,
    hash
  };
};

/**
 * Get WebGL context for fingerprinting
 */
const getWebGLContext = (): WebGLRenderingContext | null => {
  try {
    const canvas = document.createElement('canvas');
    return canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (error) {
    return null;
  }
};

/**
 * Detect available fonts
 */
const detectFonts = async (): Promise<string[]> => {
  const testFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
    'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
    'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Sans Unicode',
    'Tahoma', 'Lucida Console', 'Monaco', 'Courier', 'Bradley Hand',
    'Brush Script MT', 'Luminari', 'Chalkduster'
  ];

  const availableFonts: string[] = [];
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const baseFonts = ['monospace', 'sans-serif', 'serif'];

  // Create test canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return [];

  // Get baseline measurements
  const baselines: { [key: string]: number } = {};
  baseFonts.forEach(baseFont => {
    context.font = `${testSize} ${baseFont}`;
    baselines[baseFont] = context.measureText(testString).width;
  });

  // Test each font
  for (const font of testFonts) {
    let detected = false;
    
    for (const baseFont of baseFonts) {
      context.font = `${testSize} ${font}, ${baseFont}`;
      const width = context.measureText(testString).width;
      
      if (width !== baselines[baseFont]) {
        detected = true;
        break;
      }
    }
    
    if (detected) {
      availableFonts.push(font);
    }
  }

  return availableFonts;
};

/**
 * Generate hash from string
 */
const generateHash = async (input: string): Promise<string> => {
  try {
    // Use Web Crypto API if available
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    console.warn('Web Crypto API not available, using fallback hash');
  }

  // Fallback: Simple hash function
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Store fingerprint data
 */
export const storeFingerprint = (fingerprint: FingerprintData): void => {
  try {
    // Store in localStorage for persistence
    localStorage.setItem('user_fingerprint', JSON.stringify(fingerprint));
    
    // Store in sessionStorage for current session
    sessionStorage.setItem('session_fingerprint', JSON.stringify(fingerprint));
    
    console.log('🔍 Fingerprint stored:', fingerprint.id);
  } catch (error) {
    console.error('Error storing fingerprint:', error);
  }
};

/**
 * Get stored fingerprint
 */
export const getStoredFingerprint = (): FingerprintData | null => {
  try {
    // Try localStorage first
    const stored = localStorage.getItem('user_fingerprint');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Fallback to sessionStorage
    const sessionStored = sessionStorage.getItem('session_fingerprint');
    if (sessionStored) {
      return JSON.parse(sessionStored);
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving fingerprint:', error);
    return null;
  }
};

/**
 * Check if fingerprint has changed (returning user detection)
 */
export const hasChangedFingerprint = (current: FingerprintData, stored: FingerprintData): boolean => {
  // Compare key components that shouldn't change
  const keyComponents = [
    current.screen.width === stored.screen.width,
    current.screen.height === stored.screen.height,
    current.browser.platform === stored.browser.platform,
    current.timezone.name === stored.timezone.name,
    current.hardware.cores === stored.hardware.cores
  ];
  
  // If more than 2 key components changed, likely different device/user
  const changedCount = keyComponents.filter(same => !same).length;
  return changedCount > 2;
};

/**
 * Initialize fingerprinting system
 */
export const initializeFingerprinting = async (): Promise<FingerprintData> => {
  console.log('🔍 Initializing native fingerprinting system...');
  
  try {
    // Generate new fingerprint
    const fingerprint = await generateFingerprint();
    
    // Check for existing fingerprint
    const stored = getStoredFingerprint();
    
    if (stored) {
      const hasChanged = hasChangedFingerprint(fingerprint, stored);
      
      if (hasChanged) {
        console.log('🔄 Device/browser changed, generating new fingerprint');
        storeFingerprint(fingerprint);
        return fingerprint;
      } else {
        console.log('👤 Returning user detected, using stored fingerprint');
        // Update timestamp but keep original ID
        const updatedFingerprint = {
          ...stored,
          timestamp: fingerprint.timestamp
        };
        storeFingerprint(updatedFingerprint);
        return updatedFingerprint;
      }
    } else {
      console.log('🆕 New user, storing fingerprint');
      storeFingerprint(fingerprint);
      return fingerprint;
    }
    
  } catch (error) {
    console.error('Error initializing fingerprinting:', error);
    
    // Fallback: simple fingerprint
    const fallbackFingerprint: FingerprintData = {
      id: `fp_fallback_${Date.now()}`,
      timestamp: Date.now(),
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: [],
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight
      },
      timezone: {
        offset: new Date().getTimezoneOffset(),
        name: 'Unknown'
      },
      hardware: {
        cores: 1,
        memory: 0
      },
      features: {
        webgl: false,
        canvas: false,
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        indexedDB: !!window.indexedDB,
        webRTC: false
      },
      plugins: [],
      fonts: [],
      hash: 'fallback'
    };
    
    storeFingerprint(fallbackFingerprint);
    return fallbackFingerprint;
  }
};

/**
 * Get fingerprint for analytics
 */
export const getFingerprintForAnalytics = (): { fingerprint_id: string; is_returning_user: boolean } => {
  const stored = getStoredFingerprint();
  
  if (stored) {
    const isReturning = Date.now() - stored.timestamp > 24 * 60 * 60 * 1000; // More than 24 hours old
    
    return {
      fingerprint_id: stored.id,
      is_returning_user: isReturning
    };
  }
  
  return {
    fingerprint_id: 'unknown',
    is_returning_user: false
  };
};

/**
 * Debug fingerprint info (admin only)
 */
export const showFingerprintDebug = (): void => {
  const hostname = window.location.hostname;
  const isDebugEnv = hostname.includes('localhost') || 
                     hostname.includes('127.0.0.1') || 
                     hostname.includes('stackblitz') ||
                     hostname.includes('bolt.new');
  
  if (isDebugEnv) {
    const stored = getStoredFingerprint();
    if (stored) {
      console.log('🔍 Fingerprint Debug:', {
        id: stored.id,
        hash: stored.hash,
        timestamp: new Date(stored.timestamp).toLocaleString(),
        browser: stored.browser.userAgent.substring(0, 50) + '...',
        screen: `${stored.screen.width}x${stored.screen.height}`,
        features: Object.entries(stored.features).filter(([_, value]) => value).map(([key]) => key),
        fonts: stored.fonts.length + ' fonts detected'
      });
    }
  }
};