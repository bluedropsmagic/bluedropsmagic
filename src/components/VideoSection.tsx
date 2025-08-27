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
    // Setup video tracking
    const setupVideoTracking = () => {
      let hasTrackedPlay = false;
      let trackingInterval: NodeJS.Timeout;
      let trackingAttempts = 0;
      const maxAttempts = 15;

      const checkForPlayer = () => {
        try {
          trackingAttempts++;
          console.log(`🔍 Attempt ${trackingAttempts}/${maxAttempts} - Looking for video player...`);
          
          const playerContainer = document.getElementById('vid-68ad36221f16ad3567243834');
          
          if (!playerContainer) {
            console.log('⏳ Video container not found yet');
            return;
          }
          
          // Method 1: Check for smartplayer instances
          if (window.smartplayer && window.smartplayer.instances) {
            const playerInstance = window.smartplayer.instances['68ad36221f16ad3567243834'];
            if (playerInstance) {
              console.log('✅ VTurb player instance found');
              
              // Track video play
              playerInstance.on('play', () => {
                if (!hasTrackedPlay) {
                  hasTrackedPlay = true;
                  trackVideoPlay();
                  console.log('🎬 Video play tracked via smartplayer');
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
              console.log('🎯 Tracking configured via smartplayer');
              return;
            }
          }

          // Method 2: Check for video elements in container
          const videos = playerContainer.querySelectorAll('video');
          const iframes = playerContainer.querySelectorAll('iframe');
          
          if (videos.length > 0 || iframes.length > 0) {
            console.log(`✅ Found ${videos.length} videos and ${iframes.length} iframes in container`);
            
            videos.forEach(video => {
              video.addEventListener('play', () => {
                if (!hasTrackedPlay) {
                  hasTrackedPlay = true;
                  trackVideoPlay();
                  console.log('🎬 Video play tracked via video element');
                }
              });
              
              video.addEventListener('timeupdate', () => {
                if (video.duration && video.currentTime) {
                  trackVideoProgress(video.currentTime, video.duration);
                }
              });
            });

            clearInterval(trackingInterval);
            console.log('🎯 Tracking configured via video elements');
            return;
          }

          // Method 3: Track clicks on video container as fallback
          if (!hasTrackedPlay) {
            playerContainer.addEventListener('click', () => {
              if (!hasTrackedPlay) {
                hasTrackedPlay = true;
                trackVideoPlay();
                console.log('🎬 Video play tracked via container click');
              }
            });
          }

        } catch (error) {
          console.error('Error in checkForPlayer:', error);
        }
        
        // Stop after max attempts
        if (trackingAttempts >= maxAttempts) {
          console.log(`⏰ Maximum attempts reached (${maxAttempts}). Stopping search for player.`);
          clearInterval(trackingInterval);
        }
      };

      // Start checking for player
      console.log('🚀 Starting video tracking setup...');
      checkForPlayer();
      
      trackingInterval = setInterval(checkForPlayer, 2000);
      
      // Stop checking after max attempts
      setTimeout(() => {
        clearInterval(trackingInterval);
        console.log('⏰ Tracking timeout reached - stopping checks');
      }, maxAttempts * 2000);
    };

    // Setup tracking after a short delay to ensure DOM is ready
    setTimeout(setupVideoTracking, 1000);

    // Mark video as loaded for global tracking
    window.vslVideoLoaded = true;

    // Cleanup on unmount
    return () => {
      window.vslVideoLoaded = false;
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
          {/* VTurb Smart Player */}
          <vturb-smartplayer 
            id="vid-68ad36221f16ad3567243834" 
            style={{
              display: 'block',
              margin: '0 auto',
              width: '100%',
              maxWidth: '400px'
            }}
          />
          
          {/* VTurb Script */}
          <script 
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
                var s=document.createElement("script"); 
                s.src="https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/68ad36221f16ad3567243834/v4/player.js";
                s.async=true;
                document.head.appendChild(s);
              `
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