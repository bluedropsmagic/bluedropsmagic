import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, CheckCircle, Shield, Truck, Clock } from 'lucide-react';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';
import { TestimonialsSection } from '../components/TestimonialsSection';

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
  videoId: string; // ✅ NEW: VTurb video ID for each variant
}

export const UpsellPage: React.FC<UpsellPageProps> = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const { trackOfferClick } = useAnalytics();
  const [cartParams, setCartParams] = useState<string>('');
  const [showPurchaseSection, setShowPurchaseSection] = useState(false);

  // ✅ NEW: Inject Hotjar for upsell pages
  useEffect(() => {
    // Remove existing Hotjar script if any
    const existingHotjar = document.querySelector('script[src*="hotjar"]');
    if (existingHotjar) {
      existingHotjar.remove();
    }

    // Inject Hotjar script for upsells
    const hotjarScript = document.createElement('script');
    hotjarScript.innerHTML = `
      (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:6457424,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `;
    
    document.head.appendChild(hotjarScript);
    console.log('🔥 Hotjar upsell tracking loaded (ID: 6457424)');

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.querySelector('script[src*="hotjar"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);
  // Preserve CartPanda parameters
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Common CartPanda parameters to preserve
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

    // Also preserve any other parameters that might be present
    searchParams.forEach((value, key) => {
      if (!cartPandaParams.includes(key)) {
        params.append(key, value);
      }
    });

    setCartParams(params.toString());
  }, [searchParams]);

  // ✅ NEW: Show purchase section after 2min41s (161 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏰ 2min41s elapsed - showing purchase section');
      setShowPurchaseSection(true);
      
      // ✅ Auto-scroll to purchase section
      setTimeout(() => {
        const purchaseSection = document.getElementById('purchase-section');
        if (purchaseSection) {
          purchaseSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
          console.log('📍 Auto-scrolled to purchase section');
        }
      }, 500); // Small delay to ensure section is rendered
      
    }, 161000); // 2min41s = 161 seconds = 161,000 milliseconds
    
    return () => clearTimeout(timer);
  }, []);

  // ✅ NEW: Inject VTurb script based on variant
  useEffect(() => {
    const content = getUpsellContent(variant);
    const videoId = content.videoId;
    
    console.log(`🎬 Injecting VTurb for ${variant} upsell, video ID: ${videoId}`);
    
    // Remove existing script if any
    const existingScript = document.getElementById(`scr_${videoId}`);
    if (existingScript) {
      existingScript.remove();
    }

    // Create the vturb-smartplayer element
    const playerContainer = document.getElementById(`upsell-video-${variant}`);
    if (playerContainer) {
      playerContainer.innerHTML = `
        <vturb-smartplayer 
          id="vid-${videoId}" 
          style="display: block; margin: 0 auto; width: 100%;"
        ></vturb-smartplayer>
      `;

      // Inject the script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = `scr_${videoId}`;
      script.async = true;
      script.innerHTML = `
        (function() {
          try {
            console.log('🎬 Loading upsell VTurb video: ${videoId}');
            var s = document.createElement("script");
            s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/v4/player.js";
            s.async = true;
            s.onload = function() {
              console.log('✅ Upsell VTurb video loaded: ${videoId}');
            };
            s.onerror = function() {
              console.error('❌ Failed to load upsell VTurb video: ${videoId}');
            };
            document.head.appendChild(s);
          } catch (error) {
            console.error('Error injecting upsell VTurb script:', error);
          }
        })();
      `;
      
      document.head.appendChild(script);
      console.log(`✅ VTurb script injected for ${variant} upsell`);
    }

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(`scr_${videoId}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [variant]);

  const getUpsellContent = (variant: string): UpsellContent => {
    const contents = {
      '1-bottle': {
        offer: {
          title: 'COMPLETE 9‑MONTH TREATMENT',
          subtitle: '✔️ Add 8 More Bottles and Secure Your Masculinity',
          description: 'All at our lowest price ever...'
        },
        pricing: {
          pricePerBottle: 'Biggest discount ever: only $39 per bottle',
          totalPrice: '270 days of treatment',
          savings: 'Save $585 instantly',
          freeBottles: '',
          paidBottles: '8 MORE BOTTLES'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=no',
        productImage: 'https://i.imgur.com/2YU6i8f.png',
        acceptButtonText: 'CLAIM OFFER',
        rejectButtonText: 'No thanks — I\'ll throw away my progress and risk permanent failure',
        videoId: '686b6af315fc4aa5f81ab90b' // ✅ VTurb ID for 1-bottle upsell
      },
      '3-bottle': {
        offer: {
          title: 'COMPLETE 9‑MONTH TREATMENT',
          subtitle: '✔️ Add 6 More Bottles and Secure Your Masculinity',
          description: 'Complete your transformation with the full protocol'
        },
        pricing: {
          pricePerBottle: 'Biggest discount ever: only $39 per bottle',
          totalPrice: '270 days of treatment',
          savings: 'Save $585 instantly',
          freeBottles: '',
          paidBottles: '6 MORE BOTTLES'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/qJjMdRwYNl?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/qJjMdRwYNl?accepted=no',
        productImage: 'https://i.imgur.com/2YU6i8f.png',
        acceptButtonText: 'CLAIM OFFER',
        rejectButtonText: 'No thanks — I\'ll throw away my progress and risk permanent failure',
        videoId: '686b7739756a766918015263' // ✅ VTurb ID for 3-bottle upsell
      },
      '6-bottle': {
        offer: {
          title: 'COMPLETE 9‑MONTH TREATMENT',
          subtitle: '✔️ Add 3 More Bottles and Secure Your Masculinity',
          description: 'Just 1 more bottle to ensure complete, permanent results'
        },
        pricing: {
          pricePerBottle: 'Biggest discount ever: only $39 per bottle',
          totalPrice: '270 days of treatment',
          savings: 'Save $585 instantly',
          freeBottles: '',
          paidBottles: '3 MORE BOTTLES'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=no',
        productImage: 'https://i.imgur.com/2YU6i8f.png',
        acceptButtonText: 'CLAIM OFFER',
        rejectButtonText: 'No thanks — I\'ll throw away my progress and risk permanent failure',
        videoId: '686b75de199e54169b0f64af' // ✅ VTurb ID for 6-bottle upsell
      }
    };

    return contents[variant as keyof typeof contents];
  };

  const content = getUpsellContent(variant);

  const handleAccept = () => {
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
        <div className="max-w-md mx-auto">
          
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
            
            <p className="text-sm sm:text-base text-blue-800 font-semibold px-2 mb-6">
              Congratulations on securing your first bottles — but now, one last step could change everything.
            </p>
          </div>

          {/* ✅ NEW: VTurb Video Section */}
          <div className="mb-6 animate-fadeInUp animation-delay-500">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative">
              <div
                id={`upsell-video-${variant}`}
                className="w-full h-full"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%'
                }}
              >
                {/* VTurb player will be injected here */}
              </div>
            </div>
          </div>

          {/* ✅ NEW: Sound Warning */}
          <div className="mb-4 animate-fadeInUp animation-delay-600">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-lg">🔊</span>
                <span className="text-blue-800 font-semibold text-sm">
                  Please make sure your sound is on
                </span>
              </div>
              <p className="text-blue-600 text-xs">
                This video contains important audio information
              </p>
            </div>
          </div>

          {/* ✅ NEW: Unique Offer Warning */}
          <div className="mb-6 animate-fadeInUp animation-delay-700">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 font-semibold text-sm">
                  This is a unique, one-time offer
                </span>
              </div>
              <p className="text-red-600 text-xs">
                Once you leave this page, this offer will never be available again
              </p>
            </div>
          </div>

          {/* ✅ Purchase Section - Only show after 2min41s */}
          {showPurchaseSection && (
          <div 
            id="purchase-section"
            className="mb-6 relative animate-fadeInUp animation-delay-800"
          >
            {/* FINAL CHANCE Tag */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black shadow-lg border border-white/40">
                <div className="flex items-center gap-1 sm:gap-2">
                  <AlertTriangle className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  <span className="tracking-wide">FINAL CHANCE</span>
                </div>
              </div>
            </div>

            {/* Card Container */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-2xl sm:rounded-3xl blur-lg opacity-60 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-blue-600/95 to-blue-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 pt-6 sm:pt-8 border-2 border-white/30 shadow-2xl">
                
                {/* Product Image */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <img 
                    src={content.productImage} 
                    alt="BlueDrops Complete Treatment"
                    className="w-full h-auto object-contain drop-shadow-2xl max-h-32 sm:max-h-40 md:max-h-48"
                  />
                </div>

                {/* Product Name */}
                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">
                    BLUEDROPS
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base font-bold tracking-wide -mt-1">
                    {content.offer.title}
                  </p>
                </div>

                {/* Offer Details */}
                <div className="text-center mb-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-lg mb-3">
                    {content.offer.subtitle}
                  </div>
                  
                  {/* Benefits List */}
                  <div className="space-y-1.5 sm:space-y-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 mb-4">
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400 flex-shrink-0" />
                      <span>{content.pricing.totalPrice}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400 flex-shrink-0" />
                      <span>{content.pricing.pricePerBottle}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400 flex-shrink-0" />
                      <span>No extra shipping fees</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-400 flex-shrink-0" />
                      <span>Complete your transformation</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="relative mb-4">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-xl blur opacity-75 animate-pulse"></div>
                  <button 
                    onClick={handleAccept}
                    className="relative w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg sm:text-xl border-2 border-white/40 backdrop-blur-sm overflow-hidden checkout-button"
                  >
                    <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"></div>
                    <span className="relative z-10">{content.acceptButtonText}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>

                {/* Benefits Icons */}
                <div className="flex justify-center items-center gap-1 mb-3">
                  <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded px-2 py-1 border border-blue-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">180-Day</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded px-2 py-1 border border-blue-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Truck className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">Free Ship</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded px-2 py-1 border border-blue-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Clock className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">Secure</span>
                    </div>
                  </div>
                </div>

                {/* Benefits Image */}
                <div>
                  <div className="bg-white rounded p-1 shadow-sm">
                    <img 
                      src="https://i.imgur.com/1in1oo5.png" 
                      alt="Product Benefits"
                      className="w-full h-auto object-contain max-h-8 sm:max-h-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ✅ Reject Button - Only show after 2min41s */}
          {showPurchaseSection && (
          <div className="mb-6 animate-fadeInUp animation-delay-900">
            <button 
              onClick={handleReject}
              className="w-full bg-gradient-to-br from-gray-400/80 to-gray-600/80 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 shadow-xl text-white hover:bg-gray-500/80 transition-all duration-300 checkout-button"
            >
              <span className="text-xs sm:text-sm font-medium">❌ {content.rejectButtonText}</span>
            </button>
          </div>
          )}

          {/* ✅ NEW: Testimonials Section - Only show after purchase section appears */}
          {showPurchaseSection && (
          <div className="mb-6 animate-fadeInUp animation-delay-1100">
            <TestimonialsSection />
          </div>
          )}

          {/* ✅ Footer Warning - Only show after 2min41s */}
          {showPurchaseSection && (
          <footer className="text-center text-blue-700 animate-fadeInUp animation-delay-1000">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
              <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg inline-block mb-2">
                <span className="font-bold text-xs sm:text-sm">🔴 FINAL WARNING</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-red-600 mb-1">
                Once this page closes, this offer disappears forever.
              </p>
              <p className="text-xs opacity-70">
                This is your only chance to secure the full 9-month protocol
              </p>
            </div>
          </footer>
          )}

        </div>
      </div>
    </div>
  );
};