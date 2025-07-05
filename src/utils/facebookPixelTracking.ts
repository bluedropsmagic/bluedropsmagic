// Facebook Pixel Tracking Utilities
// Handles InitiateCheckout events for CartPanda redirects

export interface FacebookPixelConfig {
  pixelId: string;
  enabled: boolean;
}

export const FACEBOOK_PIXEL_CONFIG: FacebookPixelConfig = {
  pixelId: '1205864517252800',
  enabled: true
};

/**
 * Check if Facebook Pixel is properly loaded and initialized
 */
export const isFacebookPixelReady = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const fbq = (window as any).fbq;
  const fbqInitialized = (window as any).fbqInitialized;
  const fbqInitializing = (window as any).fbqInitializing;
  
  // ✅ Check for duplicate scripts
  const fbScripts = document.querySelectorAll('script[src*="fbevents.js"]');
  if (fbScripts.length > 1) {
    console.error('🚨 MULTIPLE Meta Pixel scripts detected:', fbScripts.length);
    return false;
  }
  
  return typeof fbq === 'function' && 
         fbqInitialized === true &&
         !fbqInitializing;
};

/**
 * Check if URL is a CartPanda checkout URL
 */
export const isCartPandaUrl = (url: string): boolean => {
  if (!url) return false;
  
  return url.includes('cartpanda.com') || 
         url.includes('paybluedrops.com') ||
         url.includes('pagamento.paybluedrops.com');
};

/**
 * Get current URL parameters to preserve during redirect
 */
export const getCurrentUrlParams = (): string => {
  if (typeof window === 'undefined') return '';
  
  const params = new URLSearchParams(window.location.search);
  const urlParams = params.toString();
  
  return urlParams ? `?${urlParams}` : '';
};

/**
 * Build final redirect URL with preserved parameters
 */
export const buildRedirectUrl = (originalUrl: string): string => {
  if (!originalUrl) return originalUrl;
  
  const urlParams = getCurrentUrlParams();
  if (!urlParams) return originalUrl;
  
  // Check if URL already has parameters
  const separator = originalUrl.includes('?') ? '&' : '?';
  return `${originalUrl}${separator}${urlParams.substring(1)}`; // Remove leading ?
};

/**
 * Track InitiateCheckout event with Facebook Pixel
 */
export const trackInitiateCheckout = (url?: string): void => {
  // ✅ Check for duplicate pixels first
  const fbScripts = document.querySelectorAll('script[src*="fbevents.js"]');
  if (fbScripts.length > 1) {
    console.error('🚨 CANNOT track - Multiple Meta Pixel scripts detected:', fbScripts.length);
    console.log('🔧 Please refresh the page to fix duplicate pixels');
    return;
  }
  
  if (!FACEBOOK_PIXEL_CONFIG.enabled) {
    console.log('📊 Facebook Pixel tracking disabled');
    return;
  }
  
  if (!isFacebookPixelReady()) {
    console.warn('⚠️ Facebook Pixel not ready for InitiateCheckout tracking');
    return;
  }
  
  try {
    // ✅ CRITICAL: ONLY InitiateCheckout event - NO Purchase event here
    const fbq = (window as any).fbq;
    fbq('track', 'InitiateCheckout');
    
    console.log('✅ Meta Pixel: InitiateCheckout tracked successfully');
    
    if (url) {
      console.log('🔗 Target URL:', url);
    }
    
  } catch (error) {
    console.error('❌ Error tracking InitiateCheckout:', error);
  }
};

/**
 * Track Purchase event with Facebook Pixel (ONLY for actual purchases)
 */
export const trackPurchase = (value: number, currency: string = 'BRL'): void => {
  // ✅ Check for duplicate pixels first
  const fbScripts = document.querySelectorAll('script[src*="fbevents.js"]');
  if (fbScripts.length > 1) {
    console.error('🚨 CANNOT track - Multiple Meta Pixel scripts detected:', fbScripts.length);
    return;
  }
  
  if (!FACEBOOK_PIXEL_CONFIG.enabled) {
    console.log('📊 Facebook Pixel tracking disabled');
    return;
  }
  
  if (!isFacebookPixelReady()) {
    console.warn('⚠️ Facebook Pixel not ready for Purchase tracking');
    return;
  }
  
  try {
    // ✅ ONLY track Purchase for actual completed purchases
    const fbq = (window as any).fbq;
    fbq('track', 'Purchase', {
      value: value,
      currency: currency
    });
    
    console.log('✅ Meta Pixel: Purchase tracked successfully', { value, currency });
    
  } catch (error) {
    console.error('❌ Error tracking Purchase:', error);
  }
};

/**
 * ✅ CRITICAL: NO custom events allowed
 * Only standard Facebook Pixel events are permitted:
 * - PageView
 * - InitiateCheckout  
 * - Purchase
 * - Lead
 * - CompleteRegistration
 * - AddToCart
 * - ViewContent
 */

/**
 * Handle click on CartPanda links/buttons
 */
export const handleCartPandaClick = (
  element: HTMLElement, 
  event: Event, 
  customUrl?: string
): void => {
  // Get the target URL
  const href = customUrl || 
               element.getAttribute('href') ||
               element.getAttribute('data-href') ||
               element.getAttribute('data-url') ||
               (element as any).dataset?.href ||
               '';
  
  if (!isCartPandaUrl(href)) {
    return; // Not a CartPanda URL, do nothing
  }
  
  console.log('🛒 CartPanda click detected:', href);
  
  // Track InitiateCheckout BEFORE redirect
  trackInitiateCheckout(href);
  
  // Handle redirect based on element type
  if (element.tagName === 'A') {
    // For anchor tags, prevent default and redirect manually
    event.preventDefault();
    
    const finalUrl = buildRedirectUrl(href);
    console.log('🔗 Redirecting to:', finalUrl);
    
    // Small delay to ensure pixel event is sent
    setTimeout(() => {
      window.location.href = finalUrl;
    }, 100);
    
  } else if (element.tagName === 'BUTTON') {
    // For buttons, the redirect will be handled by the existing onClick handler
    // We just track the event here
    console.log('🔘 Button click tracked, redirect handled by existing handler');
  }
};

/**
 * Check for and remove duplicate Meta Pixel scripts
 */
export const checkAndFixDuplicatePixels = (): void => {
  const fbScripts = document.querySelectorAll('script[src*="fbevents.js"]');
  
  if (fbScripts.length > 1) {
    console.error('🚨 DUPLICATE Meta Pixel scripts detected:', fbScripts.length);
    
    // Remove all but the first script
    for (let i = 1; i < fbScripts.length; i++) {
      console.log('🗑️ Removing duplicate Meta Pixel script:', i + 1);
      fbScripts[i].remove();
    }
    
    console.log('✅ Duplicate Meta Pixel scripts removed');
  } else {
    console.log('✅ No duplicate Meta Pixel scripts found');
  }
};

/**
 * Setup global click tracking for CartPanda URLs
 */
export const setupCartPandaTracking = (): void => {
  if (typeof window === 'undefined') return;
  
  console.log('🚀 Setting up CartPanda click tracking...');
  
  // ✅ Check for duplicates first
  checkAndFixDuplicatePixels();
  
  // Track all existing elements
  const trackExistingElements = () => {
    document.querySelectorAll('a, button').forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      
      // Skip if already has tracking
      if (htmlElement.dataset.cartpandaTracked === 'true') {
        return;
      }
      
      // Get potential URLs
      const href = htmlElement.getAttribute('href') ||
                   htmlElement.getAttribute('data-href') ||
                   htmlElement.getAttribute('data-url') ||
                   htmlElement.dataset?.href ||
                   '';
      
      if (isCartPandaUrl(href)) {
        console.log('🎯 Adding CartPanda tracking to element:', htmlElement.tagName, href);
        
        // Add click listener
        htmlElement.addEventListener('click', (event) => {
          handleCartPandaClick(htmlElement, event);
        });
        
        // Mark as tracked
        htmlElement.dataset.cartpandaTracked = 'true';
      }
    });
  };
  
  // Track existing elements
  trackExistingElements();
  
  // Setup mutation observer for dynamic content
  const observer = new MutationObserver((mutations) => {
    let shouldRetrack = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added element or its children have CartPanda URLs
            const elementsToCheck = [element, ...element.querySelectorAll('a, button')];
            
            elementsToCheck.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const href = htmlEl.getAttribute('href') ||
                          htmlEl.getAttribute('data-href') ||
                          htmlEl.getAttribute('data-url') ||
                          htmlEl.dataset?.href ||
                          '';
              
              if (isCartPandaUrl(href) && htmlEl.dataset.cartpandaTracked !== 'true') {
                shouldRetrack = true;
              }
            });
          }
        });
      }
    });
    
    if (shouldRetrack) {
      console.log('🔄 New CartPanda elements detected, updating tracking...');
      trackExistingElements();
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('✅ CartPanda tracking setup complete');
  
  // Cleanup function
  return () => {
    observer.disconnect();
  };
};

/**
 * Initialize Facebook Pixel CartPanda tracking
 */
export const initializeFacebookPixelTracking = (): void => {
  if (typeof window === 'undefined') return;
  
  // ✅ Check for duplicates immediately
  setTimeout(() => {
    checkAndFixDuplicatePixels();
  }, 1000);
  
  // Wait for Facebook Pixel to be ready
  const checkPixelReady = () => {
    if (isFacebookPixelReady()) {
      console.log('✅ Facebook Pixel ready, setting up CartPanda tracking');
      setupCartPandaTracking();
    } else {
      console.log('⏳ Waiting for Facebook Pixel to initialize...');
      setTimeout(checkPixelReady, 500);
    }
  };
  
  // Start checking
  checkPixelReady();
  
  // Also setup on DOM ready as fallback
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        checkAndFixDuplicatePixels();
        checkPixelReady();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      checkAndFixDuplicatePixels();
      checkPixelReady();
    }, 1000);
  }
};