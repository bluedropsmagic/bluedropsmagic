import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnalytics } from './hooks/useAnalytics';
import { initializeRedTrack } from './utils/redtrackIntegration';

// Import all components
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { VideoSection } from './components/VideoSection';
import { ProductOffers } from './components/ProductOffers';
import { TestimonialsSection } from './components/TestimonialsSection';
import { DoctorsSection } from './components/DoctorsSection';
import { NewsSection } from './components/NewsSection';
import { GuaranteeSection } from './components/GuaranteeSection';
import { Footer } from './components/Footer';
import { Modals } from './components/Modals';

function App() {
  const [showPurchaseButton, setShowPurchaseButton] = useState(true); // ✅ FIXED: Always show immediately
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // ✅ DISABLED: Popup removido
  const [showUpsellPopup, setShowUpsellPopup] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [contentDelay, setContentDelay] = useState(0); // ✅ FIXED: No delay
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminDelayOverride, setAdminDelayOverride] = useState(true); // ✅ FIXED: Always override delay

  // ✅ NEW: Prevent white page after errors
  useEffect(() => {
    // Global error handler to prevent white page
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('🚨 Global error caught:', event.error || event.message);
      
      // Prevent the error from causing a white screen
      event.preventDefault();
      
      // Log to console for debugging
      console.log('🛠️ Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      
      // Optional: Show a small error notification to the user
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'fixed';
      errorDiv.style.bottom = '10px';
      errorDiv.style.right = '10px';
      errorDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
      errorDiv.style.color = 'white';
      errorDiv.style.padding = '8px 12px';
      errorDiv.style.borderRadius = '4px';
      errorDiv.style.fontSize = '12px';
      errorDiv.style.zIndex = '9999';
      errorDiv.style.maxWidth = '300px';
      errorDiv.textContent = 'Ocorreu um erro, mas estamos trabalhando para corrigir.';
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 5000);
      
      document.body.appendChild(errorDiv);
      
      return true; // Prevents the error from bubbling up
    };
    
    // Add global error handler
    window.addEventListener('error', handleGlobalError);
    
    // Add unhandled rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', (event) => {
        event.preventDefault();
      });
    };
  }, []);

  // ✅ REMOVED: No more delay system

  const navigate = useNavigate();
  const location = useLocation();
  const { trackVideoPlay, trackVideoProgress, trackOfferClick } = useAnalytics();

  // Check if we're on the main page (show popup only on main page)
  const isMainPage = location.pathname === '/' || location.pathname === '/home';

  // ✅ FIXED: Check admin authentication on mount
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
          console.log('Admin authenticated - DTC button will be shown');
        } else {
          // Session expired
          sessionStorage.removeItem('admin_authenticated');
          sessionStorage.removeItem('admin_login_time');
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminAuth();
    
    // Check every 30 seconds for admin status changes
    const interval = setInterval(checkAdminAuth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // ✅ REMOVED: No more delay logic - content shows immediately

  useEffect(() => {
    // Initialize URL tracking parameters
    const initializeUrlTracking = () => {
      try {
        // Store URL parameters in sessionStorage for persistence
        const urlParams = new URLSearchParams(window.location.search);
        const trackingParams: Record<string, string> = {};
        
        // Common tracking parameters to preserve
        const trackingKeys = [
          'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
          'fbclid', 'gclid', 'ttclid', 'twclid', 'li_fat_id',
          'affiliate_id', 'sub_id', 'click_id', 'transaction_id'
        ];
        
        trackingKeys.forEach(key => {
          const value = urlParams.get(key);
          if (value) {
            trackingParams[key] = value;
          }
        });
        
        if (Object.keys(trackingParams).length > 0) {
          sessionStorage.setItem('tracking_params', JSON.stringify(trackingParams));
        }
        
        // Track page view with external pixels
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'PageView');
        }
        
        if (typeof window !== 'undefined' && (window as any).utmify) {
          (window as any).utmify('track', 'PageView');
        }
      } catch (error) {
        console.error('Error initializing URL tracking:', error);
      }
    };

    initializeUrlTracking();

    // ✅ NEW: Initialize RedTrack integration
    initializeRedTrack();
    
    // Inject VTurb script with proper error handling and optimization
    const injectVTurbScript = () => {
      // ✅ CRITICAL: Prevent multiple VTurb custom element registrations
      if (window.vslVideoLoaded && document.getElementById('vid_683ba3d1b87ae17c6e07e7db')?.querySelector('video')) {
        console.log('🛡️ VTurb script already loaded, skipping injection');
        return;
      }

      // Remove any existing script first
      const existingScript = document.getElementById('scr_683ba3d1b87ae17c6e07e7db');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'scr_683ba3d1b87ae17c6e07e7db';
      script.async = true;
      script.defer = true;
      
      // Optimized VTurb injection
      script.innerHTML = `
        (function() {
          try {
            // ✅ CRITICAL: Check if custom elements are already defined
            // Removed custom element check to allow video to load properly
            
            // ✅ CRITICAL: Initialize main video container isolation
            window.mainVideoId = '683ba3d1b87ae17c6e07e7db';
            window.smartplayer = window.smartplayer || { instances: {} };
            console.log('🎬 Initializing MAIN video player: 683ba3d1b87ae17c6e07e7db');

            // ✅ FIXED: Prevent multiple script injections
            if (document.querySelector('script[src*="683ba3d1b87ae17c6e07e7db/player.js"]')) {
              console.log('🛡️ VTurb script already in DOM, skipping duplicate injection');
              window.vslVideoLoaded = true;
              return;
            }
            
            var s = document.createElement("script");
            s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/683ba3d1b87ae17c6e07e7db/player.js";
            s.async = true;
            s.onload = function() {
              console.log('VTurb player script loaded successfully');
              window.vslVideoLoaded = true;
              
              // ✅ AUTO-PLAY: Tentar dar play automaticamente no vídeo principal
              setTimeout(function() {
                try {
                  // Método 1: Via smartplayer instance
                  if (window.smartplayer && window.smartplayer.instances && window.smartplayer.instances['683ba3d1b87ae17c6e07e7db']) {
                    var player = window.smartplayer.instances['683ba3d1b87ae17c6e07e7db'];
                    if (player.play) {
                      player.play();
                      console.log('✅ Auto-play via smartplayer instance');
                    }
                  }
                  
                  // Método 2: Via elemento de vídeo direto
                  var videoElements = document.querySelectorAll('#vid_683ba3d1b87ae17c6e07e7db video');
                  videoElements.forEach(function(video) {
                    if (video.play) {
                      video.play().then(function() {
                        console.log('✅ Auto-play via video element');
                      }).catch(function(error) {
                        console.log('⚠️ Auto-play blocked by browser:', error);
                      });
                    }
                  });
                  
                  // Método 3: Simular clique no container (fallback)
                  var container = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
                  if (container) {
                    container.click();
                    console.log('✅ Auto-play via container click');
                  }
                } catch (error) {
                  console.log('⚠️ Auto-play failed:', error);
                }
              }, 3000); // Aguardar 3 segundos para o vídeo carregar
              
              // ✅ CRITICAL: Ensure main video stays in its container
              setTimeout(function() {
                var mainContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
                if (mainContainer) {
                  console.log('✅ Main video container secured');
                  // Mark main video as protected
                  mainContainer.setAttribute('data-main-video', 'true');
                }
              }, 2000);
            };
            s.onerror = function() {
              console.error('Failed to load VTurb player script');
            };
            document.head.appendChild(s);
          } catch (error) {
            console.error('Error injecting VTurb script:', error);
          }
        })();
      `;
      
      document.head.appendChild(script);
    };

    // Delay script injection to improve initial page load
    const scriptTimeout = setTimeout(() => {
      injectVTurbScript();
      
      // ✅ FIXED: Check if video actually loaded
      const checkVideoLoaded = () => {
        const videoContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
        if (videoContainer && (videoContainer.querySelector('video') || window.vslVideoLoaded)) {
          setIsVideoLoaded(true);
          console.log('✅ Video container has video element, marking as loaded');
        } else {
          console.log('⏳ Waiting for video to load...');
        }
      };
      
      // Check immediately and then periodically
      checkVideoLoaded();
      const videoCheckInterval = setInterval(checkVideoLoaded, 1000);
      
      // Stop checking after 15 seconds
      setTimeout(() => {
        clearInterval(videoCheckInterval);
        setIsVideoLoaded(true); // Force to true even if not detected
      }, 15000);
      
      // Setup video tracking after script loads
      setTimeout(() => {
        setupVideoTracking();
      }, 3000);
      
      return () => {
        clearInterval(videoCheckInterval);
      };
    }, 500); // ✅ Faster injection for immediate video load

    return () => {
      clearTimeout(scriptTimeout);
      const scriptToRemove = document.getElementById('scr_683ba3d1b87ae17c6e07e7db');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // ✅ NEW: Expose tracking functions globally for testing
  useEffect(() => {
    // Make tracking functions available globally for debugging
    (window as any).trackVideoPlay = trackVideoPlay;
    (window as any).trackVideoProgress = trackVideoProgress;
    (window as any).trackOfferClick = trackOfferClick;
    
    console.log('🧪 Funções de tracking expostas globalmente para debug:');
    console.log('- window.trackVideoPlay()');
    console.log('- window.trackVideoProgress(currentTime, duration)');
    console.log('- window.trackOfferClick(offerType)');
    
    return () => {
      // Cleanup
      delete (window as any).trackVideoPlay;
      delete (window as any).trackVideoProgress;
      delete (window as any).trackOfferClick;
    };
  }, [trackVideoPlay, trackVideoProgress, trackOfferClick]);

  const setupVideoTracking = () => {
    // Setup tracking for VTurb player with improved detection
    let hasTrackedPlay = false;
    let trackingInterval: NodeJS.Timeout;
    let trackingAttempts = 0; 
    const maxAttempts = 15; // ✅ FIXED: Reduzido para 15 tentativas = 30 segundos

    const checkForPlayer = () => {
      try {
        trackingAttempts++;
        console.log(`🔍 Tentativa ${trackingAttempts}/${maxAttempts} - Procurando player de vídeo PRINCIPAL...`);
        
        // Multiple ways to detect VTurb player
        const playerContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
        
        if (!playerContainer) {
          console.log('❌ Container do vídeo PRINCIPAL não encontrado (vid_683ba3d1b87ae17c6e07e7db)');
          return;
        }
        
        console.log('✅ Container do vídeo PRINCIPAL encontrado:', playerContainer);

        // ✅ FIXED: Force tracking if video is loaded
        if (window.vslVideoLoaded && !hasTrackedPlay) {
          hasTrackedPlay = true;
          trackVideoPlay();
          console.log('🎬 Video play tracked via vslVideoLoaded flag');
          clearInterval(trackingInterval);
          return;
        }
        
        // Method 1: Check for smartplayer instances
        if (window.smartplayer && window.smartplayer.instances) {
          const playerInstance = window.smartplayer.instances['683ba3d1b87ae17c6e07e7db'];
          if (playerInstance) {
            console.log('✅ VTurb player instance encontrada');
            
            // Track video play
            playerInstance.on('play', () => {
              if (!hasTrackedPlay) {
                hasTrackedPlay = true;
                trackVideoPlay();
                console.log('🎬 Video play tracked via smartplayer instance');
              }
            });

            // Track video progress
            playerInstance.on('timeupdate', (event: any) => {
              const currentTime = event.detail?.currentTime || event.currentTime;
              const duration = event.detail?.duration || event.duration;
              
              if (duration && currentTime) {
                trackVideoProgress(currentTime, duration);
              }
            });

            clearInterval(trackingInterval);
            console.log('🎯 Tracking configurado via smartplayer instance');
            return;
          }
        }

        // Method 2: Check for video elements in container
        if (playerContainer) {
          const videos = playerContainer.querySelectorAll('video');
          if (videos.length > 0) {
            console.log(`✅ ${videos.length} elemento(s) de vídeo encontrado(s) no container`);
            
            videos.forEach(video => {
              // Remove existing listeners to avoid duplicates
              video.removeEventListener('play', handleVideoPlay);
              video.removeEventListener('timeupdate', handleTimeUpdate);
              
              // Add new listeners
              video.addEventListener('play', handleVideoPlay);
              video.addEventListener('timeupdate', handleTimeUpdate);
              
              console.log('🎯 Event listeners adicionados ao elemento de vídeo');
            });

            clearInterval(trackingInterval);
            console.log('🎯 Tracking configurado via elementos de vídeo');
            return;
          }

          // Method 3: Track clicks on video container as fallback
          if (!hasTrackedPlay) {
            playerContainer.removeEventListener('click', handleContainerClick);
            playerContainer.addEventListener('click', handleContainerClick);
            console.log('🎯 Click listener adicionado ao container como fallback');
          }
        }

        // Method 4: Check for iframe (some VTurb implementations use iframe)
        const iframe = document.querySelector('iframe[src*="converteai.net"]');
        if (iframe) {
          console.log('✅ VTurb iframe encontrado');
          iframe.removeEventListener('load', handleIframeLoad);
          iframe.addEventListener('load', handleIframeLoad);
        }
        
        // ✅ NEW: Method 5 - Force tracking on any video interaction
        const allVideos = document.querySelectorAll('video');
        if (allVideos.length > 0) {
          console.log(`🎬 Encontrados ${allVideos.length} vídeos na página - configurando tracking global`);
          allVideos.forEach((video, index) => {
            video.addEventListener('play', () => {
              if (!hasTrackedPlay) {
                hasTrackedPlay = true;
                trackVideoPlay();
                console.log(`🎬 Video play tracked via vídeo global ${index + 1}`);
              }
            });
            
            video.addEventListener('timeupdate', (event) => {
              const video = event.target as HTMLVideoElement;
              if (video.duration && video.currentTime) {
                trackVideoProgress(video.currentTime, video.duration);
              }
            });
          });
        }
        
        // ✅ NEW: Method 6 - Track any user interaction with video area
        if (playerContainer && !hasTrackedPlay) {
          const trackInteraction = () => {
            if (!hasTrackedPlay) {
              hasTrackedPlay = true;
              trackVideoPlay();
              console.log('🎬 Video play tracked via user interaction');
            }
          };
          
          playerContainer.addEventListener('click', trackInteraction);
          playerContainer.addEventListener('touchstart', trackInteraction);
          console.log('🎯 Interaction listeners adicionados');
        }

      } catch (error) {
        console.error('Error in checkForPlayer:', error);
      }
      
      // ✅ Stop after max attempts
      if (trackingAttempts >= maxAttempts) {
        console.log(`⏰ Máximo de tentativas atingido (${maxAttempts}). Parando busca por player PRINCIPAL.`);
        clearInterval(trackingInterval);
      }
    };

    const handleVideoPlay = () => {
      if (!hasTrackedPlay) {
        hasTrackedPlay = true;
        trackVideoPlay();
        console.log('🎬 Video play tracked via video element');
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
        console.log('🎬 Video play tracked via container click');
      }
    };

    const handleIframeLoad = () => {
      console.log('✅ VTurb iframe carregado');
      // Try to access iframe content if same-origin
      try {
        const iframe = document.querySelector('iframe[src*="converteai.net"]') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          // Setup postMessage listener for cross-origin communication
          window.addEventListener('message', (event) => {
            if (event.origin.includes('converteai.net')) {
              if (event.data.type === 'video_play' && !hasTrackedPlay) {
                hasTrackedPlay = true;
                trackVideoPlay();
                console.log('🎬 Video play tracked via iframe message');
              }
              if (event.data.type === 'video_progress') {
                trackVideoProgress(event.data.currentTime, event.data.duration);
              }
            }
          });
        }
      } catch (error) {
        console.log('⚠️ Cross-origin iframe, usando fallback tracking');
      }
    };

    // Start checking for player immediately and then periodically
    console.log('🚀 Iniciando setup de tracking de vídeo PRINCIPAL...');
    checkForPlayer();
    
    // ✅ FIXED: Use safer setInterval with try/catch
    try {
      trackingInterval = setInterval(() => {
        try {
          checkForPlayer();
        } catch (error) {
          console.error('Error in tracking interval:', error);
        }
      }, 2000);
    } catch (error) {
      console.error('Error setting up tracking interval:', error);
    }
    
    // Stop checking after max attempts to avoid infinite loops
    setTimeout(() => {
      try {
        if (trackingInterval) {
          clearInterval(trackingInterval);
          console.log('⏰ Timeout de tracking PRINCIPAL atingido - parando verificações');
        }
      } catch (error) {
        console.error('Error clearing tracking interval:', error);
      }
    }, maxAttempts * 2000);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleSecondaryPackageClick = (packageType: '1-bottle' | '3-bottle') => {
    setSelectedPackage(packageType);
    setShowUpsellPopup(true);
  };

  const closeUpsellPopup = () => {
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
    // Track the offer click
    trackOfferClick(packageType);
    
    const links = {
      '1-bottle': 'https://pagamento.paybluedrops.com/checkout/176654642:1',
      '3-bottle': 'https://pagamento.paybluedrops.com/checkout/176845818:1',
      '6-bottle': 'https://pagamento.paybluedrops.com/checkout/176849703:1'
    };
    
    // Open in same tab instead of new tab
    window.location.href = links[packageType];
  };

  const handleUpsellAccept = () => {
    handlePurchase('6-bottle');
    closeUpsellPopup();
  };

  const handleUpsellRefuse = () => {
    if (selectedPackage) {
      handlePurchase(selectedPackage as '1-bottle' | '3-bottle' | '6-bottle');
    }
    closeUpsellPopup();
  };

  // ✅ REMOVED: Admin delay override function - no longer needed

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 overflow-x-hidden">
      {/* ✅ REMOVED: Admin DTC Button - No longer needed */}

      {/* Main container - Always visible */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:py-8 max-w-full">
        
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
          
          {/* Hero Section */}
          <HeroSection />

          {/* Video Section */}
          <VideoSection />

          {/* Product Offers - Always show immediately */}
            <ProductOffers 
              showPurchaseButton={showPurchaseButton}
              onPurchase={handlePurchase}
              onSecondaryPackageClick={handleSecondaryPackageClick}
            />
        </div>

        {/* Testimonials Section - Always show immediately */}
        <TestimonialsSection />

        {/* Doctors Section - Always show immediately */}
        <DoctorsSection />

        {/* News Section - Always show immediately */}
        <NewsSection />

        {/* Guarantee Section - Always show immediately */}
        <GuaranteeSection />

        {/* Better organized final section with proper spacing and alignment - Always show immediately */}
          <section 
            id="final-purchase-section"
            data-purchase-section="true"
            className="mt-16 sm:mt-20 w-full max-w-5xl mx-auto px-4 animate-fadeInUp animation-delay-2200"
          >
            {/* Section Header - Centered and well-spaced */}
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

            {/* Centered Product Offers Container */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <ProductOffers 
                  showPurchaseButton={true}
                  onPurchase={handlePurchase}
                  onSecondaryPackageClick={handleSecondaryPackageClick}
                />
              </div>
            </div>

            {/* Final Call-to-Action */}
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

        {/* Footer */}
        <Footer />
      </div>

      {/* All Modals - Only show popup on main page */}
      <Modals 
        showPopup={false} // ✅ DISABLED: Popup completamente removido
        showUpsellPopup={showUpsellPopup}
        selectedPackage={selectedPackage}
        onClosePopup={closePopup}
        onCloseUpsellPopup={closeUpsellPopup}
        onUpsellAccept={handleUpsellAccept}
        onUpsellRefuse={handleUpsellRefuse}
        getUpsellSavings={getUpsellSavings}
      />

      {/* RedTrack integration is now handled by the utility module */}
    </div>
  );
}

// Enhanced global type for smartplayer with better error handling
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

export default App;