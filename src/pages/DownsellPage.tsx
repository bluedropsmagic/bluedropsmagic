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
    }
  }, []);

  // ✅ NEW: Show email section after 1min32s (92 seconds)
  useEffect(() => {
    if (isBoltEnvironment) {
      return; // Skip timer in Bolt environment
    }
    
    const emailTimer = setTimeout(() => {
      console.log('⏰ 1min32s elapsed - showing email section');
      setShowEmailSection(true);
      
      // Show second video 10 seconds after email appears
      setTimeout(() => {
        console.log('⏰ Showing second video after email');
        setShowSecondVideo(true);
        
        // Show purchase buttons 1min13s after second video appears
        setTimeout(() => {
          console.log('⏰ 1min13s after second video - showing purchase buttons');
          setShowPurchaseButtons(true);
        }, 73000); // 1min13s = 73 seconds
        
      }, 10000);
      
    }, 92000); // 1min32s = 92 seconds
    
    return () => clearTimeout(emailTimer);
  }, [isBoltEnvironment]);

  // ✅ NEW: Inject VTurb script for downsell video
  useEffect(() => {
    // ✅ UPDATED: Use specific video ID based on variant
    const getVideoId = (variant: string) => {
      switch (variant) {
        case 'dws1': return '687c7957886aa48cc3163f77'; // For 1-bottle buyers - FIRST video
        case 'dws2': return '687c7957886aa48cc3163f77'; // For 3-bottle buyers - FIRST video
        case 'dw3': return '687c7957886aa48cc3163f77';  // For 6-bottle buyers - FIRST video
        default: return '687c7957886aa48cc3163f77';
      }
    };
    
    const videoId = getVideoId(variant);
    
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
      // ✅ FIXED: Use the correct second video IDs based on variant
      const getSecondVideoId = (variant: string) => {
        switch (variant) {
          case 'dws1': return '687c8357a159330096eff21e'; // For 1-bottle buyers - SECOND video
          case 'dws2': return '687c7e662a38c6be43a1fc6e'; // For 3-bottle buyers - SECOND video
          case 'dw3': return '687c83476137406f142b1e81';  // For 6-bottle buyers - SECOND video
          default: return '687c8357a159330096eff21e';
        }
      };
      
      const videoId = getSecondVideoId(variant);
      
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
      const getSecondVideoId = (variant: string) => {
        switch (variant) {
          case 'dws1': return '687c8357a159330096eff21e';
          case 'dws2': return '687c7e662a38c6be43a1fc6e';
          case 'dw3': return '687c83476137406f142b1e81';
          default: return '687c8357a159330096eff21e';
        }
      };
      
      const scriptToRemove = document.getElementById(`scr_${getSecondVideoId(variant)}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [showSecondVideo, variant]);

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
        productType: 'COMPLETE YOUR TREATMENT',
        priceText: '$23 per bottle',
        subscriptionText: 'Add 8 more bottles to your order',
        productImage: 'https://i.imgur.com/2YU6i8f.png', // Same as up1bt
        savings: 'Save $528 instantly',
        description: 'Complete 9-month treatment protocol',
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=no',
        finalOfferText: '👉 Add 8 More Bottles – $23/Bottle',
        bottleCount: '8 more bottles',
        pricePerBottle: '$23'
      },
      'dws2': {
        productType: 'COMPLETE YOUR TREATMENT',
        priceText: '$23 per bottle',
        subscriptionText: 'Add 6 more bottles to your order',
        productImage: 'https://i.imgur.com/hsfqxVP.png', // 6-bottle product image
        savings: 'Save $396 instantly',
        description: 'Complete 9-month treatment protocol',
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=no',
        finalOfferText: '👉 Add 6 More Bottles – $23/Bottle',
        bottleCount: '6 more bottles',
        pricePerBottle: '$23'
      },
      'dw3': {
        productType: 'COMPLETE YOUR TREATMENT',
        priceText: '$23 per bottle',
        subscriptionText: 'Add 3 more bottles to your order',
        productImage: 'https://i.imgur.com/eXYnjhm.png', // 3-bottle product image
        savings: 'Save $198 instantly',
        description: 'Complete 9-month treatment protocol',
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=no',
        finalOfferText: '👉 Add 3 More Bottles – $23/Bottle',
        bottleCount: '3 more bottles',
        pricePerBottle: '$23'
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

          {/* Email Section - Only show after 1min32s */}
          {showEmailSection && (
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
          )}

          {/* Second VTurb Video Section - Only show after email appears */}
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
          {showPurchaseButtons && (
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
          )}

        </div>
      </div>
    </div>
  );
};