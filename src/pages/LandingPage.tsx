import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { initializeRedTrack } from '../utils/redtrackIntegration';
import { initializeFacebookPixelTracking } from '../utils/facebookPixelTracking';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';
import { Star, Shield, Truck, CreditCard, CheckCircle, Play, Volume2, AlertTriangle } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isBoltEnvironment, setIsBoltEnvironment] = useState(false);
  const { trackVideoPlay, trackVideoProgress, trackOfferClick } = useAnalytics();

  // Detect Bolt environment
  useEffect(() => {
    const hostname = window.location.hostname;
    const isBolt = hostname.includes('stackblitz') || 
                   hostname.includes('bolt.new') ||
                   hostname.includes('webcontainer') ||
                   hostname.includes('localhost') ||
                   hostname.includes('127.0.0.1');
    
    setIsBoltEnvironment(isBolt);
  }, []);

  // Initialize tracking and inject VTurb script
  useEffect(() => {
    // Initialize tracking
    initializeRedTrack();
    initializeFacebookPixelTracking();
    
    // Inject VTurb script for landing page video
    const injectVTurbScript = () => {
      const videoId = '683ba3d1b87ae17c6e07e7db'; // Same as main page
      
      // Remove existing script if any
      const existingScript = document.getElementById(`scr_${videoId}`);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = `scr_${videoId}`;
      script.async = true;
      script.innerHTML = `
        (function() {
          try {
            console.log('🎬 Loading landing page VTurb video: ${videoId}');
            var s = document.createElement("script");
            s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoId}/player.js";
            s.async = true;
            s.onload = function() {
              console.log('✅ Landing page VTurb video loaded: ${videoId}');
              window.landingVideoLoaded = true;
              
              // Auto-play attempt
              setTimeout(function() {
                try {
                  if (window.smartplayer && window.smartplayer.instances && window.smartplayer.instances['${videoId}']) {
                    var player = window.smartplayer.instances['${videoId}'];
                    if (player.play) {
                      player.play();
                      console.log('✅ Auto-play via smartplayer instance');
                    }
                  }
                  
                  var videoElements = document.querySelectorAll('#vid_${videoId} video');
                  videoElements.forEach(function(video) {
                    if (video.play) {
                      video.play().then(function() {
                        console.log('✅ Auto-play via video element');
                      }).catch(function(error) {
                        console.log('⚠️ Auto-play blocked by browser:', error);
                      });
                    }
                  });
                } catch (error) {
                  console.log('⚠️ Auto-play failed:', error);
                }
              }, 3000);
            };
            s.onerror = function() {
              console.error('Failed to load landing page VTurb script');
            };
            document.head.appendChild(s);
          } catch (error) {
            console.error('Error injecting landing page VTurb script:', error);
          }
        })();
      `;
      
      document.head.appendChild(script);
      console.log('✅ Landing page VTurb script injected');
    };

    setTimeout(() => {
      injectVTurbScript();
      
      const checkVideoLoaded = () => {
        const videoContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
        if (videoContainer && (videoContainer.querySelector('video') || videoContainer.querySelector('iframe') || window.landingVideoLoaded)) {
          setIsVideoLoaded(true);
        }
      };
      
      checkVideoLoaded();
      const videoCheckInterval = setInterval(checkVideoLoaded, 1000);
      
      setTimeout(() => {
        clearInterval(videoCheckInterval);
        setIsVideoLoaded(true);
      }, 15000);
      
      return () => {
        clearInterval(videoCheckInterval);
      };
    }, 500);

    return () => {
      const scriptToRemove = document.getElementById('scr_683ba3d1b87ae17c6e07e7db');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  const handlePurchase = (packageType: 'premium' | 'regular' | 'trial') => {
    const urls = {
      'premium': 'https://pagamento.paybluedrops.com/checkout/176849703:1', // 6-bottle
      'regular': 'https://pagamento.paybluedrops.com/checkout/176845818:1',  // 3-bottle  
      'trial': 'https://pagamento.paybluedrops.com/checkout/176654642:1'     // 1-bottle
    };
    
    const url = urls[packageType];
    
    // Track the offer click
    trackOfferClick(`landing-${packageType}`);
    trackInitiateCheckout(url);
    
    // Add CID if present
    let finalUrl = url;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !finalUrl.includes('cid=')) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    setTimeout(() => {
      window.location.href = finalUrl;
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 overflow-x-hidden">
      {/* Bolt Environment Indicator */}
      {isBoltEnvironment && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
            🔧 BOLT MODE: Landing Page
          </div>
        </div>
      )}

      {/* Main container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:py-8 max-w-full">
        
        {/* Header */}
        <header className="mb-6 sm:mb-8 animate-fadeInDown animation-delay-200">
          <img 
            src="https://i.imgur.com/QJxTIcN.png" 
            alt="Blue Drops Logo"
            className="h-8 w-auto"
          />
        </header>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
          
          {/* Hero Section */}
          <div className="mb-6 text-center w-full animate-fadeInUp animation-delay-400">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[0.85] mb-3 px-2">
              <span className="text-blue-900 block mb-0.5">The Natural Trick</span>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block mb-0.5">
                Helping Men Over 40
              </span>
              <span className="text-blue-900 block">Ditch the Blue Pill</span>
            </h1>
            
            <p className="text-base sm:text-lg text-blue-800 mb-2 font-semibold px-2">
              No Prescriptions, No Side Effects, No Embarrassment
            </p>
            
            <div className="flex items-center justify-center gap-2 text-blue-700 text-sm">
              <Play className="w-4 h-4" />
              <span className="font-medium tracking-wider">WATCH THE BREAKTHROUGH DISCOVERY</span>
            </div>
          </div>

          {/* Video Section */}
          <div className="w-full mb-6 sm:mb-8 animate-fadeInUp animation-delay-600">
            <div className="relative w-full max-w-sm mx-auto">
              <div className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
                <div
                  id="vid_683ba3d1b87ae17c6e07e7db"
                  className="absolute inset-0 w-full h-full z-30 cursor-pointer"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    touchAction: 'manipulation',
                    isolation: 'isolate',
                    contain: 'layout style paint'
                  }}
                >
                  <img 
                    id="thumb_683ba3d1b87ae17c6e07e7db" 
                    src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/683ba3d1b87ae17c6e07e7db/thumbnail.jpg" 
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                    alt="VSL Thumbnail"
                    loading="eager"
                    style={{ 
                      touchAction: 'manipulation',
                      zIndex: 1
                    }}
                  />
                  
                  <div 
                    id="backdrop_683ba3d1b87ae17c6e07e7db" 
                    className="absolute inset-0 w-full h-full cursor-pointer"
                    style={{
                      WebkitBackdropFilter: 'blur(5px)',
                      backdropFilter: 'blur(5px)',
                      zIndex: 2,
                      touchAction: 'manipulation'
                    }}
                  />

                  {!isVideoLoaded && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      style={{ 
                        touchAction: 'manipulation',
                        zIndex: 20
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

            {/* Video Warnings */}
            <div className="mt-4 space-y-3 max-w-sm mx-auto">
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

          {/* First CTA Section */}
          <div className="w-full mb-8 animate-fadeInUp animation-delay-800">
            <PurchaseButtons onPurchase={handlePurchase} />
          </div>
        </div>

        {/* Product Benefits Section */}
        <section className="mt-8 sm:mt-12 w-full max-w-4xl mx-auto px-4 animate-fadeInUp animation-delay-1000">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 mb-4">
              <span className="block">Why BlueDrops Works</span>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
                When Pills Don't
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard 
              icon="🩸"
              title="Boosts Blood Flow by 373%"
              description="Activates your body's natural circulation switch for maximum performance"
            />
            <BenefitCard 
              icon="💪"
              title="Restores Firm, Long-Lasting Erections"
              description="Get back the confidence and performance you had in your 20s"
            />
            <BenefitCard 
              icon="⏰"
              title="Just a 7-Second Ritual Before Bed"
              description="Simple drops under your tongue - no pills, no injections, no hassle"
            />
            <BenefitCard 
              icon="🌿"
              title="All-Natural Ingredients"
              description="Safe and effective formula with zero reported side effects"
            />
            <BenefitCard 
              icon="🚫"
              title="No Doctor Visits, No Embarrassment"
              description="Skip the awkward conversations and get results privately"
            />
            <BenefitCard 
              icon="📦"
              title="Discreet Shipping"
              description="Arrives at your doorstep in plain, unmarked packaging"
            />
          </div>
        </section>

        {/* Scientific Proof Section */}
        <section className="mt-16 sm:mt-20 w-full max-w-4xl mx-auto px-4 animate-fadeInUp animation-delay-1200">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 mb-4">
              <span className="block">Backed by</span>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
                Real Science
              </span>
            </h2>
          </div>

          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-200 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <img 
                  src="https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" 
                  alt="Scientific Research" 
                  className="w-full h-64 object-cover rounded-xl shadow-lg"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <img src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=60&h=40&fit=crop" alt="Harvard" className="h-8" />
                  <img src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=60&h=40&fit=crop" alt="Boston University" className="h-8" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4">
                  Harvard & Boston University Research
                </h3>
                
                <div className="space-y-3 text-blue-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm sm:text-base">
                      <strong>Bicarbonate-based formula</strong> activates hidden "circulation switch" in men
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm sm:text-base">
                      <strong>Over 175,000 men</strong> are already using this bedtime formula
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm sm:text-base">
                      <strong>Clinical studies show</strong> significant improvement in just 7 days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mt-16 sm:mt-20 w-full max-w-4xl mx-auto px-4 animate-fadeInUp animation-delay-1400">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 mb-4">
              <span className="block">Real Men.</span>
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
                Real Results.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard 
              name="Daniel Carter"
              location="Austin, TX"
              image="https://i.imgur.com/4bcFSBQ.png"
              testimonial="I was skeptical at first, but BlueDrops completely changed my life. My wife noticed the difference before I even told her!"
              rating={5}
            />
            <TestimonialCard 
              name="Marcus Reed"
              location="Atlanta, GA"
              image="https://i.imgur.com/Ob6Vy9q.png"
              testimonial="After 50, I thought there was no hope. BlueDrops proved me wrong. I feel like I'm 30 again!"
              rating={5}
            />
            <TestimonialCard 
              name="Rick Alvarez"
              location="San Diego, CA"
              image="https://i.imgur.com/UJ0L2tZ.png"
              testimonial="No more embarrassing doctor visits. BlueDrops gave me back my confidence and my relationship."
              rating={5}
            />
          </div>
        </section>

        {/* Guarantee Section */}
        <section className="mt-16 sm:mt-20 w-full max-w-2xl mx-auto px-4 animate-fadeInUp animation-delay-1600">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-200 shadow-lg text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400 p-1">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center text-white">
                      <div className="text-lg sm:text-xl font-bold text-yellow-400">90</div>
                      <div className="text-xs sm:text-sm font-bold">DAYS</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                  100%
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4">
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                90-Day Money-Back Guarantee
              </span>
            </h3>
            
            <p className="text-blue-800 text-sm sm:text-base leading-relaxed">
              Your order is protected by our iron-clad 90-day guarantee. If BlueDrops doesn't 
              restore your confidence and performance, we'll refund every penny. No questions asked.
            </p>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="mt-16 sm:mt-20 w-full max-w-md mx-auto px-4 animate-fadeInUp animation-delay-1800">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-blue-900 mb-2">
              Ready to Transform Your Life?
            </h2>
            <p className="text-blue-700 text-sm sm:text-base">
              Choose your BlueDrops package below
            </p>
          </div>
          
          <PurchaseButtons onPurchase={handlePurchase} />
        </section>

        {/* Footer */}
        <footer className="mt-16 sm:mt-20 text-center text-blue-700 w-full px-4 animate-fadeInUp animation-delay-2000">
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 max-w-xl mx-auto border border-blue-200">
            <p className="text-xs mb-1">
              <strong>Copyright ©2024 | Blue Drops</strong>
            </p>
            <p className="text-xs mb-2">All Rights Reserved</p>
            <p className="text-xs opacity-70">
              These statements have not been evaluated by the Food and Drug Administration. 
              This product is not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Purchase Buttons Component
const PurchaseButtons: React.FC<{ onPurchase: (type: 'premium' | 'regular' | 'trial') => void }> = ({ onPurchase }) => {
  return (
    <div className="space-y-4">
      {/* Premium Offer - $294 */}
      <div className="relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-blue-600 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black shadow-lg border border-white/40">
            <div className="flex items-center gap-1 sm:gap-2">
              <Star className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600 fill-current" />
              <span className="tracking-wide">BEST VALUE</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
          
          <div className="relative bg-gradient-to-br from-blue-600/95 to-blue-800/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 pt-6 sm:pt-8 border-2 border-white/30 shadow-2xl">
            <div className="text-center mb-3">
              <h3 className="text-lg sm:text-xl font-black text-white mb-1">
                PREMIUM PACKAGE
              </h3>
              <p className="text-white/80 text-sm">6 Bottles - 180 Day Supply</p>
              <p className="text-yellow-400 font-bold text-base sm:text-lg">$294 - Save $900</p>
            </div>

            <button 
              onClick={() => onPurchase('premium')}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 sm:py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-base sm:text-lg checkout-button"
            >
              CLAIM PREMIUM OFFER
            </button>

            <div className="flex justify-center items-center gap-1 mt-3">
              <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm rounded px-2 py-1 border border-blue-300/40 flex-1">
                <div className="flex items-center justify-center gap-1 text-white">
                  <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-xs">90-Day</span>
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
                  <CreditCard className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                  <span className="text-center font-semibold text-xs">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regular and Trial side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Regular Offer - $88 */}
        <div className="bg-gradient-to-br from-blue-400/80 to-blue-600/80 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-xl">
          <div className="text-center mb-2">
            <h3 className="text-sm font-bold text-white">REGULAR</h3>
            <p className="text-white/80 text-xs">3 Bottles</p>
            <p className="text-yellow-400 font-bold text-sm">$88</p>
          </div>
          
          <button 
            onClick={() => onPurchase('regular')}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-2 px-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-xs checkout-button"
          >
            ORDER NOW
          </button>
        </div>

        {/* Trial Offer - $49 */}
        <div className="bg-gradient-to-br from-blue-300/80 to-blue-500/80 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-xl">
          <div className="text-center mb-2">
            <h3 className="text-sm font-bold text-white">TRIAL</h3>
            <p className="text-white/80 text-xs">1 Bottle</p>
            <p className="text-yellow-400 font-bold text-sm">$49</p>
          </div>
          
          <button 
            onClick={() => onPurchase('trial')}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-2 px-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-xs checkout-button"
          >
            TRY NOW
          </button>
        </div>
      </div>
    </div>
  );
};

// Benefit Card Component
const BenefitCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/50">
      <div className="text-center">
        <div className="text-3xl sm:text-4xl mb-3">{icon}</div>
        <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">{title}</h3>
        <p className="text-blue-700 text-sm sm:text-base leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard: React.FC<{ 
  name: string; 
  location: string; 
  image: string; 
  testimonial: string; 
  rating: number; 
}> = ({ name, location, image, testimonial, rating }) => {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-200 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <img 
          src={image}
          alt={name}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-blue-300 shadow-lg"
        />
        <div>
          <h4 className="font-bold text-blue-900 text-sm sm:text-base">{name}</h4>
          <p className="text-blue-700 text-xs sm:text-sm">{location}</p>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
            ))}
          </div>
        </div>
      </div>
      
      <p className="text-blue-800 text-sm sm:text-base leading-relaxed italic">
        "{testimonial}"
      </p>
      
      <div className="mt-3 inline-flex">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
          <CheckCircle className="w-3 h-3" />
          <span className="text-xs font-bold">VERIFIED</span>
        </div>
      </div>
    </div>
  );
};

// Global type declarations
declare global {
  interface Window {
    landingVideoLoaded?: boolean;
  }
}