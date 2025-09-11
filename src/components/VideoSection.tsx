import React, { useEffect, useState } from 'react';
import { Play, Volume2, AlertTriangle } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

export const VideoSection: React.FC = () => {
  const { trackVideoPlay, trackVideoProgress } = useAnalytics();
  const [isVideoCentered, setIsVideoCentered] = useState(false);

  useEffect(() => {
    // ✅ ULTRA-FAST LOADING: Inject VTurb script with performance optimizations
    console.log('🚀 ULTRA-FAST VIDEO LOADING: Injecting optimized VTurb script');
    
    // Clean up any existing VTurb scripts first
    const existingScripts = document.querySelectorAll('script[src*="68ad36221f16ad3567243834"], script[src*="68c23f8dbfe9104c306c78ea"]');
    existingScripts.forEach(script => {
      try {
        script.remove();
        console.log('🧹 Removed existing VTurb script for ultra-fast reload');
      } catch (error) {
        console.log('Script cleanup completed');
      }
    });

    // ✅ CRITICAL: Ensure optimized video container exists BEFORE injecting script
    const videoContainer = document.getElementById('vid-68c23f8dbfe9104c306c78ea');
    if (!videoContainer) {
      console.error('❌ Video container not found! Creating container...');
      
      // Create container if it doesn't exist
      const container = document.createElement('vturb-smartplayer');
      container.id = 'vid-68c23f8dbfe9104c306c78ea';
      container.style.cssText = 'display: block; margin: 0 auto; width: 100%; max-width: 400px; will-change: transform; contain: layout style paint;';
      
      const targetDiv = document.querySelector('.aspect-\\[9\\/16\\]') || document.querySelector('.video-container');
      if (targetDiv) {
        targetDiv.appendChild(container);
        console.log('✅ Optimized video container created and added to DOM');
      }
    }

    // ✅ ULTRA-FAST INJECTION: Performance-optimized loading
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true; // ✅ OPTIMIZED: Async for better performance
    script.defer = false;
    script.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/68c23f8dbfe9104c306c78ea/v4/player.js";
    
    // ✅ PERFORMANCE: Set high priority for faster loading
    script.setAttribute('importance', 'high');
    script.setAttribute('fetchpriority', 'high');
    
    script.onload = () => {
      console.log('🚀 VTurb script loaded with ULTRA-FAST optimization');
      window.vslVideoLoaded = true;
      
      // ✅ OPTIMIZED TRACKING SETUP: Faster initialization
      setTimeout(() => {
        setupVideoTracking();
        setupVideoCenteringOnClick();
      }, 250); // ✅ ULTRA-FAST: Reduced to 250ms
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load optimized VTurb script - retrying...');
      
      // ✅ FAST RETRY: Quick automatic retry on failure
      setTimeout(() => {
        const retryScript = document.createElement("script");
        retryScript.type = "text/javascript";
        retryScript.async = true;
        retryScript.src = script.src;
        retryScript.onload = () => {
          console.log('✅ VTurb script loaded on fast retry');
          window.vslVideoLoaded = true;
          setupVideoTracking();
        };
        document.head.appendChild(retryScript);
      }, 500); // ✅ FASTER RETRY: Reduced retry delay
    };
    
    // ✅ ULTRA-PRIORITY: Insert with performance optimizations
    document.head.insertBefore(script, document.head.firstChild);
    console.log('🚀 VTurb script injected with ULTRA-FAST optimizations');

    // Cleanup on unmount
    return () => {
      try {
        const scriptToRemove = document.querySelector('script[src*="68c23f8dbfe9104c306c78ea"]');
        if (scriptToRemove && scriptToRemove.parentNode) {
          scriptToRemove.parentNode.removeChild(scriptToRemove);
        }
        window.vslVideoLoaded = false;
      } catch (error) {
        console.log('Cleanup completed');
      }
    };
  }, []);

  const setupVideoCenteringOnClick = () => {
    let setupAttempts = 0;
    const maxSetupAttempts = 20;

    const setupClickHandler = () => {
      setupAttempts++;
      console.log(`🎯 Setting up video centering (attempt ${setupAttempts}/${maxSetupAttempts})`);

      // Method 1: Try video container
      const videoContainer = document.getElementById('vid-68c23f8dbfe9104c306c78ea');
      if (videoContainer) {
        videoContainer.addEventListener('click', handleVideoClick);
        console.log('✅ Video centering click handler added to container');
        return true;
      }

      // Method 2: Try video element directly
      const videoElement = document.querySelector('#vid-68c23f8dbfe9104c306c78ea video');
      if (videoElement) {
        videoElement.addEventListener('click', handleVideoClick);
        console.log('✅ Video centering click handler added to video element');
        return true;
      }

      return false;
    };

    // Try immediately
    if (setupClickHandler()) {
      return;
    }

    // Retry with polling
    const interval = setInterval(() => {
      if (setupClickHandler() || setupAttempts >= maxSetupAttempts) {
        clearInterval(interval);
        if (setupAttempts >= maxSetupAttempts) {
          console.log('⏰ Max attempts reached for video centering setup');
        }
      }
    }, 200);
  };

  const handleVideoClick = () => {
    console.log('🎬 Video clicked - centering and blocking scroll');
    setIsVideoCentered(true);
    
    // Block scroll
    document.body.style.overflow = 'hidden';
    
    // Center the video
    const videoContainer = document.getElementById('vid-68c23f8dbfe9104c306c78ea');
    if (videoContainer) {
      videoContainer.style.position = 'fixed';
      videoContainer.style.top = '50%';
      videoContainer.style.left = '50%';
      videoContainer.style.transform = 'translate(-50%, -50%)';
      videoContainer.style.zIndex = '9999';
      videoContainer.style.width = '90vw';
      videoContainer.style.maxWidth = '600px';
      videoContainer.style.height = 'auto';
      videoContainer.style.aspectRatio = '9/16';
      videoContainer.style.borderRadius = '1rem';
      videoContainer.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.3)';
      videoContainer.style.transition = 'all 0.5s ease';
    }
  };

  const handleCloseVideo = () => {
    console.log('❌ Closing centered video');
    setIsVideoCentered(false);
    
    // Restore scroll
    document.body.style.overflow = '';
    
    // Restore video position
    const videoContainer = document.getElementById('vid-68c23f8dbfe9104c306c78ea');
    if (videoContainer) {
      videoContainer.style.position = '';
      videoContainer.style.top = '';
      videoContainer.style.left = '';
      videoContainer.style.transform = '';
      videoContainer.style.zIndex = '';
      videoContainer.style.width = '';
      videoContainer.style.maxWidth = '';
      videoContainer.style.height = '';
      videoContainer.style.aspectRatio = '';
      videoContainer.style.borderRadius = '';
      videoContainer.style.boxShadow = '';
      videoContainer.style.transition = '';
    }
  };

  // Handle ESC key to close centered video
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVideoCentered) {
        handleCloseVideo();
      }
    };

    if (isVideoCentered) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVideoCentered]);

  const setupVideoTracking = () => {
    let hasTrackedPlay = false;
    let trackingAttempts = 0;
    const maxAttempts = 15; // ✅ INCREASED: More attempts for better reliability

    const checkForPlayer = () => {
      try {
        trackingAttempts++;
        console.log(`🔍 ULTRA-FAST CHECK: Looking for player (attempt ${trackingAttempts}/${maxAttempts})`);
        
        // Method 1: Check for smartplayer instances
        if (window.smartplayer && window.smartplayer.instances) {
          const playerInstance = window.smartplayer.instances['68c23f8dbfe9104c306c78ea'];
          if (playerInstance) {
            console.log('🚀 ULTRA-FAST SUCCESS: Smartplayer instance found and ready');
            
            // Track video play
            if (playerInstance.on) {
              playerInstance.on('play', () => {
                if (!hasTrackedPlay) {
                  hasTrackedPlay = true;
                  trackVideoPlay();
                  console.log('🎬 ULTRA-FAST TRACK: Video play tracked via smartplayer');
                }
              });

              // Track video progress
              playerInstance.on('timeupdate', (event: any) => {
                const currentTime = event.detail?.currentTime || event.currentTime || 0;
                const duration = event.detail?.duration || event.duration || 1;
                
                if (duration > 0 && currentTime > 0) {
                  trackVideoProgress(currentTime, duration);
                }
              });
            }
            
            return true; // Success
          }
        }

        // Method 2: Check for video elements
        const videoElement = document.querySelector('#vid-68c23f8dbfe9104c306c78ea video');
        if (videoElement) {
          console.log('🚀 ULTRA-FAST SUCCESS: Video element found and ready');
          
          videoElement.addEventListener('play', () => {
            if (!hasTrackedPlay) {
              hasTrackedPlay = true;
              trackVideoPlay();
              // Start timer from video play
              if (typeof window !== 'undefined' && (window as any).startTimerFromVideoPlay) {
                (window as any).startTimerFromVideoPlay();
              }
              console.log('🎬 ULTRA-FAST TRACK: Video play tracked via video element');
            }
          });
          
          videoElement.addEventListener('timeupdate', () => {
            const video = videoElement as HTMLVideoElement;
            if (video.duration && video.currentTime) {
              trackVideoProgress(video.currentTime, video.duration);
            }
          });
          
          return true; // Success
        }

        // Method 3: Check for player container and add click tracking
        const playerContainer = document.getElementById('vid-68c23f8dbfe9104c306c78ea');
        if (playerContainer) {
          console.log('🚀 ULTRA-FAST SUCCESS: Player container found, adding click tracking');
          
          const clickHandler = () => {
            if (!hasTrackedPlay) {
              hasTrackedPlay = true;
              trackVideoPlay();
              // Start timer from video play
              if (typeof window !== 'undefined' && (window as any).startTimerFromVideoPlay) {
                (window as any).startTimerFromVideoPlay();
              }
              console.log('🎬 ULTRA-FAST TRACK: Video play tracked via container click');
            }
          };
          
          playerContainer.addEventListener('click', clickHandler);
          
          return true; // Success
        }

        return false; // Not found yet
      } catch (error) {
        console.error('Error in checkForPlayer:', error);
        return false;
      }
    };

    // ✅ ULTRA-FAST CHECK: Try to find player immediately with no delay
    if (checkForPlayer()) {
      return;
    }

    // ✅ ULTRA-FAST POLLING: Check every 100ms for maximum responsiveness
    const interval = setInterval(() => {
      if (checkForPlayer() || trackingAttempts >= maxAttempts) {
        clearInterval(interval);
        if (trackingAttempts >= maxAttempts) {
          console.log('⏰ ULTRA-FAST LOADING: Max attempts reached for video tracking setup');
        }
      }
    }, 100); // ✅ ULTRA-FAST: Check every 100ms for maximum responsiveness
  };

  return (
    <div className="w-full mb-6 sm:mb-8 animate-fadeInUp animation-delay-600">
      <div className="flex items-center justify-center gap-2 text-blue-700 text-sm mb-4">
        <Play className="w-4 h-4" />
        <span className="font-medium tracking-wider">WATCH BELOW AND SEE HOW IT WORKS</span>
      </div>

      <div className="relative w-full max-w-sm mx-auto">
        <div className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
          {/* ✅ INSTANT LOADING: VTurb player with immediate availability */}
          <vturb-smartplayer 
            id="vid-68c23f8dbfe9104c306c78ea" 
            style={{
              display: 'block',
              margin: '0 auto',
              width: '100%',
              maxWidth: '400px',
              willChange: 'transform',
              contain: 'layout style paint'
            }}
          />
        </div>
        
        {/* Close button for centered video */}
        {isVideoCentered && (
          <button
            onClick={handleCloseVideo}
            className="fixed top-4 right-4 z-[10000] w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <span className="text-lg font-bold">×</span>
          </button>
        )}
      </div>

      {/* Important notices */}
      <div className="mt-4 space-y-3 max-w-sm mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 font-semibold text-sm">
              Please make sure your sound is on
            </span>
          </div>
          <p className="text-blue-600 text-xs">This video contains important audio information</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
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