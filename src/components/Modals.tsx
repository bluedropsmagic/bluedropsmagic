import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';

interface ModalsProps {
  showPopup: boolean;
  showUpsellPopup: boolean;
  selectedPackage: string;
  onClosePopup: () => void;
  onCloseUpsellPopup: () => void;
  onUpsellAccept: () => void;
  onUpsellRefuse: () => void;
  getUpsellSavings: (packageType: string) => number;
}

export const Modals: React.FC<ModalsProps> = ({
  showPopup,
  showUpsellPopup,
  selectedPackage,
  onClosePopup,
  onCloseUpsellPopup,
  onUpsellAccept,
  onUpsellRefuse,
  getUpsellSavings
}) => {
  const upsellSavings = getUpsellSavings(selectedPackage);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ NEW: Auto-redirect after 10 seconds of inactivity
  useEffect(() => {
    if (showUpsellPopup && selectedPackage) {
      console.log('⏰ Starting 10-second timeout for upsell popup');
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set 10-second timeout
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ 10-second timeout reached - auto-redirecting to refuse offer');
        handleAutoRefuse();
      }, 10000); // 10 seconds
    }
    
    // Cleanup timeout when popup closes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [showUpsellPopup, selectedPackage]);

  // ✅ NEW: Handle auto-refuse (timeout or close button)
  const handleAutoRefuse = () => {
    if (!selectedPackage) return;
    
    // Get the original product URL (what user wanted before upsell)
    const originalUrls = {
      '1-bottle': 'https://pagamento.paybluedrops.com/checkout/176654642:1',
      '3-bottle': 'https://pagamento.paybluedrops.com/checkout/176845818:1'
    };
    
    const targetUrl = originalUrls[selectedPackage as keyof typeof originalUrls];
    
    if (targetUrl) {
      console.log('🔄 Redirecting to original product URL:', targetUrl);
      
      // Track InitiateCheckout for the original product
      trackInitiateCheckout(targetUrl);
      
      // Add CID parameter if present
      let finalUrl = targetUrl;
      const urlParams = new URLSearchParams(window.location.search);
      const cid = urlParams.get('cid');
      if (cid && !finalUrl.includes('cid=')) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
      }
      
      // Small delay to ensure tracking is sent
      setTimeout(() => {
        window.location.href = finalUrl;
      }, 150);
    }
    
    // Close popup
    onCloseUpsellPopup();
  };

  // ✅ UPDATED: Handle close button click
  const handleCloseClick = () => {
    console.log('❌ User closed upsell popup - redirecting to original product');
    handleAutoRefuse();
  };

  // ✅ UPDATED: Handle accept button click
  const handleAcceptClick = () => {
    // Clear timeout since user took action
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    console.log('✅ User accepted upsell offer');
    onUpsellAccept();
  };

  // ✅ UPDATED: Handle refuse button click
  const handleRefuseClick = () => {
    // Clear timeout since user took action
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    console.log('❌ User refused upsell offer');
    onUpsellRefuse();
  };

  return (
    <>
      {/* Popup Modal - Overlay on top */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-800/90 to-blue-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-2xl w-full mx-4 relative border border-blue-400/20 animate-slideInUp">
            {/* Close button */}
            <button 
              onClick={onClosePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Popup content */}
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4">
                <span className="text-white block mb-1">Baking Soda</span>
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent block">
                  cures Impotence
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-300 mb-6">
                This secret recipe can reverse Impotence in just{' '}
                <span className="text-yellow-400 font-bold">7 Days</span>
              </p>

              <button 
                onClick={onClosePopup}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg border-2 border-white/40 checkout-button"
              >
                Reveal Secret
              </button>
            </div>
          </div>
        </div>
                className="w-full bg-transparent border border-white/20 text-white/60 hover:text-white/80 hover:border-white/30 font-medium py-2.5 px-6 rounded-xl transition-all duration-300 text-sm checkout-button"

      {/* Upsell Popup Modal */}
      {showUpsellPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-blue-800/95 to-blue-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-lg w-full mx-4 relative border border-blue-400/20 animate-bounceIn">
            {/* Close button */}
            <button 
              onClick={handleCloseClick}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* ✅ UPDATED: Upsell content with timeout indicator */}
            <div className="text-center pt-4">
              {/* ✅ NEW: Timeout indicator */}
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p className="text-red-300 text-xs font-medium">
                  ⏰ This offer expires in 10 seconds
                </p>
                <p className="text-red-200 text-xs mt-1">
                  If no action is taken, you'll be redirected to your original selection
                </p>
              </div>
              
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <AlertTriangle className="w-8 h-8 text-white fill-current" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Wait! You're Leaving ${upsellSavings} Behind...
                </h2>
                
                <div className="text-white/90 text-sm sm:text-base mb-6 leading-relaxed">
                  <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-xl p-4 mb-4 border border-yellow-400/30">
                    <p className="text-yellow-300 font-bold text-base sm:text-lg mb-2">
                      Choose the 6 Bottle Pack now and save an extra ${upsellSavings}!
                    </p>
                  </div>
                  
                  <p>
                    It's the most popular choice for long-term results — and it includes free shipping + a 180-day guarantee.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleAcceptClick}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg border-2 border-white/40"
                >
                  GET ${upsellSavings} EXTRA DISCOUNT
                </button>
                
                <button 
                  onClick={handleRefuseClick}
                  className="w-full bg-transparent border border-white/20 text-white/60 hover:text-white/80 hover:border-white/30 font-medium py-2.5 px-6 rounded-xl transition-all duration-300 text-sm"
                >
                  Refuse Offer
                </button>
              </div>
              
              {/* ✅ NEW: Additional info about auto-redirect */}
              <div className="mt-4 text-center">
                <p className="text-white/50 text-xs">
                  💡 No action needed - we'll redirect you automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};