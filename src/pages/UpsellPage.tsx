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
  
  const videoIds = {
    '1-bottle': '686b6af315fc4aa5f81ab90b',
    '3-bottle': '686b6af315fc4aa5f81ab90b',
    '6-bottle': '686b75de199e54169b0f64af'  // ✅ UPDATED: Vídeo específico para quem compra 6 bottles
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

  useEffect(() => {
      const injectUpsellVideo = () => {
        const videoId = videoIds[variant];
        const targetContainer = document.getElementById(`vid-upsell-${videoId}`);
        if (!targetContainer) {
          console.error('❌ Upsell video container not found');
          setVideoError(true);
          return;
        }

        console.log('🎬 Injecting upsell video:', videoId);

        const existingScript = document.getElementById(`scr_upsell_${videoId}`);
        if (existingScript) {
          existingScript.remove();
          console.log('🗑️ Removed existing upsell script');
        }

        targetContainer.style.position = 'absolute';
        targetContainer.style.top = '0';
        targetContainer.style.left = '0';
        targetContainer.style.width = '100%';
        targetContainer.style.height = '100%';
        targetContainer.style.zIndex = '20';
        targetContainer.style.overflow = 'hidden';
        targetContainer.style.borderRadius = '0.75rem';
        targetContainer.style.isolation = 'isolate';
        targetContainer.innerHTML = '';

        targetContainer.innerHTML = `
          <div id="vid_${videoId}" style="position:relative;width:100%;padding: 56.25% 0 0 0;">
            <img id="thumb_${videoId}" src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/thumbnail.jpg" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;">
            <div id="backdrop_${videoId}" style="position:absolute;top:0;width:100%;height:100%;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);"></div>
          </div>
          <style>
            .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border-width:0;}
          </style>
        `;

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = `scr_upsell_${videoId}`;
        script.async = true;
        script.defer = true;
        
        script.innerHTML = `
          (function() {
            try {
              console.log('🎬 Loading upsell video: ${videoId}');
              
              var s = document.createElement("script");
              s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/v4/player.js";
              s.async = true;
              
              s.onload = function() {
                console.log('✅ VTurb upsell video loaded: ${videoId}');
                window.upsellVideoLoaded_${videoId} = true;
              };
              s.onerror = function() {
                console.error('❌ Failed to load VTurb upsell video: ${videoId}');
              };
              document.head.appendChild(s);
            } catch (error) {
              console.error('Error injecting upsell video script:', error);
            }
          })();
        `;
        
        document.head.appendChild(script);
        console.log('✅ Upsell VTurb script injected');

        setTimeout(() => {
          if ((window as any)[`upsellVideoLoaded_${videoId}`]) {
            setVideoLoaded(true);
            console.log('✅ Upsell video loaded successfully');
          } else {
            console.log('⚠️ Upsell video not loaded yet, will retry...');
            setTimeout(() => injectUpsellVideo(), 2000);
          }
        }, 5000);
      };
      
      setTimeout(() => {
        injectUpsellVideo();
      }, 1000);
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="font-black text-xs sm:text-sm md:text-base tracking-wide">⚠️ WAIT! YOUR ORDER IS NOT COMPLETE</span>
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
        </div>
      </div>

      <div className="pt-16 px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          
          <header className="mb-6 sm:mb-8 text-center animate-fadeInDown animation-delay-200">
            <img 
              src="https://i.imgur.com/QJxTIcN.png" 
              alt="Blue Drops Logo"
              className="h-6 sm:h-8 w-auto mx-auto"
            />
          </header>

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

          <div className="mb-6 animate-fadeInUp animation-delay-600">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative">
              <div
                id={`vid-upsell-${videoIds[variant]}`}
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
                  contain: 'layout style paint size'
                }}
              ></div>
            </div>
          </div>

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

          {!showPurchaseButton && (
            <div className="mb-6 text-center animate-fadeInUp animation-delay-800">
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 font-semibold text-sm">
                      Please make sure your sound is on
                    </span>
                  </div>
                  <p className="text-blue-600 text-xs">
                    This video contains important audio information
                  </p>
                </div>

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