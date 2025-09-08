import React, { useEffect } from 'react';
import { Play, Volume2, AlertTriangle } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

export const VideoSection: React.FC = () => {
  const { trackVideoPlay, trackVideoProgress } = useAnalytics();

  useEffect(() => {
    // Clean up any existing VTurb scripts first
    const existingScripts = document.querySelectorAll('script[src*="68be64aeb290a2408c246963"]');
    existingScripts.forEach(script => {
      try {
        script.remove();
        console.log('🧹 Removed existing VTurb script');
      } catch (error) {
        console.log('Script cleanup completed');
      }
    });

    // Inject the new VTurb script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/68be64aeb290a2408c246963/v4/player.js";
    
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
    console.log('🎬 VTurb script injected');

    // Cleanup on unmount
    return () => {
      try {
        const scriptToRemove = document.querySelector('script[src*="68be64aeb290a2408c246963"]');
        if (scriptToRemove && scriptToRemove.parentNode) {
          scriptToRemove.parentNode.removeChild(scriptToRemove);
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
    const maxAttempts = 10;

    const checkForPlayer = () => {
      try {
        trackingAttempts++;
        console.log(`🔍 Checking for new player (attempt ${trackingAttempts}/${maxAttempts})`);
        
        // Method 1: Check for smartplayer instances
        if (window.smartplayer && window.smartplayer.instances) {
          const playerInstance = window.smartplayer.instances['68be64aeb290a2408c246963'];
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
        const videoElement = document.querySelector('#vid-68be64aeb290a2408c246963 video');
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
        const playerContainer = document.getElementById('vid-68be64aeb290a2408c246963');
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

  return (
    <div className="w-full mb-6 sm:mb-8 animate-fadeInUp animation-delay-600">
      <div className="flex items-center justify-center gap-2 text-blue-700 text-sm mb-4">
        <Play className="w-4 h-4" />
        <span className="font-medium tracking-wider">WATCH BELOW AND SEE HOW IT WORKS</span>
      </div>

      <div className="relative w-full max-w-sm mx-auto">
        <div className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
          {/* Exact VTurb code as you specified */}
          <vturb-smartplayer 
            id="vid-68be64aeb290a2408c246963" 
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