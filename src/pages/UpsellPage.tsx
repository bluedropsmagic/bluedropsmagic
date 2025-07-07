import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, CheckCircle, Shield, Truck, Clock, Star, X, RefreshCw, Volume2, Play } from 'lucide-react';
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
    '3-bottle': '686b7739756a766918015263', // ✅ Vídeo para quem compra 3 bottles
    '6-bottle': '686b75de199e54169b0f64af'  // ✅ Vídeo para quem compra 6 bottles
  };

  const currentVideoId = videoIds[variant];

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

  // ✅ COMPLETELY REWRITTEN: Video injection with EXACT VTurb HTML structure
  useEffect(() => {
    const injectUpsellVideo = () => {
      const videoId = currentVideoId;
      
      console.log(`🎬 [${variant}] Injecting upsell video with EXACT VTurb structure:`, videoId);
      
      // ✅ CRITICAL: Wait for DOM to be ready
      setTimeout(() => {
        const targetContainer = document.getElementById(`vid_${videoId}`);
        if (!targetContainer) {
          console.error(`❌ [${variant}] VTurb container not found: vid_${videoId}`);
          setVideoError(true);
          return;
        }

        console.log(`✅ [${variant}] Found VTurb container:`, targetContainer);

        // ✅ Remove existing script first
        const existingScript = document.getElementById(`scr_${videoId}`);
        if (existingScript) {
          existingScript.remove();
          console.log(`🗑️ [${variant}] Removed existing script`);
        }

        // ✅ CRITICAL: Clear container and add EXACT VTurb HTML structure
        targetContainer.innerHTML = '';
        
        // ✅ Add EXACT VTurb HTML structure as provided
        if (videoId === '686b75de199e54169b0f64af') {
          // ✅ 6-bottle video structure
          targetContainer.innerHTML = `
            <div id="vid_${videoId}" style="position:relative;width:100%;padding: 56.25% 0 0 0;">
              <img id="thumb_${videoId}" src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/thumbnail.jpg" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;">
              <div id="backdrop_${videoId}" style="position:absolute;top:0;width:100%;height:100%;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);"></div>
            </div>
            <style>
              .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border-width:0;}
            </style>
          `;
        } else if (videoId === '686b7739756a766918015263') {
          // ✅ 3-bottle video structure
          targetContainer.innerHTML = `
            <div id="vid_${videoId}" style="position:relative;width:100%;padding: 56.25% 0 0 0;">
              <img id="thumb_${videoId}" src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/thumbnail.jpg" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;">
              <div id="backdrop_${videoId}" style="position:absolute;top:0;width:100%;height:100%;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);"></div>
            </div>
            <style>
              .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border-width:0;}
            </style>
          `;
        } else {
          // ✅ 1-bottle video structure (fallback)
          targetContainer.innerHTML = `
            <div id="vid_${videoId}" style="position:relative;width:100%;padding: 56.25% 0 0 0;">
              <img id="thumb_${videoId}" src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/thumbnail.jpg" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;">
              <div id="backdrop_${videoId}" style="position:absolute;top:0;width:100%;height:100%;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);"></div>
            </div>
            <style>
              .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border-width:0;}
            </style>
          `;
        }

        console.log(`✅ [${variant}] VTurb HTML structure added, injecting script...`);

        // ✅ Create and inject script with EXACT VTurb format
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = `scr_${videoId}`;
        script.async = true;
        
        // ✅ EXACT VTurb script structure
        script.innerHTML = `
          var s=document.createElement("script");
          s.src="https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/player.js";
          s.async=!0;
          s.onload=function(){
            console.log('✅ [${variant}] VTurb player script loaded successfully');
            window.upsellVideoLoaded_${variant} = true;
            
            // ✅ CRITICAL: Ensure video stays in correct container
            setTimeout(function() {
              var mainVideoContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
              var upsellContainer = document.getElementById('vid_${videoId}');
              
              if (mainVideoContainer && upsellContainer) {
                // ✅ Move any upsell video elements that ended up in main container
                var orphanedElements = mainVideoContainer.querySelectorAll('[src*="${videoId}"], [data-video-id="${videoId}"]');
                orphanedElements.forEach(function(element) {
                  if (element.parentNode === mainVideoContainer) {
                    upsellContainer.appendChild(element);
                    console.log('🔄 [${variant}] Moved video element back to correct container');
                  }
                });
              }
              
              if (upsellContainer) {
                console.log('✅ [${variant}] Video container secured');
                upsellContainer.setAttribute('data-upsell-video', 'true');
                upsellContainer.setAttribute('data-video-id', '${videoId}');
              }
            }, 2000);
          };
          s.onerror=function(){
            console.error('❌ [${variant}] Failed to load VTurb player script');
          };
          document.head.appendChild(s);
        `;
        
        document.head.appendChild(script);
        console.log(`✅ [${variant}] VTurb script injected with exact structure`);

        // ✅ Check if video loaded successfully
        setTimeout(() => {
          if ((window as any)[`upsellVideoLoaded_${variant}`]) {
            setVideoLoaded(true);
            setVideoError(false);
            console.log(`✅ [${variant}] Video loaded successfully`);
          } else {
            console.log(`⚠️ [${variant}] Video not loaded yet, checking container...`);
            
            // ✅ Check if video elements exist
            const container = document.getElementById(`vid_${videoId}`);
            if (container) {
              const hasVideo = container.querySelector('video') || 
                              container.querySelector('iframe') ||
                              container.querySelector('[data-vturb-player]');
              
              if (hasVideo) {
                setVideoLoaded(true);
                setVideoError(false);
                console.log(`✅ [${variant}] Video detected in container`);
              } else {
                console.log(`⚠️ [${variant}] No video elements found, will retry...`);
                setTimeout(() => injectUpsellVideo(), 3000);
              }
            }
          }
        }, 8000);
      }, 2000); // ✅ Wait for DOM to be ready
    };
    
    // ✅ Start injection after component is mounted
    console.log(`🚀 [${variant}] Starting VTurb video injection process...`);
    injectUpsellVideo();
    
    // ✅ Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(`scr_${currentVideoId}`);
      if (scriptToRemove) {
        try {
          scriptToRemove.remove();
          console.log(`🧹 [${variant}] Cleaned up VTurb script`);
        } catch (error) {
          console.error(`❌ [${variant}] Error cleaning up script:`, error);
        }
      }
    };
  }, [variant, currentVideoId]);

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

          {/* ✅ FIXED: Video Container with EXACT VTurb structure */}
          <div className="w-full mb-6 sm:mb-8 animate-fadeInUp animation-delay-600">
            {/* Fixed aspect ratio container for mobile VSL */}
            <div className="relative w-full max-w-sm mx-auto">
              <div className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
                {/* ✅ EXACT VTurb Video Container - Using the EXACT structure provided */}
                <vturb-smartplayer 
                  id={`vid_${currentVideoId}`}
                  style={{
                    display: 'block',
                    margin: '0 auto',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 30
                  }}
                />

                {/* Loading Overlay */}
                {!videoLoaded && !videoError && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 15 }}>
                    <div className="text-center text-white p-4">
                      <RefreshCw className="w-12 h-12 text-white/80 animate-spin mb-3 mx-auto" />
                      <p className="text-sm font-medium mb-1">Carregando vídeo {variant}...</p>
                      <p className="text-xs text-white/70">Aguarde um momento</p>
                    </div>
                  </div>
                )}

                {/* Error Overlay */}
                {videoError && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center" style={{ zIndex: 15 }}>
                    <div className="text-center text-white p-6">
                      <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center mb-3 mx-auto">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <p className="text-sm font-medium mb-3">Erro ao carregar o vídeo</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px]"
                        style={{ touchAction: 'manipulation' }}
                      > 
                        Recarregar página
                      </button>
                    </div>
                  </div>
                )}

                {/* ✅ Play Button Overlay - Only show if video not loaded */}
                {!videoLoaded && !videoError && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    style={{ 
                      touchAction: 'manipulation',
                      zIndex: 20
                    }}
                    onClick={() => {
                      console.log(`🎬 [${variant}] Play button clicked`);
                      const videoContainer = document.getElementById(`vid_${currentVideoId}`);
                      if (videoContainer) {
                        videoContainer.click();
                      }
                    }} 
                  >
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-white/30 transition-colors">
                      <Play className="w-10 h-10 text-white ml-1" />
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
                <span className="relative z-10">{content.acceptButtonText}</span>
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
                <span className="opacity-70">{content.rejectButtonText}</span>
              </button>
            </div>
          )}

          {/* Debug Info - Only in development */}
          {(window.location.hostname.includes('localhost') || 
            window.location.hostname.includes('stackblitz') ||
            window.location.hostname.includes('bolt.new')) && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
              <p><strong>Debug Info:</strong></p>
              <p>Variant: {variant}</p>
              <p>Video ID: {currentVideoId}</p>
              <p>Video Loaded: {videoLoaded ? 'Yes' : 'No'}</p>
              <p>Video Error: {videoError ? 'Yes' : 'No'}</p>
              <p>Show Purchase Button: {showPurchaseButton ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};