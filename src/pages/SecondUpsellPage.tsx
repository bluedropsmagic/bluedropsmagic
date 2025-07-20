import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, CheckCircle, Shield, Truck, Clock } from 'lucide-react';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';
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
  highRiskUrl: string;
  productImage: string;
  acceptButtonText: string;
  rejectButtonText: string;
  videoId: string;
}

// ✅ NEW: Ignite testimonials for second upsell page
interface IgniteTestimonial {
  id: number;
  name: string;
  location: string;
  testimonial: string;
  videoId: string;
}

const igniteTestimonials: IgniteTestimonial[] = [
  {
    id: 1,
    name: "Daniel Carter",
    location: "Austin, TX",
    testimonial: "First week on Ignite and I stopped snoozing my alarm. By week three, my wife thought I'd had work done — turns out I just got my testosterone back.",
    videoId: "687c9e4e7d725bff283cc099"
  },
  {
    id: 2,
    name: "Marcus Reed",
    location: "Atlanta, GA",
    testimonial: "I wasn't expecting this… but people started treating me differently. More respect, more attention — even my wife noticed I was walking taller.",
    videoId: "687c9e611dd0489c9a8ab751"
  },
  {
    id: 3,
    name: "Rick Alvarez",
    location: "San Diego, CA",
    testimonial: "I'm 47 and haven't felt this alive in years. The drive is back, the confidence is back… I honestly feel unstoppable again.",
    videoId: "687c9e49886aa48cc3165615"
  }
];

export const SecondUpsellPage: React.FC<SecondUpsellPageProps> = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const { trackOfferClick } = useAnalytics();
  const [cartParams, setCartParams] = useState<string>('');
  const [showPurchaseSection, setShowPurchaseSection] = useState(false);
  const [showTestimonials, setShowTestimonials] = useState(false);
  const [isBoltEnvironment, setIsBoltEnvironment] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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
      console.log('🔧 Bolt environment detected on second upsell page - showing all content immediately');
      setShowPurchaseSection(true);
      setShowTestimonials(true);
    }
  }, []);

  // ✅ NEW: Show purchase section after 2min41s (161 seconds)
  useEffect(() => {
    if (isBoltEnvironment) {
      return; // Skip timer in Bolt environment
    }
    
    const timer = setTimeout(() => {
      console.log('⏰ 2min41s elapsed - showing purchase section');
      setShowPurchaseSection(true);
      
      // Show testimonials 30 seconds after purchase section
      setTimeout(() => {
        console.log('⏰ Showing testimonials after purchase section');
        setShowTestimonials(true);
      }, 30000);
      
    }, 161000); // 2min41s = 161 seconds = 161,000 milliseconds
    
    return () => clearTimeout(timer);
  }, [isBoltEnvironment]);

  // ✅ NEW: Inject VTurb script for second upsell video
  useEffect(() => {
    const videoId = '687c9e4e7d725bff283cc099'; // Main video for second upsell
    
    console.log('🎬 Injecting VTurb for second upsell video:', videoId);
    
    // Remove existing script if any
    const existingScript = document.getElementById(`scr_${videoId}`);
    if (existingScript) {
      existingScript.remove();
    }

    // Create the vturb-smartplayer element
    const playerContainer = document.getElementById('second-upsell-video');
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
      console.log('✅ VTurb script injected for second upsell video');
    }

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(`scr_${videoId}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // ✅ NEW: Inject testimonial videos when testimonials are shown
  useEffect(() => {
    if (showTestimonials) {
      const currentVideoId = igniteTestimonials[currentTestimonial].videoId;
      
      console.log('🎬 Injecting Ignite testimonial video:', currentVideoId);
      
      // Remove existing script if any
      const existingScript = document.getElementById(`scr_testimonial_${currentVideoId}`);
      if (existingScript) {
        existingScript.remove();
      }

      // Create the vturb-smartplayer element
      const playerContainer = document.getElementById('ignite-testimonial-video');
      if (playerContainer) {
        playerContainer.innerHTML = `
          <vturb-smartplayer 
            id="vid-${currentVideoId}" 
            style="display: block; margin: 0 auto; width: 100%;"
          ></vturb-smartplayer>
        `;

        // Inject the script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = `scr_testimonial_${currentVideoId}`;
        script.async = true;
        script.innerHTML = `
          (function() {
            try {
              console.log('🎬 Loading Ignite testimonial video: ${currentVideoId}');
              var s = document.createElement("script");
              s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${currentVideoId}/v4/player.js";
              s.async = true;
              s.onload = function() {
                console.log('✅ Ignite testimonial video loaded: ${currentVideoId}');
              };
              s.onerror = function() {
                console.error('❌ Failed to load Ignite testimonial video: ${currentVideoId}');
              };
              document.head.appendChild(s);
            } catch (error) {
              console.error('Error injecting Ignite testimonial script:', error);
            }
          })();
        `;
        
        document.head.appendChild(script);
        console.log('✅ Ignite testimonial VTurb script injected');
      }
    }

    // Cleanup on unmount
    return () => {
      if (showTestimonials) {
        const currentVideoId = igniteTestimonials[currentTestimonial].videoId;
        const scriptToRemove = document.getElementById(`scr_testimonial_${currentVideoId}`);
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      }
    };
  }, [showTestimonials, currentTestimonial]);

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

  const getSecondUpsellContent = (variant: string): SecondUpsellContent => {
    return {
      offer: {
        title: 'RECOMMENDED SUPPORT PACKAGE',
        subtitle: '✔️ Add Testosterone Support to Your Order',
        description: 'Complete your transformation with enhanced testosterone support'
      },
      pricing: {
        pricePerBottle: 'Only $39 per bottle',
        totalPrice: '2 bottles of Ignite',
        savings: 'Save $60 instantly',
        freeBottles: '',
        paidBottles: '2 BOTTLES'
      },
      acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=yes',
      rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=no',
      highRiskUrl: 'https://pagamento.paybluedrops.com/checkout/190510289:1',
      productImage: 'https://i.imgur.com/2YU6i8f.png',
      acceptButtonText: 'YES — ADD THIS TESTOSTERONE SUPPORT TO MY ORDER',
      rejectButtonText: 'No thanks — I\'ll pass on this opportunity',
      videoId: '687c9e4e7d725bff283cc099'
    };
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

  const handleHighRisk = () => {
    trackInitiateCheckout(content.highRiskUrl);
    trackOfferClick(`second-upsell-${variant}-high-risk`);
    
    let url = cartParams ? `${content.highRiskUrl}&${cartParams}` : content.highRiskUrl;
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
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-orange-50">
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
      
      {/* Fixed Orange Alert Banner */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="font-black text-xs sm:text-sm md:text-base tracking-wide">⚠️ SPECIAL TESTOSTERONE OFFER - LIMITED TIME</span>
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
              <span className="text-orange-900 block mb-1">Wait! One More Thing</span>
              <span className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-800 bg-clip-text text-transparent block">
                For Maximum Results
              </span>
            </h1>
            
            <p className="text-sm sm:text-base text-orange-800 font-semibold px-2 mb-6">
              Before you complete your order, there's one final addition that could amplify your results dramatically.
            </p>
          </div>

          {/* ✅ NEW: VTurb Video Section */}
          <div className="mb-6 animate-fadeInUp animation-delay-500">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative">
              <div
                id="second-upsell-video"
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
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-lg">🔊</span>
                <span className="text-orange-800 font-semibold text-sm">
                  Please make sure your sound is on
                </span>
              </div>
              <p className="text-orange-600 text-xs">
                This video contains important audio information
              </p>
            </div>
          </div>

          {/* ✅ Purchase Section - Only show after 2min41s */}
          {(showPurchaseSection || isBoltEnvironment) && (
          <div 
            id="purchase-section"
            className="mb-6 relative animate-fadeInUp animation-delay-800"
          >
            {/* TESTOSTERONE BOOST Tag */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black shadow-lg border border-white/40">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-xl sm:text-2xl">🔥</span>
                  <span className="tracking-wide">TESTOSTERONE BOOST</span>
                </div>
              </div>
            </div>

            {/* Card Container */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 rounded-2xl sm:rounded-3xl blur-lg opacity-60 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-orange-600/95 to-red-700/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 pt-6 sm:pt-8 border-2 border-white/30 shadow-2xl">
                
                {/* Product Image */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <img 
                    src={content.productImage} 
                    alt="Ignite Testosterone Support"
                    className="w-full h-auto object-contain drop-shadow-2xl max-h-32 sm:max-h-40 md:max-h-48"
                  />
                </div>

                {/* Product Name */}
                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">
                    {content.offer.title}
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base font-bold tracking-wide -mt-1">
                    {content.offer.subtitle}
                  </p>
                </div>

                {/* Offer Details */}
                <div className="text-center mb-4">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-lg mb-3">
                    {content.pricing.totalPrice}
                  </div>
                  
                  {/* Benefits List */}
                  <div className="space-y-1.5 sm:space-y-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 mb-4">
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 flex-shrink-0" />
                      <span>{content.pricing.pricePerBottle}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 flex-shrink-0" />
                      <span>Enhanced testosterone support</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 flex-shrink-0" />
                      <span>Increased energy and drive</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 flex-shrink-0" />
                      <span>Perfect complement to BlueDrops</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="relative mb-4">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 rounded-xl blur opacity-75 animate-pulse"></div>
                  <button 
                    onClick={handleAccept}
                    className="relative w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg sm:text-xl border-2 border-white/40 backdrop-blur-sm overflow-hidden checkout-button"
                  >
                    <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"></div>
                    <span className="relative z-10">{content.acceptButtonText}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>

                {/* High Risk Option */}
                <div className="mb-4">
                  <div className="bg-red-600/20 border border-red-400/30 rounded-lg p-3 mb-3">
                    <div className="text-center">
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                        🔥 6 BOTTLES — $49 per bottle
                      </div>
                      <p className="text-white text-sm font-bold">
                        $294 total — Maximum testosterone support
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-red-600/20 border border-red-400/30 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <img 
                        src="https://i.imgur.com/zDB7vWu.png" 
                        alt="High Risk Warning"
                        className="w-8 h-8"
                      />
                      <span className="text-red-200 font-bold text-sm">
                        HIGH TESTOSTERONE RISK
                      </span>
                    </div>
                    <p className="text-red-200 text-xs text-center">
                      Maximum strength formula - Use with caution
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleHighRisk}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-sm border border-white/30 checkout-button"
                  >
                    ⚠️ I ACCEPT THE HIGH TESTOSTERONE RISK
                  </button>
                  
                  <div className="mt-2 text-center">
                    <p className="text-red-200 text-xs">
                      ⚠️ ATENÇÃO: Esta opção pode causar aumento excessivo de testosterona
                    </p>
                  </div>
                </div>

                {/* Benefits Icons */}
                <div className="flex justify-center items-center gap-1 mb-3">
                  <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-sm rounded px-2 py-1 border border-orange-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">180-Day</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-sm rounded px-2 py-1 border border-orange-300/40 flex-1">
                    <div className="flex items-center justify-center gap-1 text-white">
                      <Truck className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-center font-semibold text-xs">Free Ship</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-sm rounded px-2 py-1 border border-orange-300/40 flex-1">
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

          {/* ✅ Reject Button - Only show after 2min41s */}
          {(showPurchaseSection || isBoltEnvironment) && (
          <div className="mb-6 animate-fadeInUp animation-delay-900">
            <button 
              onClick={handleReject}
              className="w-full bg-gradient-to-br from-gray-400/80 to-gray-600/80 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 shadow-xl text-white hover:bg-gray-500/80 transition-all duration-300 checkout-button"
            >
              <span className="text-xs sm:text-sm font-medium">❌ {content.rejectButtonText}</span>
            </button>
          </div>
          )}

          {/* ✅ NEW: Ignite Testimonials Section - Only show after purchase section appears */}
          {(showTestimonials || isBoltEnvironment) && (
          <section className="mb-6 animate-fadeInUp animation-delay-1100">
            {/* Section Header */}
            <div className="text-center mb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-orange-900 mb-2">
                <span className="block">Real Men.</span>
                <span className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-800 bg-clip-text text-transparent block">
                  Real Results.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-orange-700 font-semibold">
                What Men Are Saying About Ignite
              </p>
            </div>

            {/* Current Testimonial */}
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-200 shadow-lg mb-4">
              {/* Customer Info */}
              <div className="text-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-orange-900 mb-1">
                  🎤 {igniteTestimonials[currentTestimonial].name}
                </h3>
                <p className="text-sm sm:text-base text-orange-700 font-medium mb-3">
                  {igniteTestimonials[currentTestimonial].location}
                </p>
                <div className="inline-flex">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-bold">IGNITE USER</span>
                  </div>
                </div>
              </div>

              {/* Video Container */}
              <div className="mb-4">
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 relative">
                  <div
                    id="ignite-testimonial-video"
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

              {/* Testimonial Quote */}
              <div className="bg-orange-50 backdrop-blur-sm rounded-xl p-3 border border-orange-100">
                <p className="text-sm sm:text-base text-orange-800 leading-relaxed italic text-center">
                  "{igniteTestimonials[currentTestimonial].testimonial}"
                </p>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex items-center justify-center gap-3">
              {igniteTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-8 h-8 rounded-full font-bold text-xs transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'bg-orange-600 text-white shadow-lg scale-110'
                      : 'bg-orange-100 text-orange-600 hover:bg-orange-200 hover:scale-105'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </section>
          )}

          {/* ✅ Footer Warning - Only show after 2min41s */}
          {(showPurchaseSection || isBoltEnvironment) && (
          <footer className="text-center text-orange-700 animate-fadeInUp animation-delay-1000">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-orange-200">
              <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg inline-block mb-2">
                <span className="font-bold text-xs sm:text-sm">🔴 FINAL WARNING</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-red-600 mb-1">
                Once this page closes, this testosterone offer disappears forever.
              </p>
              <p className="text-xs opacity-70">
                This is your only chance to add Ignite to your order
              </p>
            </div>
          </footer>
          )}

        </div>
      </div>
    </div>
  );
};