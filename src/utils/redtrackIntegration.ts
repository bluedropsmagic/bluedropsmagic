// RedTrack Integration Utilities
// Handles CID parameter detection, preservation, and URL modification

export interface RedTrackConfig {
  domain: string;
  attribution: string;
  cookieDomain: string;
  cookieDuration: number;
  defaultCampaignId: string;
  regViewOnce: boolean;
}

export const REDTRACK_CONFIG: RedTrackConfig = {
  domain: 'rdt.obluemagicdrops.com',
  attribution: 'lastpaid',
  cookieDomain: 'elaborate-smakager-4592e9.netlify.app',
  cookieDuration: 90,
  defaultCampaignId: '68685bcb51f1690d1f917171',
  regViewOnce: false
};

/**
 * Get CID parameter from current URL
 */
export const getCidFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('cid');
};

/**
 * Add CID parameter to URL if present
 */
export const addCidToUrl = (url: string, cid?: string): string => {
  const cidValue = cid || getCidFromUrl();
  if (!cidValue || !url || url.includes('cid=')) {
    return url;
  }
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}cid=${encodeURIComponent(cidValue)}`;
};

/**
 * Check if URL is a purchase/checkout URL
 */
export const isPurchaseUrl = (url: string): boolean => {
  return url.includes('cartpanda.com') || 
         url.includes('paybluedrops.com') || 
         url.includes('checkout');
};

/**
 * Update all purchase links with CID
 */
export const updatePurchaseLinks = (): void => {
  const cid = getCidFromUrl();
  if (!cid) return;

  // Update all links
  document.querySelectorAll('a[href]').forEach((link: Element) => {
    const anchor = link as HTMLAnchorElement;
    if (isPurchaseUrl(anchor.href)) {
      const originalHref = anchor.href;
      anchor.href = addCidToUrl(originalHref, cid);
      console.log('🔗 Updated link:', originalHref, '->', anchor.href);
    }
  });

  // Update buttons with data-href
  document.querySelectorAll('[data-href]').forEach((element: Element) => {
    const href = element.getAttribute('data-href');
    if (href && isPurchaseUrl(href)) {
      const originalHref = href;
      const newHref = addCidToUrl(originalHref, cid);
      element.setAttribute('data-href', newHref);
      console.log('🔘 Updated button data-href:', originalHref, '->', newHref);
    }
  });
};

/**
 * Setup RedTrack integration
 */
export const setupRedTrackIntegration = (): void => {
  const cid = getCidFromUrl();
  
  if (cid) {
    console.log('🎯 RedTrack CID detected:', cid);
    
    // Initial update
    updatePurchaseLinks();
    
    // Override window.open for purchase URLs
    const originalOpen = window.open;
    window.open = function(url?: string | URL, ...args: any[]): Window | null {
      if (url && typeof url === 'string' && isPurchaseUrl(url)) {
        url = addCidToUrl(url, cid);
        console.log('🪟 Window.open with CID:', url);
      }
      return originalOpen.call(this, url, ...args);
    };
    
    // Setup mutation observer for dynamic content
    const observer = new MutationObserver(() => {
      updatePurchaseLinks();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Show debug info in development
    showDebugInfo(cid);
  } else {
    console.log('ℹ️ No CID parameter found in URL');
  }
};

/**
 * Show debug information for admin/development environments
 */
export const showDebugInfo = (cid: string): void => {
  const hostname = window.location.hostname;
  const isDebugEnv = hostname === 'localhost' || 
                     hostname.includes('127.0.0.1') || 
                     hostname.includes('admin.getmagicbluedrops.com') ||
                     hostname.includes('preview') ||
                     hostname.includes('stackblitz') ||
                     hostname.includes('bolt.new') ||
                     hostname.includes('elaborate-smakager-4592e9.netlify.app');
  
  if (isDebugEnv) {
    // Remove existing log if present
    const existingLog = document.getElementById('redtrack-cid-log');
    if (existingLog) existingLog.remove();
    
    const logDiv = document.createElement('div');
    logDiv.id = 'redtrack-cid-log';
    logDiv.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #e0ffe0, #f0fff0);
      border: 2px solid #00cc00;
      border-radius: 8px;
      z-index: 9999;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: bold;
      color: #006600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      word-break: break-all;
    `;
    
    logDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="font-size: 16px;">✅</span>
        <span style="color: #004400; font-weight: bold;">RedTrack Active</span>
      </div>
      <div style="font-size: 11px; color: #006600; line-height: 1.4;">
        <strong>CID:</strong> ${cid}<br>
        <strong>Status:</strong> Tracking & Auto-updating<br>
        <strong>Links:</strong> Purchase URLs modified<br>
        <strong>Domain:</strong> ${REDTRACK_CONFIG.cookieDomain}
      </div>
    `;
    
    document.body.appendChild(logDiv);
    
    // Auto-fade after 10 seconds
    setTimeout(() => {
      if (logDiv.parentNode) {
        logDiv.style.opacity = '0.7';
      }
    }, 10000);
    
    console.log('🎯 RedTrack Debug Log displayed for admin environment');
  }
};

/**
 * Track checkout completion (for thank you pages)
 */
export const trackCheckoutCompletion = (): void => {
  // This should be implemented on the CartPanda thank you page
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.subscribe('checkout_completed', (event: any) => {
      const checkout = event.data.checkout;
      const orderId = checkout?.order?.id;
      
      if (orderId) {
        console.log('🛒 Checkout completed, order ID:', orderId);
        
        // Send conversion data to RedTrack
        const script = document.createElement('script');
        script.src = `https://tracking.domain/order_completed.js?shop=storedomain.myshopify.com&orderid=${orderId}`;
        document.body.appendChild(script);
        
        console.log('📊 RedTrack conversion tracking script injected');
      }
    });
  }
};

/**
 * Initialize RedTrack integration on page load
 */
export const initializeRedTrack = (): void => {
  // Setup integration
  setupRedTrackIntegration();
  
  // Setup checkout completion tracking
  trackCheckoutCompletion();
  
  console.log('🚀 RedTrack integration initialized');
};