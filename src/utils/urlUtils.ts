// Utility functions for URL and UTM parameter handling

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  gclid?: string;
  [key: string]: string | undefined;
}

/**
 * Get all URL parameters from current page
 */
export const getAllUrlParams = (): URLSearchParams => {
  return new URLSearchParams(window.location.search);
};

/**
 * Get UTM and tracking parameters from URL
 */
export const getTrackingParams = (): UTMParams => {
  const urlParams = getAllUrlParams();
  const trackingParams: UTMParams = {};
  
  // Common tracking parameters to preserve
  const trackingKeys = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'fbclid', 'gclid', 'ttclid', 'twclid', 'li_fat_id',
    'affiliate_id', 'sub_id', 'click_id', 'transaction_id',
    'order_id', 'customer_id', 'email', 'phone',
    'first_name', 'last_name', 'address', 'city', 'state', 'zip', 'country'
  ];
  
  trackingKeys.forEach(key => {
    const value = urlParams.get(key);
    if (value) {
      trackingParams[key] = value;
    }
  });
  
  return trackingParams;
};

/**
 * Store tracking parameters in sessionStorage for persistence
 */
export const storeTrackingParams = (): void => {
  const params = getTrackingParams();
  if (Object.keys(params).length > 0) {
    sessionStorage.setItem('tracking_params', JSON.stringify(params));
  }
};

/**
 * Get stored tracking parameters from sessionStorage
 */
export const getStoredTrackingParams = (): UTMParams => {
  try {
    const stored = sessionStorage.getItem('tracking_params');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error parsing stored tracking params:', error);
    return {};
  }
};

/**
 * Get all tracking parameters (current URL + stored)
 */
export const getAllTrackingParams = (): UTMParams => {
  const currentParams = getTrackingParams();
  const storedParams = getStoredTrackingParams();
  
  // Current URL params take precedence over stored ones
  return { ...storedParams, ...currentParams };
};

/**
 * Build URL with tracking parameters
 */
export const buildUrlWithParams = (baseUrl: string, additionalParams?: Record<string, string>): string => {
  const trackingParams = getAllTrackingParams();
  const allParams = { ...trackingParams, ...additionalParams };
  
  if (Object.keys(allParams).length === 0) {
    return baseUrl;
  }
  
  const url = new URL(baseUrl);
  Object.entries(allParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  return url.toString();
};

/**
 * Get parameters as query string
 */
export const getParamsAsQueryString = (additionalParams?: Record<string, string>): string => {
  const trackingParams = getAllTrackingParams();
  const allParams = { ...trackingParams, ...additionalParams };
  
  const params = new URLSearchParams();
  Object.entries(allParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Initialize tracking parameter storage on page load
 */
export const initializeTracking = (): void => {
  // Store current URL parameters
  storeTrackingParams();
  
  // Track page view with Facebook Pixel if available
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
  
  // Track page view with Utmify if available
  if (typeof window !== 'undefined' && (window as any).utmify) {
    (window as any).utmify('track', 'PageView');
  }
};

/**
 * Track conversion events
 */
export const trackConversion = (eventName: string, value?: number, currency?: string): void => {
  // Facebook Pixel conversion tracking
  if (typeof window !== 'undefined' && (window as any).fbq) {
    const eventData: any = {};
    if (value !== undefined) eventData.value = value;
    if (currency) eventData.currency = currency;
    
    (window as any).fbq('track', eventName, eventData);
  }
  
  // Utmify conversion tracking
  if (typeof window !== 'undefined' && (window as any).utmify) {
    const eventData: any = { event: eventName };
    if (value !== undefined) eventData.value = value;
    if (currency) eventData.currency = currency;
    
    (window as any).utmify('track', 'Conversion', eventData);
  }
};

/**
 * Track purchase events
 */
export const trackPurchase = (value: number, currency: string = 'BRL', productType?: string): void => {
  trackConversion('Purchase', value, currency);
  
  // Additional tracking for specific product types
  if (productType) {
    trackConversion(`Purchase_${productType}`, value, currency);
  }
};