import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { initializeRedTrack } from '../utils/redtrackIntegration';
import { initializeFacebookPixelTracking } from '../utils/facebookPixelTracking';
import { buildUrlWithParams, initializeTracking } from '../utils/urlUtils';

// Import BoltNavigation
import { BoltNavigation } from '../components/BoltNavigation';

// Import all components
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { ProductOffers } from '../components/ProductOffers';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { DoctorsSection } from '../components/DoctorsSection';
import { FactorySection } from '../components/FactorySection';
import { NewsSection } from '../components/NewsSection';
import { GuaranteeSection } from '../components/GuaranteeSection';
import { Footer } from '../components/Footer';
import { Modals } from '../components/Modals';

// VS2 Video Section Component
const VS2VideoSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let loadingTimeout: number;
    let checkInterval: number;

    const checkVideoLoad = () => {
      const videoContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
      if (videoContainer) {
        const hasVideo =
          videoContainer.querySelector('video') ||
          videoContainer.querySelector('iframe') ||
          videoContainer.querySelector('[data-vturb-player]') ||
          window.vslVideoLoaded;

        if (hasVideo) {
          setIsLoading(false);
          setHasError(false);
        }
      }
    };

    checkVideoLoad();

    try {
      checkInterval = window.setInterval(checkVideoLoad, 1000);
      loadingTimeout = window.setTimeout(() => {
        window.clearInterval(checkInterval);
        if (isLoading) {
          setHasError(true);
          setIsLoading(false);
        }
      }, 15000);
    } catch (error) {
      console.error('Error setting up video load check:', error);
    }

    return () => {
      try {
        window.clearInterval(checkInterval);
        window.clearTimeout(loadingTimeout);
      } catch (error) {
        console.error('Error cleaning up video load check:', error);
      }
    };
  }, [isLoading]);

  const handleRetryLoad = () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);

    const existingScript = document.getElementById('scr_683ba3d1b87ae17c6e07e7db');
    if (existingScript) {
      existingScript.remove();
    }

    window.vslVideoLoaded = false;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'scr_683ba3d1b87ae17c6e07e7db';
    script.async = true;
    script.innerHTML = `
      (function() {
        try {
          var s = document.createElement("script");
          s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/683ba3d1b87ae17c6e07e7db/player.js";
          s.async = true; 
          s.defer = true;
          
          s.onerror = function(error) {
            console.error('Error loading VS2 VTurb script:', error);
          };
          
          s.onload = function() {
            console.log('✅ VS2 VTurb player script loaded successfully');
            window.vslVideoLoaded = true;
          };
          document.head.appendChild(s);
        } catch (error) {
          console.error('Error injecting VS2 VTurb script:', error);
        }
      })();
    `;
    document.head.appendChild(script);

    if (retryCount >= 3) {
      const scrollPos = window.scrollY;
      localStorage.setItem('scrollPosition', scrollPos.toString());
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="w-full mb-6 sm:mb-8 animate-fadeInUp animation-delay-600">
      <div className="flex items-center justify-center gap-2 text-blue-700 text-sm mb-4">
        <span className="font-medium tracking-wider">WATCH BELOW AND SEE HOW IT WORKS</span>
      </div>
      
      <div className="relative w-full max-w-sm mx-auto">
        <div className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
          <div
            id="vid_683ba3d1b87ae17c6e07e7db"
            className="absolute inset-0 w-full h-full z-30 cursor-pointer main-video-container"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              touchAction: 'manipulation',
              isolation: 'isolate',
              contain: 'layout style paint size',
              zIndex: 30,
              overflow: 'hidden',
              borderRadius: '1rem',
              backgroundColor: 'transparent'
            }}
            data-main-video="true"
            data-video-id="683ba3d1b87ae17c6e07e7db"
          >
            <img
              id="thumb_683ba3d1b87ae17c6e07e7db"
              src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/683ba3d1b87ae17c6e07e7db/thumbnail.jpg"
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              alt="VS2 VSL Thumbnail"
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

            {(isLoading || !window.vslVideoLoaded) && !hasError && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 15 }}>
                <div className="text-center text-white p-4">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
                  <p className="text-sm font-medium mb-1">Loading VS2 video...</p>
                  <p className="text-xs text-white/70">Please wait</p>
                  {isLoading && (
                    <button
                      onClick={handleRetryLoad}
                      className="mt-3 bg-blue-600/80 hover:bg-blue-700/80 text-white px-3 py-1.5 rounded text-xs transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center" style={{ zIndex: 15 }}>
                <div className="text-center text-white p-6">
                  <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <span className="text-red-400">⚠️</span>
                  </div>
                  <p className="text-sm font-medium mb-3">Error loading VS2 video</p>
                  <p className="text-xs text-white/70 mb-4">Attempt {retryCount + 1} of 4</p>
                  <button
                    onClick={handleRetryLoad}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Retry
                  </button>
                  {retryCount >= 2 && (
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] w-full"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Reload page
                    </button>
                  )}
                </div>
              </div>
            )}

            {!window.vslVideoLoaded && !hasError && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                style={{
                  touchAction: 'manipulation',
                  zIndex: 20
                }}
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-white/30 transition-colors">
                  <span className="text-white text-4xl">▶</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3 max-w-sm mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg">🔊</span>
            <span className="text-blue-800 font-semibold text-sm">
              Please make sure your sound is on
            </span>
          </div>
          <p className="text-blue-600 text-xs">This video contains important audio information</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-800 font-semibold text-sm">
              This video may be taken down at any time
            </span>
          </div>
          <p className="text-red-600 text-xs">Watch now before it's removed from the internet</p>
        </div>
      </div>
    </div>
  );
};

function VS2Page() {
  const [showPurchaseButton, setShowPurchaseButton] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showUpsellPopup, setShowUpsellPopup] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [showRestOfContent, setShowRestOfContent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBoltEnvironment, setIsBoltEnvironment] = useState(false);

  const showContentImmediately = () => {
    console.log('📰 VS2 News CTA clicked - showing content immediately');
    setShowRestOfContent(true);
    setShowPurchaseButton(true);
    
    setTimeout(() => {
      scrollToSixBottleButton();
    }, 1500);
  };

  useEffect(() => {
    const hostname = window.location.hostname;
    const isBolt = hostname.includes('stackblitz') || 
                   hostname.includes('bolt.new') ||
                   hostname.includes('webcontainer') ||
                   hostname.includes('localhost') ||
                   hostname.includes('127.0.0.1') ||
                   hostname.includes('preview') ||
                   hostname.includes('netlify.app');
    
    setIsBoltEnvironment(isBolt);
    
    if (isBolt) {
      console.log('🔧 VS2 Development environment detected - navigation buttons enabled');
    }
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const isVS2Page = path === '/vs2';
    
    if (isVS2Page) {
      const existingHotjar = document.querySelectorAll('script[src*="hotjar"]');
      existingHotjar.forEach(script => script.remove());
      
      const hotjarScript = document.createElement('script');
      hotjarScript.innerHTML = `
        (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:6457423,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `;
      
      document.head.appendChild(hotjarScript);
      console.log('🔥 VS2 Hotjar tracking loaded (ID: 6457423)');
    }
  }, []);

  const showRestOfContentAfterDelay = () => {
    console.log('🕐 VS2 35:55 reached - showing rest of content');
    setShowRestOfContent(true);
    setShowPurchaseButton(true);
    
    setTimeout(() => {
      scrollToSixBottleButton();
    }, 1000);
  };

  const navigate = useNavigate();
  const location = useLocation();
  const { trackVideoPlay, trackVideoProgress, trackOfferClick } = useAnalytics();

  const isVS2Page = location.pathname === '/vs2';

  useEffect(() => {
    const checkAdminAuth = () => {
      const isLoggedIn = sessionStorage.getItem('admin_authenticated') === 'true';
      const loginTime = sessionStorage.getItem('admin_login_time');
      
      if (isLoggedIn && loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (now - loginTimestamp < twentyFourHours) {
          setIsAdmin(true);
          console.log('VS2 Admin authenticated - DTC button will be shown');
        } else {
          sessionStorage.removeItem('admin_authenticated');
          sessionStorage.removeItem('admin_login_time');
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminAuth();
    const interval = setInterval(checkAdminAuth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAdmin || isBoltEnvironment) {
      console.log('👨‍💼 VS2 Admin logged in OR Bolt environment - showing purchase buttons and content');
      setShowRestOfContent(true);
      setShowPurchaseButton(true);
    }
  }, [isAdmin, isBoltEnvironment]);

  useEffect(() => {
    if (isBoltEnvironment) {
      console.log('🔧 VS2 Bolt environment - showing content immediately');
      setShowRestOfContent(true);
      setShowPurchaseButton(true);
      return;
    }
    
    console.log('🕐 VS2 Setting up 35:55 timer for content reveal');
    
    const timer = setTimeout(() => {
      console.log('🎯 VS2 35:55 elapsed - triggering content reveal');
      showRestOfContentAfterDelay();
    }, 2155000);
    
    return () => {
      console.log('🧹 VS2 Cleaning up 35:55 timer');
      clearTimeout(timer);
    };
  }, [isBoltEnvironment]);

  const scrollToSixBottleButton = () => {
    try {
      console.log('📍 VS2 Starting scroll to 6-bottle button...');
      
      const selectors = [
        '#six-bottle-package',
        '[data-purchase-section="true"]',
        '.purchase-button-main',
        'button[class*="yellow"]',
        '.checkout-button',
        '[id*="purchase"]'
      ];
      
      let sixBottlePackage = null;
      for (const selector of selectors) {
        sixBottlePackage = document.querySelector(selector);
        if (sixBottlePackage) {
          console.log('📍 VS2 Found purchase element with selector:', selector);
          break;
        }
      }
      
      if (sixBottlePackage) {
        console.log('📍 VS2 Auto-scrolling to 6-bottle purchase button');
        
        sixBottlePackage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        const element = sixBottlePackage as HTMLElement;
        element.style.transition = 'all 0.8s ease';
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.4)';
        
        setTimeout(() => {
          element.style.transform = 'scale(1)';
          element.style.boxShadow = '';
        }, 4000);
        
      } else {
        console.log('⚠️ VS2 Purchase button not found for auto-scroll');
      }
    } catch (error) {
      console.error('VS2 Error scrolling to 6-bottle purchase button:', error);
    }
  };

  useEffect(() => {
    initializeTracking();
    initializeRedTrack();
    initializeFacebookPixelTracking();
    
    const injectVTurbScript = () => {
      const mainContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
      if (!mainContainer) {
        console.error('❌ VS2 Main video container not found! Cannot inject VTurb script.');
        return;
      }
      
      console.log('✅ VS2 Main video container found:', mainContainer);

      mainContainer.style.position = 'absolute';
      mainContainer.style.top = '0';
      mainContainer.style.left = '0';
      mainContainer.style.width = '100%';
      mainContainer.style.height = '100%';
      mainContainer.style.zIndex = '30';
      mainContainer.style.overflow = 'hidden';
      mainContainer.style.borderRadius = '1rem';
      mainContainer.style.isolation = 'isolate';
      mainContainer.style.contain = 'layout style paint size';
      mainContainer.setAttribute('data-main-video', 'true');
      mainContainer.setAttribute('data-video-id', '683ba3d1b87ae17c6e07e7db');

      const existingScript = document.getElementById('scr_683ba3d1b87ae17c6e07e7db');
      if (existingScript) {
        existingScript.remove();
        console.log('🗑️ VS2 Removed existing VTurb script');
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'scr_683ba3d1b87ae17c6e07e7db';
      script.async = true;
      script.defer = true;
      
      script.innerHTML = `
        (function() {
          try {
            console.log('🎬 VS2 MAIN VIDEO: Initializing container isolation for 683ba3d1b87ae17c6e07e7db');
            
            window.mainVideoId = '683ba3d1b87ae17c6e07e7db';
            window.smartplayer = window.smartplayer || { instances: {} };
            
            var targetContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
            if (!targetContainer) {
              console.error('❌ VS2 CRITICAL: Main video container not found during script injection');
              return;
            }
            
            targetContainer.style.position = 'absolute';
            targetContainer.style.top = '0';
            targetContainer.style.left = '0';
            targetContainer.style.width = '100%';
            targetContainer.style.height = '100%';
            targetContainer.style.zIndex = '30';
            targetContainer.style.overflow = 'hidden';
            targetContainer.style.isolation = 'isolate';
            targetContainer.style.contain = 'layout style paint size';
            targetContainer.setAttribute('data-main-video', 'true');
            targetContainer.setAttribute('data-video-id', '683ba3d1b87ae17c6e07e7db');
            
            console.log('✅ VS2 MAIN VIDEO: Container isolation enforced');

            if (document.querySelector('script[src*="683ba3d1b87ae17c6e07e7db/player.js"]')) {
              console.log('🛡️ VS2 VTurb script already in DOM, skipping duplicate injection');
              window.vslVideoLoaded = true;
              return;
            }
            
            var s = document.createElement("script");
            s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/683ba3d1b87ae17c6e07e7db/player.js";
            s.async = true;
            s.onload = function() {
              console.log('✅ VS2 MAIN VIDEO: VTurb player script loaded successfully');
              window.vslVideoLoaded = true;
              
              var container = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
              if (!container) {
                console.error('❌ VS2 CRITICAL: Main video container disappeared after VTurb load!');
                return;
              }
              
              container.style.position = 'absolute';
              container.style.top = '0';
              container.style.left = '0';
              container.style.width = '100%';
              container.style.height = '100%';
              container.style.zIndex = '30';
              container.style.overflow = 'hidden';
              container.style.isolation = 'isolate';
              container.style.contain = 'layout style paint size';
              container.setAttribute('data-main-video', 'true');
              container.setAttribute('data-video-id', '683ba3d1b87ae17c6e07e7db');
              
              console.log('✅ VS2 MAIN VIDEO: Container isolation re-enforced after VTurb load');
              
              setTimeout(function() {
                try {
                  if (window.smartplayer && window.smartplayer.instances && window.smartplayer.instances['683ba3d1b87ae17c6e07e7db']) {
                    var player = window.smartplayer.instances['683ba3d1b87ae17c6e07e7db'];
                    if (player.play) {
                      player.play();
                      console.log('✅ VS2 MAIN VIDEO: Auto-play via smartplayer instance');
                    }
                  }
                  
                  var videoElements = document.querySelectorAll('#vid_683ba3d1b87ae17c6e07e7db video');
                  videoElements.forEach(function(video) {
                    if (video.play) {
                      video.play().then(function() {
                        console.log('✅ VS2 MAIN VIDEO: Auto-play via video element');
                      }).catch(function(error) {
                        console.log('⚠️ VS2 MAIN VIDEO: Auto-play blocked by browser:', error);
                      });
                    }
                  });
                  
                  var container = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
                  if (container) {
                    container.click();
                    console.log('✅ VS2 MAIN VIDEO: Auto-play via container click');
                  }
                } catch (error) {
                  console.log('⚠️ VS2 MAIN VIDEO: Auto-play failed:', error);
                }
              }, 3000);
              
              setTimeout(function() {
                var mainContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
                if (mainContainer) {
                  console.log('✅ VS2 MAIN VIDEO: Container secured and protected');
                  
                  mainContainer.style.position = 'absolute';
                  mainContainer.style.top = '0';
                  mainContainer.style.left = '0';
                  mainContainer.style.width = '100%';
                  mainContainer.style.height = '100%';
                  mainContainer.style.zIndex = '30';
                  mainContainer.style.overflow = 'hidden';
                  mainContainer.style.isolation = 'isolate';
                  mainContainer.style.contain = 'layout style paint size';
                  mainContainer.setAttribute('data-main-video', 'true');
                  mainContainer.setAttribute('data-video-id', '683ba3d1b87ae17c6e07e7db');
                  
                  var videoElements = document.querySelectorAll('video, iframe');
                  videoElements.forEach(function(element) {
                    var elementContainer = element.closest('[id*="vid"]');
                    if (elementContainer && elementContainer.id !== 'vid_683ba3d1b87ae17c6e07e7db') {
                      if (element.parentNode !== elementContainer) {
                        elementContainer.appendChild(element);
                        console.log('🔄 VS2 MAIN VIDEO: Moved video element back to correct container:', elementContainer.id);
                      }
                    }
                  });
                }
              }, 2000);
            };
            s.onerror = function() {
              console.error('❌ VS2 MAIN VIDEO: Failed to load VTurb player script');
            };
            document.head.appendChild(s);
          } catch (error) {
            console.error('❌ VS2 MAIN VIDEO: Error injecting VTurb script:', error);
          }
        })();
      `;
      
      document.head.appendChild(script);
      console.log('✅ VS2 MAIN VIDEO: VTurb script injected successfully');
    };

    const scriptTimeout = setTimeout(() => {
      injectVTurbScript();
      
      const checkVideoLoaded = () => {
        const videoContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
        if (videoContainer && (videoContainer.querySelector('video') || videoContainer.querySelector('iframe') || window.vslVideoLoaded)) {
          setIsVideoLoaded(true);
          console.log('✅ VS2 Video container has video element, marking as loaded');
        } else {
          console.log('⏳ VS2 Waiting for video to load...');
        }
      };
      
      checkVideoLoaded();
      const videoCheckInterval = setInterval(checkVideoLoaded, 1000);
      
      setTimeout(() => {
        clearInterval(videoCheckInterval);
        setIsVideoLoaded(true);
      }, 15000);
      
      setTimeout(() => {
        setupVideoTracking();
      }, 3000);
      
      return () => {
        clearInterval(videoCheckInterval);
      };
    }, 500);

    return () => {
      clearTimeout(scriptTimeout);
      const scriptToRemove = document.getElementById('scr_683ba3d1b87ae17c6e07e7db');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  useEffect(() => {
    (window as any).showRestOfContentAfterDelay = showRestOfContentAfterDelay;
    (window as any).showContentImmediately = showContentImmediately;
    (window as any).trackVideoPlay = trackVideoPlay;
    (window as any).trackVideoProgress = trackVideoProgress;
    (window as any).trackOfferClick = trackOfferClick;
    
    console.log('🧪 VS2 Funções de tracking expostas globalmente para debug');
    
    return () => {
      delete (window as any).showRestOfContentAfterDelay;
      delete (window as any).showContentImmediately;
      delete (window as any).trackVideoPlay;
      delete (window as any).trackVideoProgress;
      delete (window as any).trackOfferClick;
    };
  }, [trackVideoPlay, trackVideoProgress, trackOfferClick, showRestOfContentAfterDelay]);

  const setupVideoTracking = () => {
    let hasTrackedPlay = false;
    let trackingInterval: NodeJS.Timeout;
    let trackingAttempts = 0; 
    const maxAttempts = 15;

    const checkForPlayer = () => {
      try {
        trackingAttempts++;
        console.log(`🔍 VS2 Attempt ${trackingAttempts}/${maxAttempts} - Looking for MAIN video player...`);
        
        const playerContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
        
        if (!playerContainer) {
          console.error('❌ VS2 MAIN video container not found (vid_683ba3d1b87ae17c6e07e7db)');
          return;
        }
        
        console.log('✅ VS2 MAIN video container found:', playerContainer);

        if (window.vslVideoLoaded && !hasTrackedPlay) {
          hasTrackedPlay = true;
          trackVideoPlay();
          console.log('🎬 VS2 Video play tracked via global flag');
          clearInterval(trackingInterval);
          return;
        }
        
        if (window.smartplayer && window.smartplayer.instances) {
          const playerInstance = window.smartplayer.instances['683ba3d1b87ae17c6e07e7db'];
          if (playerInstance) {
            console.log('✅ VS2 VTurb player instance found');
            
            playerInstance.on('play', () => {
              if (!hasTrackedPlay) {
                hasTrackedPlay = true;
                trackVideoPlay();
                console.log('🎬 VS2 Video play tracked via smartplayer');
              }
            });

            playerInstance.on('timeupdate', (event: any) => {
              const currentTime = event.detail?.currentTime || event.currentTime;
              const duration = event.detail?.duration || event.duration;
              
              if (duration && currentTime) {
                trackVideoProgress(currentTime, duration);
              }
            });

            clearInterval(trackingInterval);
            console.log('🎯 VS2 Tracking configured via smartplayer');
            return;
          }
        }

        if (playerContainer) {
          const videos = playerContainer.querySelectorAll('video');
          const iframes = playerContainer.querySelectorAll('iframe');
          
          if (videos.length > 0 || iframes.length > 0) {
            console.log(`✅ VS2 Found ${videos.length} videos and ${iframes.length} iframes in container`);
            
            videos.forEach(video => {
              video.removeEventListener('play', handleVideoPlay);
              video.removeEventListener('timeupdate', handleTimeUpdate);
              video.addEventListener('play', handleVideoPlay);
              video.addEventListener('timeupdate', handleTimeUpdate);
              console.log('🎯 VS2 Event listeners added to video element');
            });
            
            iframes.forEach(iframe => {
              iframe.addEventListener('load', () => {
                console.log('🎬 VS2 Iframe loaded, tracking video play');
                if (!hasTrackedPlay) {
                  hasTrackedPlay = true;
                  trackVideoPlay();
                }
              });
            });

            clearInterval(trackingInterval);
            console.log('🎯 VS2 Tracking configured via video elements');
            return;
          }

          if (!hasTrackedPlay) {
            playerContainer.removeEventListener('click', handleContainerClick);
            playerContainer.addEventListener('click', handleContainerClick);
            console.log('🎯 VS2 Click listener added to container as fallback');
          }
        }

      } catch (error) {
        console.error('VS2 Error in checkForPlayer:', error);
      }
      
      if (trackingAttempts >= maxAttempts) {
        console.log(`⏰ VS2 Maximum attempts reached (${maxAttempts}). Stopping search for MAIN player.`);
        clearInterval(trackingInterval);
      }
    };

    const handleVideoPlay = () => {
      if (!hasTrackedPlay) {
        hasTrackedPlay = true;
        trackVideoPlay();
        console.log('🎬 VS2 Video play tracked via video element event');
      }
    };

    const handleTimeUpdate = (event: Event) => {
      const video = event.target as HTMLVideoElement;
      if (video.duration && video.currentTime) {
        trackVideoProgress(video.currentTime, video.duration);
      }
    };

    const handleContainerClick = () => {
      if (!hasTrackedPlay) {
        hasTrackedPlay = true;
        trackVideoPlay();
        console.log('🎬 VS2 Video play tracked via container click fallback');
      }
    };

    console.log('🚀 VS2 Starting MAIN video tracking setup...');
    checkForPlayer();
    
    try {
      trackingInterval = setInterval(() => {
        try {
          checkForPlayer();
        } catch (error) {
          console.error('VS2 Error in tracking interval:', error);
        }
      }, 2000);
    } catch (error) {
      console.error('VS2 Error setting up tracking interval:', error);
    }
    
    setTimeout(() => {
      try {
        if (trackingInterval) {
          clearInterval(trackingInterval);
          console.log('⏰ VS2 MAIN tracking timeout reached - stopping checks');
        }
      } catch (error) {
        console.error('VS2 Error clearing tracking interval:', error);
      }
    }, maxAttempts * 2000);
  };

  const closePopup = () => {
    // Popup disabled
  };

  const handleSecondaryPackageClick = (packageType: '1-bottle' | '3-bottle') => {
    console.log('🎯 VS2 Secondary package clicked:', packageType, '- Opening upsell popup');
    setSelectedPackage(packageType);
    setShowUpsellPopup(true);
  };

  const closeUpsellPopup = () => {
    console.log('🔄 VS2 Closing upsell popup');
    setShowUpsellPopup(false);
    setSelectedPackage('');
  };

  const getUpsellSavings = (packageType: string) => {
    if (packageType === '3-bottle') {
      return 102;
    } else if (packageType === '1-bottle') {
      return 240;
    }
    return 0;
  };

  const handlePurchase = (packageType: '1-bottle' | '3-bottle' | '6-bottle') => {
    trackOfferClick(packageType);
    
    const links = {
      '1-bottle': 'https://pagamento.paybluedrops.com/checkout/176654642:1',
      '3-bottle': 'https://pagamento.paybluedrops.com/checkout/176845818:1',
      '6-bottle': 'https://pagamento.paybluedrops.com/checkout/176849703:1'
    };
    
    const finalUrl = buildUrlWithParams(links[packageType]);
    
    console.log('🎯 VS2 Purchase URL with ALL params preserved:', finalUrl);
    
    window.location.href = finalUrl;
  };

  const handleUpsellAccept = () => {
    console.log('✅ VS2 Upsell accepted - redirecting to 6-bottle package');
    
    if (typeof window !== 'undefined' && (window as any).trackOfferClick) {
      (window as any).trackOfferClick(`upsell-accept-to-6bottle`);
    }
    
    handlePurchase('6-bottle');
    closeUpsellPopup();
  };

  const handleUpsellRefuse = () => {
    console.log('❌ VS2 Upsell refused - redirecting to original selection:', selectedPackage);
    
    if (selectedPackage && typeof window !== 'undefined' && (window as any).trackOfferClick) {
      (window as any).trackOfferClick(`${selectedPackage}-after-upsell-refuse`);
    }
    
    if (selectedPackage) {
      handlePurchase(selectedPackage as '1-bottle' | '3-bottle' | '6-bottle');
    }
    closeUpsellPopup();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 overflow-x-hidden">
      <BoltNavigation />

      {(isAdmin || isBoltEnvironment) && (
        <div className="fixed top-4 right-4 z-40">
          <div className={`${isAdmin ? 'bg-green-500' : 'bg-blue-500'} text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg`}>
            {isAdmin ? '👨‍💼 ADMIN MODE' : '🔧 BOLT MODE'}: All Content Visible
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:py-8 max-w-full">
        
        <Header />

        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
          
          <HeroSection />

          <VS2VideoSection />

          {(showRestOfContent || isAdmin || isBoltEnvironment) && (
            <ProductOffers 
              showPurchaseButton={showPurchaseButton}
              onPurchase={handlePurchase}
              onSecondaryPackageClick={handleSecondaryPackageClick}
            />
          )}
        </div>

        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
        <DoctorsSection />
        )}

        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
        <FactorySection />
        )}

        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
          <div className="mt-12 sm:mt-16 w-full max-w-lg mx-auto px-4 animate-fadeInUp animation-delay-1500">
            <div className="text-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl sm:rounded-2xl blur-sm opacity-75 animate-pulse animation-delay-300"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-xl sm:rounded-2xl blur-md opacity-50 animate-pulse animation-delay-800"></div>
                
              <button
                onClick={() => {
                  const purchaseSection = document.getElementById('six-bottle-package') || 
                                        document.querySelector('[data-purchase-section="true"]') ||
                                        document.querySelector('.purchase-button-main');
                  
                  if (purchaseSection) {
                    purchaseSection.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center',
                      inline: 'nearest'
                    });
                    
                    purchaseSection.style.transition = 'all 0.8s ease';
                    purchaseSection.style.transform = 'scale(1.02)';
                    purchaseSection.style.boxShadow = '0 0 40px rgba(16, 185, 129, 0.4)';
                    
                    setTimeout(() => {
                      purchaseSection.style.transform = 'scale(1)';
                      purchaseSection.style.boxShadow = '';
                    }, 3000);
                  }
                }}
                  className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl text-base sm:text-lg border-2 border-white/40 backdrop-blur-sm animate-pulse"
                style={{ touchAction: 'manipulation' }}
              >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl sm:rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">👨‍⚕️</span>
                    <span className="leading-tight text-center relative z-10">If doctors trust it, I trust it too — start my treatment now</span>
                </div>
              </button>
              </div>
              
              <div className="mt-4 space-y-1">
                <p className="text-blue-600 text-sm sm:text-base font-bold animate-pulse">
                  👆 Tap to start your doctor-approved treatment
                </p>
                <p className="text-indigo-600 text-xs sm:text-sm font-medium">
                  Clinically reviewed • MD verified • 180-day guarantee
                </p>
              </div>
            </div>
          </div>
        )}

        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
        <TestimonialsSection />
        )}

        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
          <div className="mt-12 sm:mt-16 w-full max-w-lg mx-auto px-4 animate-fadeInUp animation-delay-1300">
            <div className="text-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl sm:rounded-2xl blur-sm opacity-75 animate-pulse"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-green-300 to-emerald-400 rounded-xl sm:rounded-2xl blur-md opacity-50 animate-pulse animation-delay-500"></div>
                
              <button
                onClick={() => {
                  const purchaseSection = document.getElementById('six-bottle-package') || 
                                        document.querySelector('[data-purchase-section="true"]') ||
                                        document.querySelector('.purchase-button-main');
                  
                  if (purchaseSection) {
                    purchaseSection.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center',
                      inline: 'nearest'
                    });
                    
                    purchaseSection.style.transition = 'all 0.8s ease';
                    purchaseSection.style.transform = 'scale(1.02)';
                    purchaseSection.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.4)';
                    
                    setTimeout(() => {
                      purchaseSection.style.transform = 'scale(1)';
                      purchaseSection.style.boxShadow = '';
                    }, 3000);
                  }
                }}
                  className="relative w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl text-base sm:text-lg border-2 border-white/40 backdrop-blur-sm animate-pulse"
                style={{ touchAction: 'manipulation' }}
              >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl sm:rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🚀</span>
                    <span className="leading-tight relative z-10">I'm ready to be the next success story!</span>
                </div>
              </button>
              </div>
              
              <div className="mt-4 space-y-1">
                <p className="text-green-600 text-sm sm:text-base font-bold animate-pulse">
                  👆 Click here to secure your transformation
                </p>
                <p className="text-blue-600 text-xs sm:text-sm font-medium">
                  Join 50,000+ men who chose BlueDrops for lasting results
                </p>
              </div>
            </div>
          </div>
        )}

        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
        <NewsSection />
        )}

        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
        <GuaranteeSection />
        )}

        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
          <section 
            id="final-purchase-section"
            data-purchase-section="true"
            className="mt-16 sm:mt-20 w-full max-w-5xl mx-auto px-4 animate-fadeInUp animation-delay-2200"
          >
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 mb-4">
                <span className="block">Ready to Transform</span>
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
                  Your Life?
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-blue-700 font-semibold mb-2">
                Choose your BlueDrops package below
              </p>
              <p className="text-sm sm:text-base text-blue-600">
                Don't miss this opportunity to transform your health and confidence
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <ProductOffers 
                  showPurchaseButton={true}
                  onPurchase={handlePurchase}
                  onSecondaryPackageClick={handleSecondaryPackageClick}
                />
              </div>
            </div>

            <div className="text-center mt-8 sm:mt-12">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-200 shadow-lg max-w-2xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3">
                  🚀 Your Transformation Starts Today
                </h3>
                <p className="text-blue-700 text-sm sm:text-base leading-relaxed">
                  Join thousands of men who have already discovered the power of BlueDrops. 
                  With our 180-day guarantee, you have nothing to lose and everything to gain.
                </p>
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>

      <Modals 
        showPopup={false}
        showUpsellPopup={showUpsellPopup}
        selectedPackage={selectedPackage}
        onClosePopup={closePopup}
        onCloseUpsellPopup={closeUpsellPopup}
        onUpsellAccept={handleUpsellAccept}
        onUpsellRefuse={handleUpsellRefuse}
        getUpsellSavings={getUpsellSavings}
      />
    </div>
  );
}

declare global {
  interface Window {
    smartplayer?: {
      instances?: {
        [key: string]: {
          on: (event: string, callback: (event?: any) => void) => void;
          play?: () => void;
          pause?: () => void;
          getCurrentTime?: () => number;
          getDuration?: () => number;
        };
      };
    };
    vslVideoLoaded?: boolean;
    vslCustomElementsRegistered?: boolean;
    pixelId?: string;
  }
}

export default VS2Page;