// VTurb Delay Configuration
// Controls when content is revealed based on video playback time

export interface DelayConfig {
  USE_STORAGE: boolean;
  CLASS_TO_HIDE: string;
  DELAYS: Array<{
    seconds: number;
    selector: string;
  }>;
}

export const DELAY_CONFIG: DelayConfig = {
  USE_STORAGE: true, // Persist state in localStorage
  CLASS_TO_HIDE: '.main-content-to-reveal', // CSS class for content to hide initially
  DELAYS: [
    {
      seconds: 10, // 10 seconds for testing
      selector: '.main-content-to-reveal'
    }
  ]
};

// Make config available globally for VTurb integration
if (typeof window !== 'undefined') {
  (window as any).DELAY_CONFIG = DELAY_CONFIG;
}

declare global {
  interface Window {
    DELAY_CONFIG: DelayConfig;
  }
}