import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, CheckCircle, Shield, Truck, Clock } from 'lucide-react';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { BoltNavigation } from '../components/BoltNavigation';

interface SecondUpsellPageProps {
  variant: 'up2-1bt' | 'up2-3bt' | 'up2-6bt';
}

interface SecondUpsellContent {
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
  videoId: string;
}

export const SecondUpsellPage: React.FC<SecondUpsellPageProps> = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const { trackOfferClick } = useAnalytics();
  const [cartParams, setCartParams] = useState<string>('');
  const [showPurchaseSection, setShowPurchaseSection] = useState(false);
  const [isBoltEnvironment, setIsBoltEnvironment] = useState(false);

  // Detect Bolt environment
  useEffect(() => {
    const hostname = window.location.hostname;
    const isBolt = hostname.includes('stackblitz') || 
                   hostname.includes('bolt.new') ||
                   hostname.includes('webcontainer') ||
                   hostname.includes('localhost') ||
                   hostname.includes('127.0.0.1');
    
    setIsBoltEnvironment(isBolt);
    
    if (isBolt) {
      console.log('🔧 Bolt environment detected on second upsell page - showing all content immediately');
      setShowPurchaseSection(true);
    }
  }, []);

  // Inject Hotjar for second upsell pages
  useEffect(() => {
    // Remove ALL existing Hotjar scripts to prevent conflicts
    const existingHotjar = document.querySelectorAll('script[src*="hotjar"]');
    existingHotjar.forEach(script => script.remove());
    
    // Also remove any Hotjar settings
    if ((window as any).hj) {
      delete (window as any).hj;
    }
    if ((window as any)._hjSettings) {
      delete (window as any)._hjSettings;
    }

    // Inject Hotjar script for second upsells
    const hotjarScript = document.createElement('script');
    hotjarScript.innerHTML = `
      (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:6457430,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `;
    
    document.head.appendChild(hotjarScript);
    console.log('🔥 Hotjar second upsell tracking loaded (ID: 6457430)');

    // Cleanup on unmount
    return () => {
      const scriptsToRemove = document.querySelectorAll('script[src*="hotjar"]');
      scriptsToRemove.forEach(script => script.remove());
      
      // Clean up Hotjar globals
      if ((window as any).hj) {
        delete (window as any).hj;
      }
      if ((window as any)._hjSettings) {
        delete (window as any)._hjSettings;
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

  // Show purchase section after 2min41s (161 seconds)
  useEffect(() => {
    // Skip timer in Bolt environment - show content immediately
    if (isBoltEnvironment) {
      console.log('🔧 Bolt environment - showing purchase section immediately');
      setShowPurchaseSection(true);
      return;
    }
    
    const timer = setTimeout(() => {
      console.log('⏰ 2min41s elapsed - showing purchase section');
      setShowPurchaseSection(true);
      
      // Auto-scroll to purchase section
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
      }, 500);
      
    }, 161000); // 2min41s = 161 seconds = 161,000 milliseconds
    
    return () => clearTimeout(timer);
  }, [isBoltEnvironment]);

  // Inject VTurb script based on variant
  useEffect(() => {
    const content = getSecondUpsellContent(variant);
    const videoId = content.videoId;
    
    console.log(`🎬 Injecting VTurb for ${variant} second upsell, video ID: ${videoId}`);
    
    // Remove existing script if any
    const existingScript = document.getElementById(`scr_${videoId}`);
    if (existingScript) {
      existingScript.remove();
    }

    // Create the vturb-smartplayer element
    const playerContainer = document.getElementById(`second-upsell-video-${variant}`);
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
            console.log('🎬 Loading second upsell VTurb video: ${videoId}');
            var s = document.createElement("script");
            s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/v4/player.js";
            s.async = true;
            s.onload = function() {
              console.log('✅ Second upsell VTurb video loaded: ${videoId}');
            };
            s.onerror = function() {
              console.error('❌ Failed to load second upsell VTurb video: ${videoId}');
            };
            document.head.appendChild(s);
          } catch (error) {
            console.error('Error injecting second upsell VTurb script:', error);
          }
        })();
      `;
      
      document.head.appendChild(script);
      console.log(`✅ VTurb script injected for ${variant} second upsell`);
    }

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(`scr_${videoId}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [variant]);

  const getSecondUpsellContent = (variant: string): SecondUpsellContent => {
    const contents = {
      'up2-1bt': {
        offer: {
          title: 'IGNITEMEN — RECOMMENDED SUPPORT PACKAGE',
          subtitle: '🔹 Complete your recovery with essential testosterone support',
          description: 'The perfect complement to your BlueDrops protocol'
        },
        pricing: {
          pricePerBottle: 'Special offer: Only $69 per bottle',
          totalPrice: '2 bottles — $138 total',
          savings: 'No subscription. No pressure. Just what you need.',
          freeBottles: '',
          paidBottles: 'TESTOSTERONE SUPPORT PACKAGE'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/second-offer/up2-1bt?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/checkout/176654642:1/thank-you',
        productImage: 'https://i.imgur.com/MKvvyGH.png',
        acceptButtonText: 'YES — ADD IGNITEMEN TO MY ORDER',
        rejectButtonText: 'No thanks — Complete my order',
        videoId: '687c8357a159330096eff21e' // Placeholder video ID
      },
      'up2-3bt': {
        offer: {
          title: 'IGNITEMEN — RECOMMENDED SUPPORT PACKAGE',
          subtitle: '🔹 Complete your recovery with essential testosterone support',
          description: 'The perfect complement to your BlueDrops protocol'
        },
        pricing: {
          pricePerBottle: 'Special offer: Only $69 per bottle',
          totalPrice: '2 bottles — $138 total',
          savings: 'No subscription. No pressure. Just what you need.',
          freeBottles: '',
          paidBottles: 'TESTOSTERONE SUPPORT PACKAGE'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/second-offer/up2-3bt?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/checkout/176845818:1/thank-you',
        productImage: 'https://i.imgur.com/MKvvyGH.png',
        acceptButtonText: 'YES — ADD IGNITEMEN TO MY ORDER',
        rejectButtonText: 'No thanks — Complete my order',
        videoId: '687c7e662a38c6be43a1fc6e' // Placeholder video ID
      },
      'up2-6bt': {
        offer: {
          title: 'IGNITEMEN — RECOMMENDED SUPPORT PACKAGE',
          subtitle: '🔹 Complete your recovery with essential testosterone support',
          description: 'The perfect complement to your BlueDrops protocol'
        },
        pricing: {
          pricePerBottle: 'Special offer: Only $69 per bottle',
          totalPrice: '2 bottles — $138 total',
          savings: 'No subscription. No pressure. Just what you need.',
          freeBottles: '',
          paidBottles: 'TESTOSTERONE SUPPORT PACKAGE'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/checkout/176849703:1/thank-you',
        productImage: 'https://i.imgur.com/MKvvyGH.png',
        acceptButtonText: 'YES — ADD IGNITEMEN TO MY ORDER',
        rejectButtonText: 'No thanks — Complete my order',
        videoId: '687c83476137406f142b1e81' // Placeholder video ID
      }
    };

    return contents[variant as keyof typeof contents];
  };

  const content = getSecondUpsellContent(variant);

  const handleAccept = () => {
    trackInitiateCheckout(content.acceptUrl);
    trackOfferClick(`second-upsell-${variant}-accept`);
    
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
    trackOfferClick(`second-upsell-${variant}-reject`);
    
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
      {/* Bolt Navigation */}
      <BoltNavigation />
      
      {/* Bolt Environment Indicator */}
      {isBoltEnvironment && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
            🔧 BOLT MODE: All Content Visible
          </div>
        </div>
      )}
      
      {/* Fixed Red Alert Banner */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="font-black text-xs sm:text-sm md:text-base tracking-wide">⚠️ FINAL UPGRADE OPPORTUNITY</span>
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
              <span className="text-blue-900 block mb-1">You've already fixed the problem.</span>
              <span className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-800 bg-clip-text text-transparent block">
                Now it's time to reclaim your power.
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-orange-800 font-medium px-2 mb-6">
              Your recovery is underway — but your presence, your energy, and your dominance? That's a choice you make right now.
            </p>
          </div>

          {/* VTurb Video Section */}
          <div className="mb-6 animate-fadeInUp animation-delay-500">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative">
              <div
                id={`second-upsell-video-${variant}`}
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

          {/* Sound Warning */}
          <div className="mb-4 animate-fadeInUp animation-delay-600">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-lg">🔊</span>
                <span className="text-orange-800 font-semibold text-sm">
                  Please make sure your sound is on
                </span>
              </div>
              <p className="text-orange-600 text-xs">
                This video contains important upgrade information
              </p>
            </div>
          </div>

          {/* Unique Offer Warning */}
          <div className="mb-6 animate-fadeInUp animation-delay-700">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 font-semibold text-sm">
                  This is your final upgrade opportunity
                </span>
              </div>
              <p className="text-red-600 text-xs">
                Once you leave this page, this exclusive offer will never be available again
              </p>
            </div>
          </div>

          {/* Purchase Section - Only show after 2min41s */}
          {(showPurchaseSection || isBoltEnvironment) && (
          <div 
            id="purchase-section"
            className="mb-6 relative animate-fadeInUp animation-delay-800"
          >
            {/* FINAL UPGRADE Tag */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black shadow-lg border border-white/40">
                <div className="flex items-center gap-1 sm:gap-2">
                  <AlertTriangle className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  <span className="tracking-wide">🟠 IGNITEMEN</span>
                </div>
              </div>
            </div>

            {/* Card Container */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 rounded-2xl sm:rounded-3xl blur-lg opacity-60 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-orange-600/95 to-red-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 pt-6 sm:pt-8 border-2 border-white/30 shadow-2xl">
                
                {/* Product Image */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <img 
                    src={content.productImage} 
                    alt="BlueDrops Premium Upgrade"
                    className="w-full h-auto object-contain drop-shadow-2xl max-h-32 sm:max-h-40 md:max-h-48"
                  />
                </div>

                {/* Product Name */}
                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">
                    🟠 IGNITEMEN
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base font-bold tracking-wide -mt-1">
                    {content.offer.title}
                  </p>
                </div>

                {/* Offer Details */}
                <div className="text-center mb-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-lg mb-3">
                    {content.offer.subtitle}
                  </div>
                  
                  {/* Benefits List */}
                  <div className="space-y-1.5 sm:space-y-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 mb-4">
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-orange-400 flex-shrink-0" />
                      <span>Designed to elevate your energy, confidence, and presence</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-orange-400 flex-shrink-0" />
                      <span>{content.pricing.totalPrice}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-orange-400 flex-shrink-0" />
                      <span>{content.pricing.pricePerBottle}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-orange-400 flex-shrink-0" />
                      <span>{content.pricing.savings}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-orange-400 flex-shrink-0" />
                      <span>👉 This is the smart move: the boost your system needs, with total control.</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="relative mb-4">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 rounded-xl blur opacity-75 animate-pulse"></div>
                  <button 
                    onClick={handleAccept}
                    className="relative w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg sm:text-xl border-2 border-white/40 backdrop-blur-sm overflow-hidden checkout-button"
                  >
                    <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"></div>
                    <span className="relative z-10">{content.acceptButtonText}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>

                {/* Benefits Icons */}
                <div className="flex justify-center items-center gap-1 mb-3">
                  <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-sm rounded px-2 py-1 border border-orange-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Shield className="w-3 h-3 text-orange-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">180-Day</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-sm rounded px-2 py-1 border border-orange-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Truck className="w-3 h-3 text-orange-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">Free Ship</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-sm rounded px-2 py-1 border border-orange-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Clock className="w-3 h-3 text-orange-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">Limited</span>
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

          {/* Reject Button - Only show after 2min41s */}
          {(showPurchaseSection || isBoltEnvironment) && (
          <div className="mb-6 space-y-4 animate-fadeInUp animation-delay-900">
            {/* Warning Button - High Testosterone Risk */}
            <div className="relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-red-500 to-red-700 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg border border-white/40">
                  ⚠️ HIGH RISK
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-600/95 to-red-800/95 backdrop-blur-xl rounded-xl p-4 pt-6 border-2 border-white/30 shadow-2xl">
                {/* Product Image */}
                <div className="flex justify-center mb-3">
                  <img 
                    src="https://i.imgur.com/zDB7vWu.png" 
                    alt="High Testosterone Warning"
                    className="w-full h-auto object-contain drop-shadow-2xl max-h-24 sm:max-h-32"
                  />
                </div>

                {/* Warning Text */}
                <div className="text-center mb-4">
                  <h4 className="text-lg sm:text-xl font-black text-white mb-2 leading-tight">
                    ⚠️ WARNING: EXTREME TESTOSTERONE BOOST
                  </h4>
                  <p className="text-red-200 text-xs sm:text-sm font-medium mb-3">
                    We don't have data on how people will react to such high testosterone levels
                  </p>
                  
                  <div className="bg-red-500/30 backdrop-blur-sm rounded-lg p-3 border border-red-300/40 mb-3">
                    <p className="text-white text-sm sm:text-base font-bold">
                      🔥 6 BOTTLES — $49 per bottle
                    </p>
                    <p className="text-red-100 text-xs sm:text-sm">
                      $294 total — Maximum testosterone support
                    </p>
                  </div>
                  
                  <div className="bg-red-500/30 backdrop-blur-sm rounded-lg p-3 border border-red-300/40 mb-4">
                    <p className="text-white text-xs sm:text-sm font-bold">
                      🚨 YOU MAY RECEIVE UNWANTED ATTENTION
                    </p>
                    <p className="text-red-100 text-xs mt-1">
                      Buy at your own risk — results may be too powerful
                    </p>
                  </div>
                </div>

                {/* Extreme CTA Button */}
                <button 
                  onClick={() => {
                    // Track high risk offer click
                    trackInitiateCheckout('https://pagamento.paybluedrops.com/checkout/190510289:1');
                    trackOfferClick(`second-upsell-${variant}-high-risk`);
                    
                    let url = 'https://pagamento.paybluedrops.com/checkout/190510289:1';
                    
                    // Add cart params if present
                    if (cartParams) {
                      url += (url.includes('?') ? '&' : '?') + cartParams;
                    }
                    
                    // Add CID if present
                    const urlParams = new URLSearchParams(window.location.search);
                    const cid = urlParams.get('cid');
                    if (cid && !url.includes('cid=')) {
                      url += (url.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
                    }
                    
                    setTimeout(() => {
                      window.location.href = url;
                    }, 150);
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base border-2 border-white/40 backdrop-blur-sm overflow-hidden checkout-button"
                >
                  <span className="relative z-10">⚠️ I ACCEPT THE RISK — GIVE ME MAXIMUM POWER</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

            {/* Original Reject Button */}
            <button 
              onClick={handleReject}
              className="w-full bg-gradient-to-br from-gray-400/80 to-gray-600/80 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 shadow-xl text-white hover:bg-gray-500/80 transition-all duration-300 checkout-button"
            >
              <span className="text-xs sm:text-sm font-medium">❌ {content.rejectButtonText}</span>
            </button>
          </div>
          )}

          {/* Testimonials Section - Only show after purchase section appears */}
          {(showPurchaseSection || isBoltEnvironment) && (
          <div className="mb-6 animate-fadeInUp animation-delay-1100">
            <TestimonialsSection />
          </div>
          )}

          {/* Footer Warning - Only show after 2min41s */}
          {(showPurchaseSection || isBoltEnvironment) && (
          <footer className="text-center text-orange-700 animate-fadeInUp animation-delay-1000">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-orange-200">
              <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg inline-block mb-2">
                <span className="font-bold text-xs sm:text-sm">🔴 FINAL WARNING</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-red-600 mb-1">
                Once this page closes, this upgrade offer disappears forever.
              </p>
              <p className="text-xs opacity-70">
                This is your only chance to secure the premium upgrade package
              </p>
            </div>
          </footer>
          )}

        </div>
      </div>
    </div>
  );
};