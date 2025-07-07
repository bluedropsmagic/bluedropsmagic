import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, CheckCircle, Shield, Truck, Clock, Star, X, RefreshCw, Volume2 } from 'lucide-react';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';

interface UpsellPageProps {
  variant: '1-bottle' | '3-bottle' | '6-bottle';
}

interface UpsellContent {
  offer: {
    title: string;
    subtitle: string;
    description: string;
  };
  pricing: {
    pricePerBottle: string;
    totalPrice: string;
    savings: string;
    freeBottles: string;
    paidBottles: string;
  };
  acceptUrl: string;
  rejectUrl: string;
  productImage: string;
  acceptButtonText: string;
  rejectButtonText: string;
}

export const UpsellPage: React.FC<UpsellPageProps> = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const { trackOfferClick } = useAnalytics();
  const [cartParams, setCartParams] = useState<string>('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showPurchaseButton, setShowPurchaseButton] = useState(false);
  
  // ✅ UPDATED: Vídeos específicos para cada variant
  const videoIds = {
    '1-bottle': '686b6af315fc4aa5f81ab90b',
    '3-bottle': '686b7739756a766918015263', // ✅ NEW: Vídeo específico para quem compra 3 bottles
    '6-bottle': '686b75de199e54169b0f64af'  // ✅ Vídeo específico para quem compra 6 bottles
  };

  useEffect(() => {
    const params = new URLSearchParams();
    
    const cartPandaParams = [
      'order_id', 'customer_id', 'transaction_id', 'email', 'phone',
      'first_name', 'last_name', 'address', 'city', 'state', 'zip',
      'country', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
      'utm_content', 'fbclid', 'gclid', 'affiliate_id', 'sub_id'
    ];

    cartPandaParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        params.append(param, value);
      }
    });

    searchParams.forEach((value, key) => {
      if (!cartPandaParams.includes(key)) {
        params.append(key, value);
      }
    });

    setCartParams(params.toString());
  }, [searchParams]);

  useEffect(() => {
      console.log('⏰ Starting 2min41s timer for purchase button...');
      
      const timer = setTimeout(() => {
        console.log('✅ 2min41s elapsed - showing purchase button');
        setShowPurchaseButton(true);
      }, 161000);
      
      return () => {
        clearTimeout(timer);
      };
  }, []);

  // ✅ COMPLETELY REWRITTEN: Video injection with proper container isolation
  useEffect(() => {
    const injectUpsellVideo = () => {
      const videoId = videoIds[variant];
      const containerId = `vid-upsell-${variant}-${videoId}`;
      
      console.log(`🎬 Injecting ${variant} upsell video:`, videoId);
      
      // ✅ CRITICAL: Wait for DOM to be ready
      setTimeout(() => {
        const targetContainer = document.getElementById(containerId);
        if (!targetContainer) {
          console.error(`❌ ${variant} video container not found:`, containerId);
          setVideoError(true);
          return;
        }

        console.log(`✅ Found ${variant} container:`, targetContainer);

        // ✅ Remove existing script first
        const existingScript = document.getElementById(`scr_upsell_${variant}_${videoId}`);
        if (existingScript) {
          existingScript.remove();
          console.log(`🗑️ Removed existing ${variant} script`);
        }

        // ✅ CRITICAL: Clear container and set up MAXIMUM isolation
        targetContainer.innerHTML = '';
        targetContainer.style.cssText = `
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          border-radius: 0.75rem !important;
          isolation: isolate !important;
          contain: layout style paint size !important;
          z-index: 10 !important;
          background: #000 !important;
        `;

        // ✅ Create unique VTurb smartplayer element
        const vTurbContainerId = `vid_${variant}_${videoId}_player`;
        const smartPlayer = document.createElement('vturb-smartplayer');
        smartPlayer.id = vTurbContainerId;
        smartPlayer.style.cssText = `
          display: block !important;
          margin: 0 auto !important;
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          z-index: 20 !important;
        `;
        
        targetContainer.appendChild(smartPlayer);
        console.log(`✅ Created ${variant} smartplayer:`, vTurbContainerId);

        // ✅ Create and inject script with variant-specific handling
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = `scr_upsell_${variant}_${videoId}`;
        script.async = true;
        script.defer = true;
        
        // ✅ FIXED: Use exact script format for each variant
        script.innerHTML = `
          (function() {
            try {
              console.log('🎬 Loading ${variant} upsell video: ${videoId}');
              
              // ✅ CRITICAL: Prevent conflicts with main video
              if (window.mainVideoId && window.mainVideoId === '${videoId}') {
                console.warn('⚠️ Video ID conflict detected, using fallback approach');
                return;
              }
              
              var s = document.createElement("script");
              s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/v4/player.js";
              s.async = true;
              
              s.onload = function() {
                console.log('✅ VTurb ${variant} upsell video loaded: ${videoId}');
                
                // ✅ CRITICAL: Ensure video stays in correct container
                setTimeout(function() {
                  var upsellContainer = document.getElementById('${containerId}');
                  var mainVideoContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
                  
                  if (mainVideoContainer && upsellContainer) {
                    // ✅ Move any orphaned elements back to upsell container
                    var orphanedElements = mainVideoContainer.querySelectorAll('[src*="${videoId}"], [data-video-id="${videoId}"], [id*="${videoId}"], vturb-smartplayer[id*="${videoId}"]');
                    orphanedElements.forEach(function(element) {
                      if (element.parentNode === mainVideoContainer || element.parentNode === document.body) {
                        console.log('🔄 Moving ${variant} video element back to correct container:', element);
                        upsellContainer.appendChild(element);
                      }
                    });
                    
                    // ✅ Also check for elements that might have been injected at body level
                    var bodyOrphans = document.body.querySelectorAll('[src*="${videoId}"], [data-video-id="${videoId}"], [id*="${videoId}"], vturb-smartplayer[id*="${videoId}"]');
                    bodyOrphans.forEach(function(element) {
                      if (element.parentNode === document.body) {
                        console.log('🔄 Moving ${variant} body-level element to container:', element);
                        upsellContainer.appendChild(element);
                      }
                    });
                  }
                  
                  // ✅ Ensure container styling is maintained
                  if (upsellContainer) {
                    upsellContainer.style.position = 'relative';
                    upsellContainer.style.overflow = 'hidden';
                    upsellContainer.style.isolation = 'isolate';
                  }
                }, 2000);
                
                // ✅ Additional check after 5 seconds
                setTimeout(function() {
                  var upsellContainer = document.getElementById('${containerId}');
                  if (upsellContainer && upsellContainer.children.length === 0) {
                    console.warn('⚠️ ${variant} container is empty after 5 seconds, attempting recovery');
                    // Try to find the video element anywhere in the DOM
                    var lostVideo = document.querySelector('vturb-smartplayer[id*="${videoId}"]');
                    if (lostVideo) {
                      console.log('🔄 Found lost ${variant} video, moving to container');
                      upsellContainer.appendChild(lostVideo);
                    }
                  }
                }, 5000);
                
                window.upsellVideoLoaded_${variant}_${videoId} = true;
              };
              
              s.onerror = function() {
                console.error('❌ Failed to load VTurb ${variant} upsell video: ${videoId}');
              };
              
              document.head.appendChild(s);
            } catch (error) {
              console.error('Error injecting ${variant} upsell video script:', error);
            }
          })();
        `;
        
        document.head.appendChild(script);
        console.log(`✅ ${variant} VTurb script injected`);

        // ✅ Check if video loaded successfully
        setTimeout(() => {
          if ((window as any)[`upsellVideoLoaded_${variant}_${videoId}`]) {
            setVideoLoaded(true);
            console.log(`✅ ${variant} video loaded successfully`);
          } else {
            console.log(`⚠️ ${variant} video not loaded yet, will retry...`);
            // Retry once if not loaded
            setTimeout(() => injectUpsellVideo(), 3000);
          }
        }, 8000);
      }, 1500); // ✅ Increased delay to ensure DOM is ready
    };
    
    // ✅ Start injection after component is mounted
    injectUpsellVideo();
    
    // ✅ Cleanup on unmount
    return () => {
      const videoId = videoIds[variant];
      const scriptToRemove = document.getElementById(`scr_upsell_${variant}_${videoId}`);
      if (scriptToRemove) {
        try {
          scriptToRemove.remove();
          console.log(`🧹 Cleaned up ${variant} script`);
        } catch (error) {
          console.error(`Error cleaning up ${variant} script:`, error);
        }
      }
    };
  }, [variant]);

  const getUpsellContent = (variant: string): UpsellContent => {
    const contents = {
      '1-bottle': {
        offer: {
          title: 'COMPLETE 9‑MONTH TREATMENT',
          subtitle: '✔️ Add 5 More Bottles + Get 4 Extra Bottles FREE',
          description: 'All at our lowest price ever...'
        },
        pricing: {
          pricePerBottle: 'Biggest discount ever: only $39 per bottle',
          totalPrice: '270 days of treatment',
          savings: 'Save $585 instantly',
          freeBottles: '4 FREE',
          paidBottles: '5 PAID'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=no',
        productImage: 'https://i.imgur.com/2YU6i8f.png',
        acceptButtonText: 'YES — COMPLETE MY 9‑MONTH TREATMENT',
        rejectButtonText: 'No thanks — I\'ll throw away my progress and risk permanent failure'
      },
      '3-bottle': {
        offer: {
          title: 'COMPLETE 9‑MONTH TREATMENT',
          subtitle: '✔️ Add 3 More Bottles + Get 3 Extra Bottles FREE',
          description: 'Complete your transformation with the full protocol'
        },
        pricing: {
          pricePerBottle: 'Biggest discount ever: only $39 per bottle',
          totalPrice: '270 days of treatment',
          savings: 'Save $585 instantly',
          freeBottles: '3 FREE',
          paidBottles: '3 PAID'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/qJjMdRwYNl?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/qJjMdRwYNl?accepted=no',
        productImage: 'https://i.imgur.com/2YU6i8f.png',
        acceptButtonText: 'YES — COMPLETE MY 9‑MONTH TREATMENT',
        rejectButtonText: 'No thanks — I\'ll throw away my progress and risk permanent failure'
      },
      '6-bottle': {
        offer: {
          title: 'COMPLETE 9‑MONTH TREATMENT',
          subtitle: '✔️ Add 1 More Bottle + Get 2 Extra Bottles FREE',
          description: 'Just 1 more bottle to ensure complete, permanent results'
        },
        pricing: {
          pricePerBottle: 'Biggest discount ever: only $39 per bottle',
          totalPrice: '270 days of treatment',
          savings: 'Save $585 instantly',
          freeBottles: '2 FREE',
          paidBottles: '1 PAID'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=no',
        productImage: 'https://i.imgur.com/2YU6i8f.png',
        acceptButtonText: 'YES — COMPLETE MY 9‑MONTH TREATMENT',
        rejectButtonText: 'No thanks — I\'ll throw away my progress and risk permanent failure'
      }
    };

    return contents[variant as keyof typeof contents];
  };

  const handleAccept = () => {
    const content = getUpsellContent(variant);
    trackInitiateCheckout(content.acceptUrl);
    
    trackOfferClick(`upsell-${variant}-accept`);
    
    let url = cartParams ? `${content.acceptUrl}&${cartParams}` : content.acceptUrl;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !url.includes('cid=')) {
      url += (url.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  };

  const handleReject = () => {
    const content = getUpsellContent(variant);
    trackInitiateCheckout(content.rejectUrl);
    
    trackOfferClick(`upsell-${variant}-reject`);
    
    let url = cartParams ? `${content.rejectUrl}&${cartParams}` : content.rejectUrl;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !url.includes('cid=')) {
      url += (url.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  };

  const content = getUpsellContent(variant);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50">
      {/* Fixed Red Alert Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="font-black text-xs sm:text-sm md:text-base tracking-wide">⚠️ WAIT! YOUR ORDER IS NOT COMPLETE</span>
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
        </div>
      </div>

      {/* Main container */}
      <div className="pt-16 px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <header className="mb-6 sm:mb-8 text-center animate-fadeInDown animation-delay-200">
            <img 
              src="https://i.imgur.com/QJxTIcN.png" 
              alt="Blue Drops Logo"
              className="h-6 sm:h-8 w-auto mx-auto"
            />
          </header>

          {/* Hero Section */}
          <div className="mb-6 text-center animate-fadeInUp animation-delay-400">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-3">
              <span className="text-blue-900 block mb-1">You're Just ONE Step</span>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
                Away From Success
              </span>
            </h1>
            
            <p className="text-sm sm:text-base text-blue-800 font-semibold px-2">
              Congratulations on securing your first bottles — but now, one last step could change everything.
            </p>
          </div>

          {/* ✅ FIXED: Video Container with proper isolation */}
          <div className="mb-6 animate-fadeInUp animation-delay-600">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative">
              {/* ✅ CRITICAL: Unique container ID for each variant */}
              <div
                id={`vid-upsell-${variant}-${videoIds[variant]}`}
                className="absolute inset-0 w-full h-full"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 20,
                  overflow: 'hidden',
                  borderRadius: '0.75rem',
                  isolation: 'isolate',
                  contain: 'layout style paint size',
                  background: '#000'
                }}
              >
                {/* ✅ Loading placeholder */}
                {!videoLoaded && !videoError && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 15 }}>
                    <div className="text-center text-white p-4">
                      <RefreshCw className="w-12 h-12 text-white/80 animate-spin mb-3 mx-auto" />
                      <p className="text-sm font-medium mb-1">Loading {variant} video...</p>
                      <p className="text-xs text-white/70">Please wait</p>
                    </div>
                  </div>
                )}
                
                {/* ✅ Error placeholder */}
                {videoError && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center" style={{ zIndex: 15 }}>
                    <div className="text-center text-white p-6">
                      <AlertTriangle className="w-12 h-12 text-red-400 mb-3 mx-auto" />
                      <p className="text-sm font-medium mb-3">Error loading video</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Reload Page
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Purchase Button - Only show after 2min41s */}
          {showPurchaseButton && (
            <div className="mb-6 animate-fadeInUp animation-delay-800">
              <button 
                onClick={handleAccept}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg sm:text-xl border-2 border-white/40 backdrop-blur-sm overflow-hidden checkout-button"
              >
                <span className="relative z-10">CLAIM OFFER</span>
              </button>
            </div>
          )}

          {/* Warning Messages - Same as main page */}
          {!showPurchaseButton && (
            <div className="mb-6 text-center animate-fadeInUp animation-delay-800">
              <div className="space-y-3">
                {/* Sound Warning */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 font-semibold text-sm">
                      Please make sure your sound is on
                    </span>
                  </div>
                  <p className="text-blue-600 text-xs">
                    This video contains important audio information
                  </p>
                </div>

                {/* Video Takedown Warning */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-red-800 font-semibold text-sm">
                      This video may be taken down at any time
                    </span>
                  </div>
                  <p className="text-red-600 text-xs">
                    Watch now before it's removed from the internet
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reject Button - Less prominent */}
          {showPurchaseButton && (
            <div className="mb-6 animate-fadeInUp animation-delay-1000">
              <button 
                onClick={handleReject}
                className="w-full bg-transparent border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 font-normal py-2 px-4 rounded-lg transition-all duration-300 text-xs checkout-button"
              >
                <span className="opacity-70">No thanks — I'll pass on this opportunity</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};