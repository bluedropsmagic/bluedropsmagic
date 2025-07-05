// Facebook Pixel Tracking Utilities
// Handles ONLY InitiateCheckout events for CartPanda redirects
// NO custom events, NO Purchase events on button clicks

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
  
  return typeof fbq === 'function' && fbq.loaded === true;
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
 * Track InitiateCheckout event with Facebook Pixel
 * ✅ CRITICAL: ONLY InitiateCheckout - NO Purchase events on buttons
 */
export const trackInitiateCheckout = (url?: string): void => {
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
    
    // ✅ NEW: Send InitiateCheckout to Utmify
    if (typeof window !== 'undefined' && (window as any).utmify) {
      (window as any).utmify('track', 'InitiateCheckout');
      console.log('✅ Utmify: InitiateCheckout tracked successfully');
    } else if (typeof window !== 'undefined' && window.pixelId) {
      // Fallback: Try to trigger Utmify manually if function not available
      console.log('📊 Utmify: Attempting manual InitiateCheckout trigger');
      
      // Create a custom event for Utmify
      const utmifyEvent = new CustomEvent('utmify-track', {
        detail: { event: 'InitiateCheckout', pixelId: window.pixelId }
      });
      window.dispatchEvent(utmifyEvent);
    } else {
      console.warn('⚠️ Utmify not ready for InitiateCheckout tracking');
    }
    if (url) {
      console.log('🔗 Target URL:', url);
    }
    
  } catch (error) {
    console.error('❌ Error tracking InitiateCheckout:', error);
  }
};

/**
 * Track Purchase event with Facebook Pixel 
 * ✅ CRITICAL: ONLY for actual completed purchases on thank you pages
 */
export const trackPurchase = (value: number, currency: string = 'BRL'): void => {
  if (!FACEBOOK_PIXEL_CONFIG.enabled) {
    console.log('📊 Facebook Pixel tracking disabled');
    return;
  }
  
  if (!isFacebookPixelReady()) {
    console.warn('⚠️ Facebook Pixel not ready for Purchase tracking');
    return;
  }
  
  // ✅ CRITICAL: Only allow Purchase tracking on thank you pages
  const isThankYouPage = window.location.pathname.includes('thank') || 
                        window.location.pathname.includes('success') ||
                        window.location.pathname.includes('complete') ||
                        window.location.search.includes('thank') ||
                        window.location.search.includes('success');
  
  if (!isThankYouPage) {
    console.error('🚫 BLOCKED Purchase event on non-thank-you page:', window.location.href);
    console.log('💡 Purchase events are ONLY allowed on thank you pages');
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
 * Build final redirect URL with preserved parameters
 */
export const buildRedirectUrl = (originalUrl: string): string => {
  if (!originalUrl) return originalUrl;
  
  const urlParams = new URLSearchParams(window.location.search);
  const paramString = urlParams.toString();
  
  if (!paramString) return originalUrl;
  
  // Check if URL already has parameters
  const separator = originalUrl.includes('?') ? '&' : '?';
  return `${originalUrl}${separator}${paramString}`;
};

/**
 * Initialize Facebook Pixel tracking
 * ✅ CRITICAL: NO custom events, NO Purchase on buttons
 */
export const initializeFacebookPixelTracking = (): void => {
  if (typeof window === 'undefined') return;
  
  console.log('🚀 Facebook Pixel tracking initialized');
  console.log('✅ ONLY standard events: PageView, InitiateCheckout');
  console.log('❌ NO custom events, NO Purchase on buttons');
  console.log('🎯 Purchase events ONLY on thank you pages');
};