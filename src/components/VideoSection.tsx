import React, { useEffect } from 'react';
import { Play, Volume2, AlertTriangle } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

export const VideoSection: React.FC = () => {
  const { trackVideoPlay, trackVideoProgress } = useAnalytics();

  useEffect(() => {
    // ✅ INSTANT LOADING: Inject NEW VTurb script immediately with high priority
    console.log('🚀 INSTANT VIDEO LOADING: Injecting NEW VTurb script with highest priority');
    
    // Clean up any existing VTurb scripts first (both old and new)
    const existingScripts = document.querySelectorAll('script[src*="68bf9911b38480b5c834d7fa"], script[src*="68ad36221f16ad3567243834"]');
    existingScripts.forEach(script => {
      try {
        script.remove();
        console.log('🧹 Removed existing VTurb script for instant reload');
      } catch (error) {
        console.log('Script cleanup completed');
      }
    });

    // ✅ CRITICAL: Ensure NEW video container exists BEFORE injecting script
    const videoContainer = document.getElementById('vid-68ad36221f16ad3567243834');
    if (!videoContainer) {
      console.error('❌ Video container not found! Creating container...');
      
      // Create container if it doesn't exist
      const container = document.createElement('vturb-smartplayer');
      container.id = 'vid-68ad36221f16ad3567243834';
      container.style.cssText = 'display: block; margin: 0 auto; width: 100%; max-width: 400px;';
      
      const targetDiv = document.querySelector('.aspect-\\[9\\/16\\]') || document.querySelector('.video-container');
      if (targetDiv) {
        targetDiv.appendChild(container);
        console.log('✅ Video container created and added to DOM');
      }
    }

    // ✅ INSTANT INJECTION: No delays, maximum priority
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = false; // ✅ CHANGED: Synchronous loading for instant availability
    script.defer = false; // ✅ CHANGED: No defer for immediate execution
    script.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/68ad36221f16ad3567243834/v4/player.js";
    
    // ✅ PRELOAD: Add preload hints for faster loading
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = script.src;
    preloadLink.as = 'script';
    document.head.appendChild(preloadLink);
    
    script.onload = () => {
      console.log('🚀 VTurb script loaded INSTANTLY');
      window.vslVideoLoaded = true;
      
      // ✅ IMMEDIATE TRACKING SETUP: No delays
      setTimeout(() => {
        setupVideoTracking();
      }, 500); // ✅ REDUCED: From 2000ms to 500ms
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load VTurb script - retrying...');
      
      // ✅ RETRY MECHANISM: Automatic retry on failure
      setTimeout(() => {
        const retryScript = document.createElement("script");
        retryScript.type = "text/javascript";
        retryScript.async = false;
        retryScript.src = script.src;
        retryScript.onload = () => {
          console.log('✅ VTurb script loaded on retry');
          window.vslVideoLoaded = true;
          setupVideoTracking();
        };
        document.head.appendChild(retryScript);
      }, 1000);
    };
    
    // ✅ HIGHEST PRIORITY: Insert at the beginning of head for immediate loading
    document.head.insertBefore(script, document.head.firstChild);
    console.log('🚀 VTurb script injected with HIGHEST PRIORITY for instant loading');

    // Cleanup on unmount
    return () => {
      try {
        const scriptToRemove = document.querySelector('script[src*="68ad36221f16ad3567243834"]');
        if (scriptToRemove && scriptToRemove.parentNode) {
          scriptToRemove.parentNode.removeChild(scriptToRemove);
        }
        
        // ✅ CLEANUP: Remove preload link as well
        const preloadToRemove = document.querySelector('link[href*="68ad36221f16ad3567243834"]');
        if (preloadToRemove && preloadToRemove.parentNode) {
          preloadToRemove.parentNode.removeChild(preloadToRemove);
        }
        
        window.vslVideoLoaded = false;
      } catch (error) {
        console.log('Cleanup completed');
      }
    };
  }, []);

  const setupVideoTracking = () => {
    let hasTrackedPlay = false;
    let trackingAttempts = 0;
    const maxAttempts = 15; // ✅ INCREASED: More attempts for better reliability

    const checkForPlayer = () => {
      try {
        trackingAttempts++;
        console.log(`🔍 INSTANT CHECK: Looking for player (attempt ${trackingAttempts}/${maxAttempts})`);
        
        // Method 1: Check for smartplayer instances
        if (window.smartplayer && window.smartplayer.instances) {
          const playerInstance = window.smartplayer.instances['68ad36221f16ad3567243834'];
          if (playerInstance) {
            console.log('🚀 INSTANT SUCCESS: Smartplayer instance found and ready');
            
            // Track video play
            if (playerInstance.on) {
              playerInstance.on('play', () => {
                if (!hasTrackedPlay) {
                  hasTrackedPlay = true;
                  trackVideoPlay();
                  console.log('🎬 INSTANT TRACK: Video play tracked via smartplayer');
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
        const videoElement = document.querySelector('#vid-68ad36221f16ad3567243834 video');
        if (videoElement) {
          console.log('🚀 INSTANT SUCCESS: Video element found and ready');
          
          videoElement.addEventListener('play', () => {
            if (!hasTrackedPlay) {
              hasTrackedPlay = true;
              trackVideoPlay();
              console.log('🎬 INSTANT TRACK: Video play tracked via video element');
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
        const playerContainer = document.getElementById('vid-68ad36221f16ad3567243834');
        if (playerContainer) {
          console.log('🚀 INSTANT SUCCESS: Player container found, adding click tracking');
          
          const clickHandler = () => {
            if (!hasTrackedPlay) {
              hasTrackedPlay = true;
              trackVideoPlay();
              console.log('🎬 INSTANT TRACK: Video play tracked via container click');
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

    // ✅ INSTANT CHECK: Try to find player immediately with no delay
    if (checkForPlayer()) {
      return;
    }

    // ✅ FASTER POLLING: Check every 200ms instead of 1000ms for instant response
    const interval = setInterval(() => {
      if (checkForPlayer() || trackingAttempts >= maxAttempts) {
        clearInterval(interval);
        if (trackingAttempts >= maxAttempts) {
          console.log('⏰ INSTANT LOADING: Max attempts reached for video tracking setup');
        }
      }
    }, 200); // ✅ FASTER: Check every 200ms for instant response
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
            id="vid-68ad36221f16ad3567243834" 
            style={{
              display: 'block',
              margin: '0 auto',
              width: '100%',
              maxWidth: '400px'
            }}
          />
        </div>
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