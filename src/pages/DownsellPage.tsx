import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, Mail, Star, Shield, CheckCircle, Clock, Truck } from 'lucide-react';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';
import { BoltNavigation } from '../components/BoltNavigation';

interface DownsellPageProps {
  variant: 'dws1' | 'dws2' | 'dw3';
}

interface DownsellContent {
  productType: string;
  priceText: string;
  subscriptionText: string;
  productImage: string;
  savings: string;
  description: string;
  acceptUrl: string;
  rejectUrl: string;
  finalOfferText: string;
  bottleCount: string;
  pricePerBottle: string;
}

export const DownsellPage: React.FC<DownsellPageProps> = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const { trackOfferClick } = useAnalytics();
  const [cartParams, setCartParams] = useState<string>('');
  const [isBoltEnvironment, setIsBoltEnvironment] = useState(false);
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [showSecondVideo, setShowSecondVideo] = useState(false);
  const [showPurchaseButtons, setShowPurchaseButtons] = useState(false);
  const [showRestOfContent, setShowRestOfContent] = useState(false); // ✅ NEW: Control rest of content

  // ✅ NEW: Detect Bolt environment
  useEffect(() => {
    const hostname = window.location.hostname;
    const isBolt = hostname.includes('stackblitz') || 
                   hostname.includes('bolt.new') ||
                   hostname.includes('webcontainer') ||
                   hostname.includes('localhost') ||
                   hostname.includes('127.0.0.1');
    
    setIsBoltEnvironment(isBolt);
    
    if (isBolt) {
      console.log('🔧 Bolt environment detected on downsell page - all content visible');
      setShowEmailSection(true);
      setShowSecondVideo(true);
      setShowPurchaseButtons(true);
      setShowRestOfContent(true);
    }
  }, []);

  // ✅ NEW: Show rest of content after 1min30s (90 seconds)
  useEffect(() => {
    if (isBoltEnvironment) return; // Skip timer in Bolt environment
    
    const contentTimer = setTimeout(() => {
      console.log('⏰ 1min30s elapsed - showing rest of downsell content');
      setShowRestOfContent(true);
      setShowEmailSection(true);
      setShowPurchaseButtons(true);
      
      // Show second video 10 seconds after content appears
      setTimeout(() => {
        console.log('⏰ Showing second video after content');
        setShowSecondVideo(true);
      }, 10000);
      
    }, 90000); // 1min30s = 90 seconds
    
    return () => clearTimeout(contentTimer);
  }, [isBoltEnvironment]);

  // ✅ NEW: Show email section after 1min32s (92 seconds)
  useEffect(() => {
    // ✅ REMOVED: Email timing now controlled by showRestOfContent
    return () => {}; // Empty cleanup
  }, []);

  // ✅ NEW: Show purchase buttons after 1min13s (73 seconds) 
  useEffect(() => {
    // ✅ REMOVED: Button timing now controlled by showRestOfContent
    return () => {}; // Empty cleanup
  }, []);

  // ✅ NEW: Inject VTurb script for downsell video
  useEffect(() => {
    const videoId = '687c72f603cd186056ea5d15';
    
    console.log('🎬 Injecting VTurb for downsell video:', videoId);
    
    // Remove existing script if any
    const existingScript = document.getElementById(`scr_${videoId}`);
    if (existingScript) {
      existingScript.remove();
    }

    // Create the vturb-smartplayer element
    const playerContainer = document.getElementById('downsell-video-container');
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
            console.log('🎬 Loading downsell VTurb video: ${videoId}');
            var s = document.createElement("script");
            s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/v4/player.js";
            s.async = true;
            s.onload = function() {
              console.log('✅ Downsell VTurb video loaded: ${videoId}');
            };
            s.onerror = function() {
              console.error('❌ Failed to load downsell VTurb video: ${videoId}');
            };
            document.head.appendChild(s);
          } catch (error) {
            console.error('Error injecting downsell VTurb script:', error);
          }
        })();
      `;
      
      document.head.appendChild(script);
      console.log('✅ VTurb script injected for downsell video');
    }

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(`scr_${videoId}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // ✅ NEW: Inject second VTurb video
  useEffect(() => {
    if (showSecondVideo) {
      const videoId = '687c7957886aa48cc3163f77';
      
      console.log('🎬 Injecting second VTurb video:', videoId);
      
      // Remove existing script if any
      const existingScript = document.getElementById(`scr_${videoId}`);
      if (existingScript) {
        existingScript.remove();
      }

      // Create the vturb-smartplayer element
      const playerContainer = document.getElementById('second-video-container');
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
              console.log('🎬 Loading second downsell VTurb video: ${videoId}');
              var s = document.createElement("script");
              s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/v4/player.js";
              s.async = true;
              s.onload = function() {
                console.log('✅ Second downsell VTurb video loaded: ${videoId}');
              };
              s.onerror = function() {
                console.error('❌ Failed to load second downsell VTurb video: ${videoId}');
              };
              document.head.appendChild(s);
            } catch (error) {
              console.error('Error injecting second downsell VTurb script:', error);
            }
          })();
        `;
        
        document.head.appendChild(script);
        console.log('✅ Second VTurb script injected for downsell video');
      }
    }

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById('scr_687c7957886aa48cc3163f77');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [showSecondVideo]);

  // ✅ Ensure no Hotjar on downsell pages
  useEffect(() => {
    const existingHotjar = document.querySelectorAll('script[src*="hotjar"]');
    existingHotjar.forEach(script => script.remove());
    
    if ((window as any).hj) {
      delete (window as any).hj;
    }
    if ((window as any)._hjSettings) {
      delete (window as any)._hjSettings;
    }
    
    console.log('🚫 Hotjar removed from downsell page');
  }, []);

  // Preserve CartPanda parameters
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

  const getDownsellContent = (variant: string): DownsellContent => {
    const contents = {
      'dws1': {
        productType: '6 BOTTLE PACKAGE',
        priceText: '$23 per bottle',
        subscriptionText: 'When you buy a 6-bottle kit',
        productImage: 'https://i.postimg.cc/XqFzZmRd/6-bottle.png',
        savings: 'Save $66 per bottle',
        description: 'Complete 6-bottle treatment',
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=no',
        finalOfferText: '👉 6 Bottles – $23/Bottle',
        bottleCount: '6 bottles',
        pricePerBottle: '$23'
      },
      'dws2': {
        productType: '6 BOTTLE PACKAGE',
        priceText: '$24 per bottle',
        subscriptionText: 'When you buy a 6-bottle kit',
        productImage: 'https://i.postimg.cc/XqFzZmRd/6-bottle.png',
        savings: 'Save $65 per bottle',
        description: 'Complete 6-bottle treatment',
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=no',
        finalOfferText: '👉 6 Bottles – $24/Bottle',
        bottleCount: '6 bottles',
        pricePerBottle: '$24'
      },
      'dw3': {
        productType: '3 BOTTLE PACKAGE',
        priceText: '$33 per bottle',
        subscriptionText: 'When you buy a 3-bottle kit',
        productImage: 'https://i.postimg.cc/XqFzZmRd/6-bottle.png',
        savings: 'Save $150 total',
        description: 'Complete 3-bottle treatment',
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=no',
        finalOfferText: '👉 3 Bottles – $33/Bottle',
        bottleCount: '3 bottles',
        pricePerBottle: '$33'
      }
    };

    return contents[variant as keyof typeof contents] || contents['dws1'];
  };

  const content = getDownsellContent(variant);

  const handleAccept = () => {
    trackInitiateCheckout(content.acceptUrl);
    trackOfferClick(`downsell-${variant}-accept`);
    
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
    trackOfferClick(`downsell-${variant}-reject`);
    
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
      
      {/* ✅ NEW: Bolt Environment Indicator */}
      {isBoltEnvironment && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
            🔧 BOLT MODE: All Content Visible
          </div>
        </div>
      )}
      
      {/* Fixed Red Alert Banner */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="font-black text-xs sm:text-sm md:text-base tracking-wide">⚠️ FINAL CHANCE - DON'T MISS OUT</span>
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
        </div>
      </div>

      {/* Main Content */}
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

          {/* Main Headline */}
          <div className="mb-6 text-center animate-fadeInUp animation-delay-400">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-3">
              <span className="text-red-600 block mb-1">So you're really just going to</span>
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent block">
                give up and walk away
              </span>
              <span className="text-blue-900 block">like nothing's at stake?</span>
            </h1>
          </div>

          {/* VTurb Video Section */}
          <div className="mb-6 animate-fadeInUp animation-delay-400">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative">
              <div
                id="downsell-video-container"
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

          {/* ✅ REST OF CONTENT - Only show after 1min30s */}
          {(showRestOfContent || isBoltEnvironment) && (
          <>
          {/* Email Section */}
          <section className="mb-6 animate-fadeInUp">
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
              {/* Email Header */}
              <div className="bg-gray-100 rounded-lg p-3 mb-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900 text-sm">Email Received</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>From:</strong> James C.</p>
                  <p><strong>To:</strong> support@bluedrops.com</p>
                  <p><strong>Subject:</strong> New Order Request</p>
                </div>
              </div>
              
              {/* Email Content */}
              <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
                <p>I need your help.</p>
                <p>I recently finished my 6 bottles of Blue Drops, and honestly — I don't want to stop.</p>
                <p>I don't worry about sex anymore, and my wife has never been so satisfied with my performance.</p>
                <p>On top of that, I've noticed an increase in penis size — and so has my wife.</p>
                <p><strong>I think I gained around 2 inches, it's insane!!!</strong></p>
                <p>I feel more energetic and have way more stamina in everyday life.</p>
                <p>I wanted to order another 6-month supply, but I saw the site says it's out of stock.</p>
                <p>Please let me know when it's back — I'm willing to pay more if needed.</p>
                <p>Sincerely,<br/>James C.</p>
              </div>
            </div>
          </section>

          {/* Second VTurb Video Section */}
          {showSecondVideo && (
          <div className="mb-6 animate-fadeInUp">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative">
              <div
                id="second-video-container"
                className="w-full h-full"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%'
                }}
              >
                {/* Second VTurb player will be injected here */}
              </div>
            </div>
          </div>
          )}

          {/* Main Offer */}
          <div className="mb-6 relative animate-fadeInUp animation-delay-1100">
            {/* TODAY ONLY Tag */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black shadow-lg border border-white/40">
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  <span className="tracking-wide">TODAY ONLY</span>
                </div>
              </div>
            </div>

            {/* Card Container */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-2xl sm:rounded-3xl blur-lg opacity-60 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-green-500/95 to-green-700/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 pt-6 sm:pt-8 border-2 border-white/30 shadow-2xl">
                
                {/* Product Image */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <img 
                    src={content.productImage} 
                    alt={`BlueDrops ${content.productType}`}
                    className="w-full h-auto object-contain drop-shadow-2xl max-h-32 sm:max-h-40 md:max-h-48"
                  />
                </div>

                {/* Product Name */}
                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">
                    BLUEDROPS
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base font-bold tracking-wide -mt-1">
                    {content.productType}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/30 mb-3">
                    <p className="text-2xl sm:text-3xl font-black text-white mb-1">
                      {content.priceText}
                    </p>
                    <p className="text-white/90 text-xs sm:text-sm">
                      {content.subscriptionText}
                    </p>
                  </div>
                  
                  <p className="text-yellow-300 font-bold text-sm sm:text-base mb-2">
                    {content.savings}
                  </p>
                </div>

                {/* CTA Button */}
                <div className="relative mb-4">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl blur opacity-75 animate-pulse"></div>
                  <button 
                    onClick={handleAccept}
                    className="relative w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg sm:text-xl border-2 border-white/40 backdrop-blur-sm overflow-hidden checkout-button"
                  >
                    <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"></div>
                    <span className="relative z-10">YES, I WANT THIS DEAL</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>

                {/* Benefits Icons */}
                <div className="flex justify-center items-center gap-1 mb-3">
                  <div className="bg-gradient-to-r from-green-600/30 to-green-800/30 backdrop-blur-sm rounded px-2 py-1 border border-green-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">180-Day</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-600/30 to-green-800/30 backdrop-blur-sm rounded px-2 py-1 border border-green-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Truck className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">Free Ship</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-600/30 to-green-800/30 backdrop-blur-sm rounded px-2 py-1 border border-green-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Clock className="w-3 h-3 text-red-400 flex-shrink-0" />
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

          {/* Lab Discount Message */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1200">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 font-bold text-sm sm:text-base">
                This is the <strong>BIGGEST</strong> discount ever offered by the lab — because we don't want you to suffer from ED ever again.
              </p>
            </div>
          </section>

          {/* Extra Benefits Intro */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1300">
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-blue-200">
              <p className="text-blue-800 text-sm sm:text-base">
                And don't miss out on the <strong>EXTRA</strong> benefits this formula can bring you.
              </p>
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-6 animate-fadeInUp animation-delay-1400">
            {/* Tristan Hayes */}
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 border border-blue-200 shadow-lg mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">T</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Tristan Hayes</h4>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-gray-600 text-xs">Charleston, SC</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 leading-relaxed italic text-xs sm:text-sm">
                    "I can't thank you enough for introducing me to Blue Drops! I thought I'd never feel like a real man again. My self-esteem is back. Thank you!"
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Landon Bishop */}
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4 border border-blue-200 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">L</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Landon Bishop</h4>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-gray-600 text-xs">Tucson, AZ</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 leading-relaxed italic text-xs sm:text-sm">
                    "This is exactly what I needed! Damn — it feels so good to be confident in bed again. Thanks a ton! Young guys don't stand a chance against me now, haha. Blue Drops is now part of my daily routine."
                  </blockquote>
                </div>
              </div>
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1500">
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-blue-200">
              <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-3">
                Take advantage of this one-time-only offer...
              </h2>
              <p className="text-blue-800 text-sm sm:text-base mb-3">
                And like them — start living with the sexual power and confidence you deserve.
              </p>
              <p className="text-red-600 font-bold text-sm sm:text-base">
                Remember: This deal will <strong>NEVER</strong> appear again for you.
              </p>
            </div>
          </section>

          {/* Final Offer Repeat */}
          <div className="mb-6 relative animate-fadeInUp animation-delay-1600">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-blue-600/95 to-blue-800/95 backdrop-blur-xl rounded-2xl p-4 border-2 border-white/30 shadow-2xl">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-white mb-2">
                    {content.finalOfferText}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                    <span className="text-white font-bold text-sm sm:text-base">✔ 100% Satisfaction Guarantee</span>
                  </div>
                  
                  <button 
                    onClick={handleAccept}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg checkout-button"
                  >
                    YES, I WANT THIS DEAL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Closing Message */}
          <section className="text-center mb-6 animate-fadeInUp animation-delay-1700">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
              <p className="text-blue-800 text-sm sm:text-base mb-1">I'll leave it here.</p>
              <p className="text-blue-600 font-medium text-sm sm:text-base">Take care!</p>
            </div>
          </section>

          {/* Reject Button */}
          <div className="mb-6 animate-fadeInUp animation-delay-1800">
            <button 
              onClick={handleReject}
              className="w-full bg-gradient-to-br from-gray-400/80 to-gray-600/80 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 shadow-xl text-white hover:bg-gray-500/80 transition-all duration-300 checkout-button"
            >
              <span className="text-xs sm:text-sm font-medium">No, thanks. I'll miss out.</span>
            </button>
          </div>
          </>
          )}

        </div>
      </div>
    </div>
  );
};