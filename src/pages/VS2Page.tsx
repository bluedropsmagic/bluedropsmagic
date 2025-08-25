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
import { VideoSection } from '../components/VideoSection';
import { ProductOffers } from '../components/ProductOffers';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { DoctorsSection } from '../components/DoctorsSection';
import { FactorySection } from '../components/FactorySection';
import { NewsSection } from '../components/NewsSection';
import { GuaranteeSection } from '../components/GuaranteeSection';
import { Footer } from '../components/Footer';
import { Modals } from '../components/Modals';

function VS2Page() {
  const [showPurchaseButton, setShowPurchaseButton] = useState(false); // ✅ CHANGED: Start hidden
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // ✅ DISABLED: Popup removido
  const [showUpsellPopup, setShowUpsellPopup] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [showRestOfContent, setShowRestOfContent] = useState(false); // ✅ NEW: Control rest of content
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminDelayOverride, setAdminDelayOverride] = useState(false); // ✅ CHANGED: Default false
  const [isBoltEnvironment, setIsBoltEnvironment] = useState(false); // ✅ NEW: Detect Bolt environment

  // ✅ NEW: Function to show content immediately (for news CTA)
  const showContentImmediately = () => {
    console.log('📰 News CTA clicked - showing content immediately');
    setShowRestOfContent(true);
    setShowPurchaseButton(true);
    
    // Auto-scroll to purchase section after content loads with longer delay
    setTimeout(() => {
      scrollToSixBottleButton();
    }, 1500); // Increased delay to ensure content is fully rendered
  };

  // ✅ NEW: Detect Bolt environment
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
      console.log('🔧 Development environment detected - navigation buttons enabled');
    }
  }, []);

  // ✅ NEW: Load Hotjar for VS2 page
  useEffect(() => {
    // Only load Hotjar if we're on the VS2 page
    const path = window.location.pathname;
    const isVS2Page = path === '/vs2';
    
    if (isVS2Page) {
      // Remove any existing Hotjar scripts
      const existingHotjar = document.querySelectorAll('script[src*="hotjar"]');
      existingHotjar.forEach(script => script.remove());
      
      // Load Hotjar for VS2 page (same ID as main page)
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
      console.log('🔥 Hotjar VS2 page tracking loaded (ID: 6457423)');
    }
  }, []);

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

  // ✅ NEW: Function to show rest of content after 35:55
  const showRestOfContentAfterDelay = () => {
    console.log('🕐 35:55 reached - showing rest of content');
    setShowRestOfContent(true);
    setShowPurchaseButton(true);
    
    // ✅ NEW: Auto-scroll to 6-bottle purchase button after content loads
    setTimeout(() => {
      scrollToSixBottleButton();
    }, 1000); // Wait 1 second for content to render
  };

  const navigate = useNavigate();
  const location = useLocation();
  const { trackVideoPlay, trackVideoProgress, trackOfferClick } = useAnalytics();

  // Check if we're on the VS2 page
  const isVS2Page = location.pathname === '/vs2';

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

  // ✅ NEW: Check for admin override or time-based content reveal
  useEffect(() => {
    if (isAdmin || isBoltEnvironment) {
      console.log('👨‍💼 Admin logged in OR Bolt environment - showing purchase buttons and content');
      setShowRestOfContent(true);
      setShowPurchaseButton(true);
    }
  }, [isAdmin, isBoltEnvironment]);

  // ✅ NEW: Auto-trigger content reveal after 30 seconds
  useEffect(() => {
    // Skip timer in Bolt environment - show content immediately
    if (isBoltEnvironment) {
      console.log('🔧 Bolt environment - showing content immediately');
      setShowRestOfContent(true);
      setShowPurchaseButton(true);
      return;
    }
    
    console.log('🕐 Setting up 35:55 timer for content reveal');
    
    const timer = setTimeout(() => {
      console.log('🎯 35:55 elapsed - triggering content reveal');
      showRestOfContentAfterDelay();
    }, 2155000); // 35:55 = 2155 seconds = 2,155,000 milliseconds
    
    return () => {
      console.log('🧹 Cleaning up 35:55 timer');
      clearTimeout(timer);
    };
  }, [isBoltEnvironment]); // Run when Bolt environment changes

  // ✅ NEW: Function to scroll to 6-bottle purchase button
  const scrollToSixBottleButton = () => {
    try {
      console.log('📍 Starting scroll to 6-bottle button...');
      
      // Multiple selectors to find the purchase section
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
          console.log('📍 Found purchase element with selector:', selector);
          break;
        }
      }
      
      if (sixBottlePackage) {
        console.log('📍 Auto-scrolling to 6-bottle purchase button');
        
        // Smooth scroll to the 6-bottle package
        sixBottlePackage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Add a subtle highlight effect to draw attention
        const element = sixBottlePackage as HTMLElement;
        element.style.transition = 'all 0.8s ease';
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.4)';
        
        // Remove highlight after 4 seconds
        setTimeout(() => {
          element.style.transform = 'scale(1)';
          element.style.boxShadow = '';
        }, 4000);
        
      } else {
        console.log('⚠️ Purchase button not found for auto-scroll');
        console.log('🔍 Available elements:', document.querySelectorAll('[id*="bottle"], [class*="purchase"], [class*="checkout"]'));
      }
    } catch (error) {
      console.error('Error scrolling to 6-bottle purchase button:', error);
    }
  };

  useEffect(() => {
    // Initialize URL tracking parameters

    // ✅ FIXED: Use centralized tracking initialization
    initializeTracking();

    // ✅ NEW: Initialize RedTrack integration
    initializeRedTrack();
    
    // ✅ NEW: Initialize Facebook Pixel CartPanda tracking
    initializeFacebookPixelTracking();
    
    // ✅ CRITICAL: Inject VTurb script with DIFFERENT video ID for VS2
    const injectVTurbScript = () => {
      // Check if container exists first  
      const mainContainer = document.getElementById('vid_689e7c030f018d362b0e239d');
      if (!mainContainer) {
        console.error('❌ Main video container not found! Cannot inject VTurb script.');
        console.log('🔍 Available containers:', document.querySelectorAll('[id*="vid"]'));
        return;
      }
      
      console.log('✅ Main video container found:', mainContainer);

      // CRITICAL: Setup container isolation BEFORE script injection
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
      mainContainer.setAttribute('data-video-id', '689e7c030f018d362b0e239d');
      
      // CRITICAL: Clear any existing content to prevent conflicts
      const existingContent = mainContainer.innerHTML;
      if (existingContent && !existingContent.includes('thumb_689e7c030f018d362b0e239d')) {
        console.log('🧹 Clearing existing content from main video container');
        mainContainer.innerHTML = '';
      }

      // Remove any existing script first
      const existingScript = document.getElementById('scr_689e7c030f018d362b0e239d');
      if (existingScript) {
        existingScript.remove();
        console.log('🗑️ Removed existing VTurb script');
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'scr_689e7c030f018d362b0e239d';
      script.async = true;
      script.defer = true;
      
      // ✅ DIFFERENT: Use different video ID for VS2
      script.innerHTML = `
        (function() {
          try {
            // CRITICAL: Ensure main video container isolation
            console.log('🎬 MAIN VIDEO: Initializing container isolation for 689e7c030f018d362b0e239d');
            
            // CRITICAL: Mark this as the MAIN video to prevent conflicts
            window.mainVideoId = '689e7c030f018d362b0e239d';
            window.smartplayer = window.smartplayer || { instances: {} };
            
            // CRITICAL: Ensure target container exists and is isolated
            var targetContainer = document.getElementById('vid_689e7c030f018d362b0e239d');
            if (!targetContainer) {
              console.error('❌ CRITICAL: Main video container not found during script injection');
              return;
            }
            
            // CRITICAL: Force container isolation
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
            targetContainer.setAttribute('data-video-id', '689e7c030f018d362b0e239d');
            
            console.log('✅ MAIN VIDEO: Container isolation enforced');

            // FIXED: Check for existing scripts
            if (document.querySelector('script[src*="689e7c030f018d362b0e239d/player.js"]')) {
              console.log('🛡️ VTurb script already in DOM, skipping duplicate injection');
              window.vslVideoLoaded = true;
              return;
            }
            
            var s = document.createElement("script");
            // ✅ PLACEHOLDER: Replace with actual VS2 video ID
            s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/689e7c030f018d362b0e239d/player.js";
            s.async = true;
            s.onload = function() {
              console.log('✅ MAIN VIDEO: VTurb player script loaded successfully');
              window.vslVideoLoaded = true;
              
              // CRITICAL: Verify container still exists and is isolated after load
              var container = document.getElementById('vid_689e7c030f018d362b0e239d');
              if (!container) {
                console.error('❌ CRITICAL: Main video container disappeared after VTurb load!');
                return;
              }
              
              // CRITICAL: Re-enforce isolation after VTurb loads
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
              container.setAttribute('data-video-id', '689e7c030f018d362b0e239d');
              
              console.log('✅ MAIN VIDEO: Container isolation re-enforced after VTurb load');
              
              // AUTO-PLAY: Tentar dar play automaticamente no vídeo principal
              setTimeout(function() {
                try {
                  // Método 1: Via smartplayer instance
                  if (window.smartplayer && window.smartplayer.instances && window.smartplayer.instances['689e7c030f018d362b0e239d']) {
                    var player = window.smartplayer.instances['689e7c030f018d362b0e239d'];
                    if (player.play) {
                      player.play();
                      console.log('✅ MAIN VIDEO: Auto-play via smartplayer instance');
                    }
                  }
                  
                  // Método 2: Via elemento de vídeo direto
                  var videoElements = document.querySelectorAll('#vid_689e7c030f018d362b0e239d video');
                  videoElements.forEach(function(video) {
                    if (video.play) {
                      video.play().then(function() {
                        console.log('✅ MAIN VIDEO: Auto-play via video element');
                      }).catch(function(error) {
                        console.log('⚠️ MAIN VIDEO: Auto-play blocked by browser:', error);
                      });
                    }
                  });
                  
                  // Método 3: Simular clique no container (fallback)
                  var container = document.getElementById('vid_689e7c030f018d362b0e239d');
                  if (container) {
                    container.click();
                    console.log('✅ MAIN VIDEO: Auto-play via container click');
                  }
                } catch (error) {
                  console.log('⚠️ MAIN VIDEO: Auto-play failed:', error);
                }
              }, 3000); // Aguardar 3 segundos para o vídeo carregar
              
              // CRITICAL: Final container security check
              setTimeout(function() {
                var mainContainer = document.getElementById('vid_689e7c030f018d362b0e239d');
                if (vs2Container) {
                  console.log('✅ MAIN VIDEO: Container secured and protected');
                  
                  // CRITICAL: Final isolation enforcement
                  vs2Container.style.position = 'absolute';
                  vs2Container.style.top = '0';
                  vs2Container.style.left = '0';
                  vs2Container.style.width = '100%';
                  vs2Container.style.height = '100%';
                  vs2Container.style.zIndex = '30';
                  vs2Container.style.overflow = 'hidden';
                  vs2Container.style.isolation = 'isolate';
                  vs2Container.style.contain = 'layout style paint size';
                  vs2Container.setAttribute('data-main-video', 'true');
                  mainContainer.setAttribute('data-video-id', '689e7c030f018d362b0e239d');
                  
                  // CRITICAL: Prevent any video elements from escaping
                  var videoElements = document.querySelectorAll('video, iframe');
                  videoElements.forEach(function(element) {
                    var elementContainer = element.closest('[id*="vid"]');
                    if (elementContainer && elementContainer.id !== 'vid_689e7c030f018d362b0e239d') {
                      // This video belongs to another container, ensure it stays there
                      if (element.parentNode !== elementContainer) {
                        elementContainer.appendChild(element);
                        console.log('🔄 MAIN VIDEO: Moved video element back to correct container:', elementContainer.id);
                      }
                    }
                  });
                }
              }, 2000);
            };
            s.onerror = function() {
              console.error('❌ MAIN VIDEO: Failed to load VTurb player script');
            };
            document.head.appendChild(s);
          } catch (error) {
            console.error('❌ MAIN VIDEO: Error injecting VTurb script:', error);
          }
        })();
      `;
      
      document.head.appendChild(script);
      console.log('✅ MAIN VIDEO: VTurb script injected successfully');
    };

    // Delay script injection to improve initial page load
    const scriptTimeout = setTimeout(() => {
      injectVTurbScript();
      
      // FIXED: Check if video actually loaded
      const checkVideoLoaded = () => {
        const videoContainer = document.getElementById('vid_689e7c030f018d362b0e239d');
        if (videoContainer && (videoContainer.querySelector('video') || videoContainer.querySelector('iframe') || window.vslVideoLoaded)) {
          setIsVideoLoaded(true);
          console.log('✅ VS2 Video container has video element, marking as loaded');
        } else {
          console.log('⏳ Waiting for VS2 video to load...');
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
    }, 500); // Faster injection for immediate video load

    return () => {
      clearTimeout(scriptTimeout);
      const scriptToRemove = document.getElementById('scr_689e7c030f018d362b0e239d');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // ✅ NEW: Expose tracking functions globally for testing
  useEffect(() => {
    // ✅ NEW: Expose function to show rest of content after 35:55
    (window as any).showRestOfContentAfterDelay = showRestOfContentAfterDelay;
    
    // ✅ NEW: Expose function to show content immediately (for news CTA)
    (window as any).showContentImmediately = showContentImmediately;
    
    // Make tracking functions available globally for debugging
    (window as any).trackVideoPlay = trackVideoPlay;
    (window as any).trackVideoProgress = trackVideoProgress;
    (window as any).trackOfferClick = trackOfferClick;
    
    console.log('🧪 VS2: Funções de tracking expostas globalmente para debug:');
    console.log('- window.showRestOfContentAfterDelay()');
    console.log('- window.showContentImmediately()');
    console.log('- window.trackVideoPlay()');
    console.log('- window.trackVideoProgress(currentTime, duration)');
    console.log('- window.trackOfferClick(offerType)');
    
    return () => {
      // Cleanup
      delete (window as any).showRestOfContentAfterDelay;
      delete (window as any).showContentImmediately;
      delete (window as any).trackVideoPlay;
      delete (window as any).trackVideoProgress;
      delete (window as any).trackOfferClick;
    };
  }, [trackVideoPlay, trackVideoProgress, trackOfferClick, showRestOfContentAfterDelay]);

  const setupVideoTracking = () => {
    // Setup tracking for VTurb player with improved detection
    let hasTrackedPlay = false;
    let trackingInterval: NodeJS.Timeout;
    let trackingAttempts = 0; 
    const maxAttempts = 15; // ✅ FIXED: Reduzido para 15 tentativas = 30 segundos

    const checkForPlayer = () => {
      try {
        trackingAttempts++;
        console.log(`🔍 VS2: Attempt ${trackingAttempts}/${maxAttempts} - Looking for VS2 MAIN video player...`);
        
        // ✅ DIFFERENT: Look for VS2 video container
        const playerContainer = document.getElementById('vid_VS2_MAIN_VIDEO');
        
        if (!playerContainer) {
          console.error('❌ VS2 MAIN video container not found (vid_VS2_MAIN_VIDEO)');
          console.log('🔍 Available elements with "vid" in ID:', 
            Array.from(document.querySelectorAll('[id*="vid"]')).map(el => el.id)
          );
          return;
        }
        
        console.log('✅ VS2 MAIN video container found:', playerContainer);

        // ✅ FIXED: Force tracking if VS2 video is loaded
        if (window.vs2VideoLoaded && !hasTrackedPlay) {
          hasTrackedPlay = true;
          trackVideoPlay();
          console.log('🎬 VS2: Video play tracked via global flag');
          clearInterval(trackingInterval);
          return;
        }
        
        // Method 1: Check for smartplayer instances
        if (window.smartplayer && window.smartplayer.instances) {
          const playerInstance = window.smartplayer.instances['VS2_MAIN_VIDEO'];
          if (playerInstance) {
            console.log('✅ VS2: VTurb player instance found');
            
            // Track video play
            playerInstance.on('play', () => {
              if (!hasTrackedPlay) {
                hasTrackedPlay = true;
                trackVideoPlay();
                console.log('🎬 VS2: Video play tracked via smartplayer');
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
            console.log('🎯 VS2: Tracking configured via smartplayer');
            return;
          }
        }

        // Method 2: Check for video elements in container
        if (playerContainer) {
          const videos = playerContainer.querySelectorAll('video');
          const iframes = playerContainer.querySelectorAll('iframe');
          
          if (videos.length > 0 || iframes.length > 0) {
            console.log(`✅ VS2: Found ${videos.length} videos and ${iframes.length} iframes in container`);
            
            videos.forEach(video => {
              // Remove existing listeners to avoid duplicates
              video.removeEventListener('play', handleVideoPlay);
              video.removeEventListener('timeupdate', handleTimeUpdate);
              
              // Add new listeners
              video.addEventListener('play', handleVideoPlay);
              video.addEventListener('timeupdate', handleTimeUpdate);
              
              console.log('🎯 VS2: Event listeners added to video element');
            });
            
            // Also handle iframes
            iframes.forEach(iframe => {
              iframe.addEventListener('load', () => {
                console.log('🎬 VS2: Iframe loaded, tracking video play');
                if (!hasTrackedPlay) {
                  hasTrackedPlay = true;
                  trackVideoPlay();
                }
              });
            });

            clearInterval(trackingInterval);
            console.log('🎯 VS2: Tracking configured via video elements');
            return;
          }

          // Method 3: Track clicks on video container as fallback
          if (!hasTrackedPlay) {
            playerContainer.removeEventListener('click', handleContainerClick);
            playerContainer.addEventListener('click', handleContainerClick);
            console.log('🎯 VS2: Click listener added to container as fallback');
          }
        }

        // Method 4: Check for iframe (some VTurb implementations use iframe)
        const iframe = document.querySelector('iframe[src*="converteai.net"]');
        if (iframe) {
          console.log('✅ VS2: VTurb iframe encontrado');
          iframe.removeEventListener('load', handleIframeLoad);
          iframe.addEventListener('load', handleIframeLoad);
        }
        
        // ✅ NEW: Method 5 - Force tracking on any video interaction
        const allVideos = document.querySelectorAll('video');
        if (allVideos.length > 0) {
          console.log(`🎬 VS2: Encontrados ${allVideos.length} vídeos na página - configurando tracking global`);
          allVideos.forEach((video, index) => {
            video.addEventListener('play', () => {
              if (!hasTrackedPlay) {
                hasTrackedPlay = true;
                trackVideoPlay();
                console.log(`🎬 VS2: Video play tracked via vídeo global ${index + 1}`);
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
              console.log('🎬 VS2: Video play tracked via user interaction');
            }
          };
          
          playerContainer.addEventListener('click', trackInteraction);
          playerContainer.addEventListener('touchstart', trackInteraction);
          console.log('🎯 VS2: Interaction listeners adicionados');
        }

      } catch (error) {
        console.error('VS2: Error in checkForPlayer:', error);
      }
      
      // ✅ Stop after max attempts
      if (trackingAttempts >= maxAttempts) {
        console.log(`⏰ VS2: Maximum attempts reached (${maxAttempts}). Stopping search for VS2 MAIN player.`);
        clearInterval(trackingInterval);
      }
    };

    const handleVideoPlay = () => {
      if (!hasTrackedPlay) {
        hasTrackedPlay = true;
        trackVideoPlay();
        console.log('🎬 VS2: Video play tracked via video element event');
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
        console.log('🎬 VS2: Video play tracked via container click fallback');
      }
    };

    const handleIframeLoad = () => {
      console.log('✅ VS2: VTurb iframe carregado');
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
                console.log('🎬 VS2: Video play tracked via iframe message');
              }
              if (event.data.type === 'video_progress') {
                trackVideoProgress(event.data.currentTime, event.data.duration);
              }
            }
          });
        }
      } catch (error) {
        console.log('⚠️ VS2: Cross-origin iframe, usando fallback tracking');
      }
    };

    // Start checking for player immediately and then periodically
    console.log('🚀 VS2: Starting VS2 MAIN video tracking setup...');
    checkForPlayer();
    
    // ✅ FIXED: Use safer setInterval with try/catch
    try {
      trackingInterval = setInterval(() => {
        try {
          checkForPlayer();
        } catch (error) {
          console.error('VS2: Error in tracking interval:', error);
        }
      }, 2000);
    } catch (error) {
      console.error('VS2: Error setting up tracking interval:', error);
    }
    
    // Stop checking after max attempts to avoid infinite loops
    setTimeout(() => {
      try {
        if (trackingInterval) {
          clearInterval(trackingInterval);
          console.log('⏰ VS2: MAIN tracking timeout reached - stopping checks');
        }
      } catch (error) {
        console.error('VS2: Error clearing tracking interval:', error);
      }
    }, maxAttempts * 2000);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleSecondaryPackageClick = (packageType: '1-bottle' | '3-bottle') => {
    console.log('🎯 Secondary package clicked:', packageType, '- Opening upsell popup');
    setSelectedPackage(packageType);
    setShowUpsellPopup(true);
  };

  const closeUpsellPopup = () => {
    console.log('🔄 Closing upsell popup');
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
    
    // ✅ FIXED: Use centralized URL building to ensure ALL parameters are preserved
    const finalUrl = buildUrlWithParams(links[packageType]);
    
    console.log('🎯 VS2 Purchase URL with ALL params preserved:', finalUrl);
    
    // Open in same tab instead of new tab
    window.location.href = finalUrl;
  };

  const handleUpsellAccept = () => {
    console.log('✅ Upsell accepted - redirecting to 6-bottle package');
    
    // ✅ Track the upsell acceptance
    if (typeof window !== 'undefined' && (window as any).trackOfferClick) {
      (window as any).trackOfferClick(`upsell-accept-to-6bottle`);
    }
    
    handlePurchase('6-bottle');
    closeUpsellPopup();
  };

  const handleUpsellRefuse = () => {
    console.log('❌ Upsell refused - redirecting to original selection:', selectedPackage);
    
    // ✅ Track the original package purchase (what user originally wanted)
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
      {/* Bolt Navigation */}
      <BoltNavigation />

      {/* ✅ NEW: Admin DTC Button - For content override */}
      {(isAdmin || isBoltEnvironment) && (
        <div className="fixed top-4 right-4 z-40">
          <div className={`${isAdmin ? 'bg-green-500' : 'bg-blue-500'} text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg`}>
            {isAdmin ? '👨‍💼 ADMIN MODE' : '🔧 BOLT MODE'}: All Content Visible
          </div>
        </div>
      )}

      {/* Main container - Always visible */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:py-8 max-w-full">
        
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
          
          {/* Hero Section */}
          <HeroSection />

          {/* ✅ DIFFERENT: VS2 Video Section with different container ID */}
          <VS2VideoSection />

          {/* Product Offers - Only show after 35:55 or admin override */}
          {(showRestOfContent || isAdmin || isBoltEnvironment) && (
            <ProductOffers 
              showPurchaseButton={showPurchaseButton}
              onPurchase={handlePurchase}
              onSecondaryPackageClick={handleSecondaryPackageClick}
            />
          )}
        </div>

        {/* Doctors Section - Only show after 35:55 or admin override */}
        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
        <DoctorsSection />
        )}

        {/* Factory Section - Only show after 35:55 or admin override */}
        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
        <FactorySection />
        )}

        {/* Doctors Trust Button - Only show after 35:55 or admin override */}
        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
          <div className="mt-12 sm:mt-16 w-full max-w-lg mx-auto px-4 animate-fadeInUp animation-delay-1500">
            <div className="text-center">
              {/* Pulsing wrapper */}
              <div className="relative">
                {/* Pulsing ring effect */}
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
                    
                    // Add highlight effect
                    purchaseSection.style.transition = 'all 0.8s ease';
                    purchaseSection.style.transform = 'scale(1.02)';
                    purchaseSection.style.boxShadow = '0 0 40px rgba(16, 185, 129, 0.4)';
                    
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                      purchaseSection.style.transform = 'scale(1)';
                      purchaseSection.style.boxShadow = '';
                    }, 3000);
                  }
                }}
                  className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl text-base sm:text-lg border-2 border-white/40 backdrop-blur-sm animate-pulse"
                style={{ touchAction: 'manipulation' }}
              >
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl sm:rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">👨‍⚕️</span>
                    <span className="leading-tight text-center relative z-10">If doctors trust it, I trust it too — start my treatment now</span>
                </div>
              </button>
              </div>
              
              {/* Enhanced call-to-action text */}
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

        {/* Testimonials Section - Only show after 35:55 or admin override */}
        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
        <TestimonialsSection />
        )}

        {/* Success Story Button - Only show after 35:55 or admin override */}
        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
          <div className="mt-12 sm:mt-16 w-full max-w-lg mx-auto px-4 animate-fadeInUp animation-delay-1300">
            <div className="text-center">
              {/* Pulsing wrapper */}
              <div className="relative">
                {/* Pulsing ring effect */}
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
                    
                    // Add highlight effect
                    purchaseSection.style.transition = 'all 0.8s ease';
                    purchaseSection.style.transform = 'scale(1.02)';
                    purchaseSection.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.4)';
                    
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                      purchaseSection.style.transform = 'scale(1)';
                      purchaseSection.style.boxShadow = '';
                    }, 3000);
                  }
                }}
                  className="relative w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl text-base sm:text-lg border-2 border-white/40 backdrop-blur-sm animate-pulse"
                style={{ touchAction: 'manipulation' }}
              >
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl sm:rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🚀</span>
                    <span className="leading-tight relative z-10">I'm ready to be the next success story!</span>
                </div>
              </button>
              </div>
              
              {/* Enhanced call-to-action text */}
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
        {/* News Section - Only show after 35:55 or admin override */}
        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
        <NewsSection />
        )}

        {/* Guarantee Section - Only show after 35:55 or admin override */}
        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
        <GuaranteeSection />
        )}

        {/* Final purchase section - Only show after 35:55 or admin override */}
        {(showRestOfContent || isAdmin || isBoltEnvironment) && (
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
        )}

        {/* Footer */}
        <Footer />
      </div>

      {/* All Modals - Only show popup on VS2 page */}
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

// ✅ DIFFERENT: VS2 Video Section Component with different container ID
const VS2VideoSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let loadingTimeout: number;
    let checkInterval: number;

    const checkVideoLoad = () => {
      // ✅ DIFFERENT: Check for VS2 video container
      const videoContainer = document.getElementById('vid_VS2_MAIN_VIDEO');
      
      if (!videoContainer) {
        console.error('❌ VS2 video container not found (vid_VS2_MAIN_VIDEO)');
        console.log('🔍 Available elements with "vid" in ID:', 
          Array.from(document.querySelectorAll('[id*="vid"]')).map(el => el.id)
        );
        return;
      }
      
      console.log('✅ VS2 video container found:', videoContainer);

      // ✅ FIXED: Force tracking if video is loaded
      if (window.vs2VideoLoaded && !hasError) {
        setIsLoading(false);
        setHasError(false);
        console.log('🎬 VS2 Video marked as loaded');
        return;
      }
      
      // Check for video elements
      const hasVideo =
        videoContainer.querySelector('video') ||
        videoContainer.querySelector('iframe') ||
        videoContainer.querySelector('[data-vturb-player]') ||
        window.vs2VideoLoaded;
      
      console.log('🔍 VS2 Checking video load status:', hasVideo ? 'LOADED' : 'NOT LOADED');

      if (hasVideo) {
        setIsLoading(false);
        setHasError(false);
      }
    };

    checkVideoLoad();

    try {
      checkInterval = window.setInterval(checkVideoLoad, 1000);
      loadingTimeout = window.setTimeout(() => {
        window.clearInterval(checkInterval);
        if (isLoading) {
          console.log('⚠️ VS2 Video loading timeout reached - showing error state');
          setHasError(true);
          setIsLoading(false);
        }
      }, 15000);
      console.log('🎬 Starting VS2 video load check...');
    } catch (error) {
      console.error('Error setting up VS2 video load check:', error);
    }

    return () => {
      try {
        window.clearInterval(checkInterval);
        window.clearTimeout(loadingTimeout);
      } catch (error) {
        console.error('Error cleaning up VS2 video load check:', error);
      }
    };
  }, [isLoading]);

  const handleRetryLoad = () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);

    const existingScript = document.getElementById('scr_VS2_MAIN_VIDEO');
    if (existingScript) {
      existingScript.remove();
      console.log('🔄 Removed existing VS2 VTurb script');
    }

    window.vs2VideoLoaded = false;
    console.log('🔄 VS2 Retry #' + (retryCount + 1) + ': Attempting to reload VTurb script...');

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'scr_VS2_MAIN_VIDEO';
    script.async = true;
    script.innerHTML = `
      console.log('🔄 VS2 Retry #${retryCount + 1}: Executing VTurb script reload...');
      (function() {
        try {
          var s = document.createElement("script");
          s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/VS2_MAIN_VIDEO/player.js";
          s.async = true; 
          s.defer = true;
          
          console.log('🔄 VS2 Retry #${retryCount + 1}: Created new script element for VTurb');
          s.onerror = function(error) {
            console.error('Error reloading VS2 VTurb script:', error);
          };
          
          s.onload = function() {
            console.log('✅ VS2 Retry #${retryCount + 1}: VTurb player script loaded successfully');
            window.vs2VideoLoaded = true;
          };
          document.head.appendChild(s);
        } catch (error) {
          console.error('Error reloading VS2 VTurb script:', error);
        }
      })();
    `;
    document.head.appendChild(script);
    console.log('🔄 VS2 Retry #' + (retryCount + 1) + ': New VTurb script injected');

    if (retryCount >= 3) {
      console.log('🔄 VS2 Maximum retries reached, forcing page refresh');
      const scrollPos = window.scrollY;
      localStorage.setItem('scrollPosition', scrollPos.toString());
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  useEffect(() => {
    const savedScrollPos = localStorage.getItem('scrollPosition');
    if (savedScrollPos) {
      const scrollPos = parseInt(savedScrollPos);
      setTimeout(() => {
        window.scrollTo(0, scrollPos);
        localStorage.removeItem('scrollPosition');
      }, 500);
    }
  }, []);

  return (
    <div className="w-full mb-6 sm:mb-8 animate-fadeInUp animation-delay-600">
      {/* Watch instruction - moved from HeroSection */}
      <div className="flex items-center justify-center gap-2 text-blue-700 text-sm mb-4">
        <span className="text-lg">▶️</span>
        <span className="font-medium tracking-wider">WATCH BELOW AND SEE HOW IT WORKS</span>
      </div>
      
      <div className="relative w-full max-w-sm mx-auto">
        <div className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
          {/* ✅ DIFFERENT: VS2 video container with different ID */}
          <div
            id="vid_VS2_MAIN_VIDEO"
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
            data-video-id="VS2_MAIN_VIDEO"
          >
            {/* ✅ DIFFERENT: VS2 thumbnail and backdrop structure for VTurb */}
            <img
              id="thumb_VS2_MAIN_VIDEO"
              src="https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/VS2_MAIN_VIDEO/thumbnail.jpg"
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              alt="VS2 VSL Thumbnail"
              loading="eager"
              style={{
                touchAction: 'manipulation',
                zIndex: 1
              }}
            />
            <div
              id="backdrop_VS2_MAIN_VIDEO"
              className="absolute inset-0 w-full h-full cursor-pointer"
              style={{
                WebkitBackdropFilter: 'blur(5px)',
                backdropFilter: 'blur(5px)',
                zIndex: 2,
                touchAction: 'manipulation'
              }}
            />

            {(isLoading || !window.vs2VideoLoaded) && !hasError && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 15 }}>
                <div className="text-center text-white p-4">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-3 mx-auto"></div>
                  <p className="text-sm font-medium mb-1">Carregando VS2 vídeo...</p>
                  <p className="text-xs text-white/70">Aguarde um momento</p>
                  {isLoading && (
                    <button
                      onClick={handleRetryLoad}
                      className="mt-3 bg-blue-600/80 hover:bg-blue-700/80 text-white px-3 py-1.5 rounded text-xs transition-colors"
                    >
                      Tentar novamente
                    </button>
                  )}
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center" style={{ zIndex: 15 }}>
                <div className="text-center text-white p-6">
                  <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-sm font-medium mb-3">Erro ao carregar o VS2 vídeo</p>
                  <p className="text-xs text-white/70 mb-4">Tentativa {retryCount + 1} de 4</p>
                  <button
                    onClick={handleRetryLoad}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Tentar novamente
                  </button>
                  {retryCount >= 2 && (
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] w-full"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Recarregar página
                    </button>
                  )}
                </div>
              </div>
            )}

            {!window.vs2VideoLoaded && !hasError && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                style={{
                  touchAction: 'manipulation',
                  zIndex: 20
                }}
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-white/30 transition-colors">
                  <span className="text-4xl">▶️</span>
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
            <span className="text-lg">⚠️</span>
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
    vs2VideoLoaded?: boolean; // ✅ NEW: Separate flag for VS2 video
    vslCustomElementsRegistered?: boolean;
    pixelId?: string;
    vs2VideoId?: string; // ✅ NEW: VS2 video ID
  }
}

export default VS2Page;