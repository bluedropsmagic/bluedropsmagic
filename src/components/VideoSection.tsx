import React, { useEffect } from 'react';
import { Play, Volume2, AlertTriangle } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

declare global {
  interface Window {
    vslVideoLoaded?: boolean;
    smartplayer?: any;
  }
}

export const VideoSection: React.FC = () => {
  const { trackVideoPlay, trackVideoProgress } = useAnalytics();

  useEffect(() => {
    // Clean up any existing scripts first
    const existingScripts = document.querySelectorAll('script[src*="68ad36221f16ad3567243834"]');
    existingScripts.forEach(script => {
      try {
        script.remove();
      } catch (error) {
        console.log('Script already removed');
      }
    });

    // Load VTurb script
    const loadVTurbScript = () => {
      try {
        console.log('🎬 Loading VTurb script for main video');
        
        const script = document.createElement("script");
        script.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/68ad36221f16ad3567243834/v4/player.js";
        script.async = true;
        script.id = "vturb-main-script";
        
        script.onload = () => {
          console.log('✅ VTurb script loaded successfully');
          window.vslVideoLoaded = true;
          
          // Setup tracking after script loads
          setTimeout(() => {
            setupVideoTracking();
          }, 2000);
        };
        
        script.onerror = () => {
          console.error('❌ Failed to load VTurb script');
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading VTurb script:', error);
      }
    };

    // Setup video tracking
    const setupVideoTracking = () => {
      let hasTrackedPlay = false;
      let trackingAttempts = 0;
      const maxAttempts = 10;

      const checkForPlayer = () => {
        try {
          trackingAttempts++;
          console.log(`🔍 Checking for player (attempt ${trackingAttempts}/${maxAttempts})`);
          
          // Method 1: Check for smartplayer instances
          if (window.smartplayer && window.smartplayer.instances) {
            const playerInstance = window.smartplayer.instances['68ad36221f16ad3567243834'];
            if (playerInstance) {
              console.log('✅ Smartplayer instance found');
              
              // Track video play
              if (playerInstance.on) {
                playerInstance.on('play', () => {
                  if (!hasTrackedPlay) {
                    hasTrackedPlay = true;
                    trackVideoPlay();
                    console.log('🎬 Video play tracked via smartplayer');
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
            console.log('✅ Video element found');
            
            videoElement.addEventListener('play', () => {
              if (!hasTrackedPlay) {
                hasTrackedPlay = true;
                trackVideoPlay();
                console.log('🎬 Video play tracked via video element');
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
            console.log('✅ Player container found, adding click tracking');
            
            const clickHandler = () => {
              if (!hasTrackedPlay) {
                hasTrackedPlay = true;
                trackVideoPlay();
                console.log('🎬 Video play tracked via container click');
              }
            };
            
            playerContainer.addEventListener('click', clickHandler);
            
            // Also try to find any clickable elements inside
            const clickableElements = playerContainer.querySelectorAll('div, button, [role="button"]');
            clickableElements.forEach(element => {
              element.addEventListener('click', clickHandler);
            });
            
            return true; // Success
          }

          return false; // Not found yet
        } catch (error) {
          console.error('Error in checkForPlayer:', error);
          return false;
        }
      };

      // Try to find player immediately
      if (checkForPlayer()) {
        return;
      }

      // If not found, keep checking
      const interval = setInterval(() => {
        if (checkForPlayer() || trackingAttempts >= maxAttempts) {
          clearInterval(interval);
          if (trackingAttempts >= maxAttempts) {
            console.log('⏰ Max attempts reached for video tracking setup');
          }
        }
      }, 1000);
    };

    // Load script after component mounts
    setTimeout(loadVTurbScript, 500);

    // Cleanup on unmount
    return () => {
      try {
        const scriptToRemove = document.getElementById('vturb-main-script');
        if (scriptToRemove && scriptToRemove.parentNode) {
          scriptToRemove.parentNode.removeChild(scriptToRemove);
        }
        window.vslVideoLoaded = false;
      } catch (error) {
        console.log('Cleanup completed');
      }
    };
  }, [trackVideoPlay, trackVideoProgress]);

  return (
    <div className="w-full mb-6 sm:mb-8 animate-fadeInUp animation-delay-600">
      <div className="flex items-center justify-center gap-2 text-blue-700 text-sm mb-4">
        <Play className="w-4 h-4" />
        <span className="font-medium tracking-wider">WATCH BELOW AND SEE HOW IT WORKS</span>
      </div>

      <div className="relative w-full max-w-sm mx-auto">
        <div className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
          {/* VTurb Smart Player - Exactly as requested */}
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