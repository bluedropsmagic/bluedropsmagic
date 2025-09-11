import React, { useEffect } from 'react';
import { Play, Volume2, AlertTriangle } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { DELAY_CONFIG } from '../config/delayConfig';

export const VideoSection: React.FC = () => {
  const { trackVideoPlay, trackVideoProgress } = useAnalytics();

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
      
      // ✅ OPTIMIZED TRACKING SETUP + VTurb Delay Integration
      setTimeout(() => {
        setupVideoTracking();
        setupVTurbDelay();
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
          setupVTurbDelay();
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

  const setupVTurbDelay = () => {
    let delayAttempts = 0;
    const maxDelayAttempts = 20;

    const setupDelay = () => {
      try {
        delayAttempts++;
        console.log(`🎬 VTurb Delay Setup: Attempt ${delayAttempts}/${maxDelayAttempts}`);
        
        // Check for smartplayer instance
        if (window.smartplayer && window.smartplayer.instances) {
          const playerInstance = window.smartplayer.instances['68c23f8dbfe9104c306c78ea'];
          if (playerInstance && playerInstance.displayHiddenElements) {
            console.log('🎯 VTurb Player found - setting up delay integration');
            
            // ✅ CRITICAL: Setup delay using VTurb's native method
            DELAY_CONFIG.DELAYS.forEach(({ seconds, selector }) => {
              console.log(`🕐 Setting up VTurb delay: ${seconds}s for selector: ${selector}`);
              
              playerInstance.displayHiddenElements(seconds, [selector], {
                persist: DELAY_CONFIG.USE_STORAGE || false,
                callback: () => {
                  console.log(`🎯 VTurb delay completed for ${selector} after ${seconds}s`);
                  
                  // ✅ CRITICAL: Trigger React state update
                  if (typeof window !== 'undefined' && (window as any).showRestOfContentAfterDelay) {
                    (window as any).showRestOfContentAfterDelay();
                  }
                }
              });
            });
            
            console.log('✅ VTurb delay integration setup complete');
            return true; // Success
          }
        }
        
        return false; // Not ready yet
      } catch (error) {
        console.error('Error in VTurb delay setup:', error);
        return false;
      }
    };

    // ✅ Try to setup delay immediately
    if (setupDelay()) {
      return;
    }

    // ✅ Poll for player readiness
    const delayInterval = setInterval(() => {
      if (setupDelay() || delayAttempts >= maxDelayAttempts) {
        clearInterval(delayInterval);
        if (delayAttempts >= maxDelayAttempts) {
          console.log('⏰ Max attempts reached for VTurb delay setup - falling back to manual trigger');
          
          // ✅ FALLBACK: Manual delay if VTurb method fails
          setTimeout(() => {
            console.log('🎯 Fallback delay completed after 30:37');
            if (typeof window !== 'undefined' && (window as any).showRestOfContentAfterDelay) {
              (window as any).showRestOfContentAfterDelay();
            }
          }, 1837000); // 30:37 in milliseconds
        }
      }
    }, 200); // Check every 200ms
  };
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
        <div 
          id="vturb-video-container"
          className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black relative"
        >
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