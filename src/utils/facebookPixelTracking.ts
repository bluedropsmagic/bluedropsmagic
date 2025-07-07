// Facebook Pixel Tracking Utilities
// Handles ONLY InitiateCheckout events for Meta Ads traffic
// Filters out organic traffic and limits to one event per session

export interface FacebookPixelConfig {
  pixelId: string;
  enabled: boolean;
}

export const FACEBOOK_PIXEL_CONFIG: FacebookPixelConfig = {
  pixelId: '1205864517252800',
  enabled: true
};

/**
 * Check if current traffic is from Meta Ads (Facebook/Instagram paid ads)
 */
export const isMetaAdsTraffic = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer || '';
  
  // Method 1: FBCLID (Facebook Click ID) - Most reliable for paid ads
  const fbclid = urlParams.get('fbclid');
  if (fbclid) {
    console.log('🎯 Meta Ads detected via FBCLID:', fbclid);
    return true;
  }
  
  // Method 2: UTM parameters for paid ads
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  
  // Facebook/Instagram + CPC = paid ads
  if ((utmSource === 'facebook' || utmSource === 'instagram') && utmMedium === 'cpc') {
    console.log('🎯 Meta Ads detected via UTM CPC:', { utmSource, utmMedium });
    return true;
  }
  
  // Method 3: Campaign contains Meta Ads identifiers
  if (utmCampaign && (
    utmCampaign.includes('meta_ads_') ||
    utmCampaign.includes('fb_ads_') ||
    utmCampaign.includes('ig_ads_') ||
    utmCampaign.includes('facebook_ads_')
  )) {
    console.log('🎯 Meta Ads detected via campaign name:', utmCampaign);
    return true;
  }
  
  // Method 4: Check for other Meta Ads indicators
  const adsetId = urlParams.get('adset_id');
  const adId = urlParams.get('ad_id');
  const campaignId = urlParams.get('campaign_id');
  
  if (adsetId || adId || campaignId) {
    console.log('🎯 Meta Ads detected via ad parameters:', { adsetId, adId, campaignId });
    return true;
  }
  
  // Exclude organic Facebook/Instagram traffic
  const isOrganicFacebook = referrer.includes('facebook.com') && !fbclid && !utmSource;
  const isOrganicInstagram = referrer.includes('instagram.com') && !fbclid && !utmSource;
  
  if (isOrganicFacebook || isOrganicInstagram) {
    console.log('❌ Organic social traffic detected, not Meta Ads:', referrer);
    return false;
  }
  
  // Development/testing environment - allow all traffic
  const hostname = window.location.hostname;
  const isDevEnv = hostname === 'localhost' || 
                   hostname.includes('127.0.0.1') || 
                   hostname.includes('stackblitz') ||
                   hostname.includes('bolt.new') ||
                   hostname.includes('preview');
  
  if (isDevEnv) {
    console.log('🧪 Development environment - allowing all traffic for testing');
    return true;
  }
  
  console.log('❌ Not Meta Ads traffic - no tracking parameters found');
  return false;
};

/**
 * Check if InitiateCheckout was already tracked for this session
 */
export const hasTrackedInitiateCheckoutThisSession = (): boolean => {
  return sessionStorage.getItem('initiate_checkout_tracked') === 'true';
};

/**
 * Mark InitiateCheckout as tracked for this session
 */
export const markInitiateCheckoutTracked = (): void => {
  sessionStorage.setItem('initiate_checkout_tracked', 'true');
  console.log('✅ InitiateCheckout marked as tracked for this session');
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
 * ✅ CRITICAL: ONLY for Meta Ads traffic and once per session
 */
export const trackInitiateCheckout = (url?: string): void => {
  if (!FACEBOOK_PIXEL_CONFIG.enabled) {
    console.log('📊 Facebook Pixel tracking disabled');
    return;
  }
  
  // ✅ NEW: Check if traffic is from Meta Ads
  if (!isMetaAdsTraffic()) {
    console.log('🚫 BLOCKED InitiateCheckout: Not Meta Ads traffic');
    return;
  }
  
  // ✅ NEW: Check if already tracked this session
  if (hasTrackedInitiateCheckoutThisSession()) {
    console.log('🚫 BLOCKED InitiateCheckout: Already tracked this session');
    return;
  }
  
  if (!isFacebookPixelReady()) {
    console.warn('⚠️ Facebook Pixel not ready for InitiateCheckout tracking');
    return;
  }
  
  try {
    // ✅ Mark as tracked for this session
    markInitiateCheckoutTracked();
    
    // ✅ Track InitiateCheckout event
    const fbq = (window as any).fbq;
    fbq('track', 'InitiateCheckout');
    
    console.log('✅ Meta Pixel: InitiateCheckout tracked successfully (Meta Ads traffic only)');
    
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
 * ✅ CRITICAL: Only Meta Ads traffic, once per session
 */
export const initializeFacebookPixelTracking = (): void => {
  if (typeof window === 'undefined') return;
  
  console.log('🚀 Facebook Pixel tracking initialized');
  console.log('🎯 ONLY Meta Ads traffic: FBCLID, UTM CPC, Campaign IDs');
  console.log('🔒 ONE InitiateCheckout per session maximum');
  console.log('❌ Organic social traffic BLOCKED');
  console.log('🎯 Purchase events ONLY on thank you pages');
  
  // ✅ Show current traffic status
  if (isMetaAdsTraffic()) {
    console.log('✅ Current session: Meta Ads traffic detected');
  } else {
    console.log('❌ Current session: Not Meta Ads traffic');
  }
};