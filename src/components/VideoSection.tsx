import React, { useEffect, useState } from 'react';
import { Play, Volume2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

// Fallback video container ID
const MAIN_VIDEO_ID = '683ba3d1b87ae17c6e07e7db';

export const VideoSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [videoContainerId, setVideoContainerId] = useState<string>(MAIN_VIDEO_ID);

  useEffect(() => {
    // Check if video is loaded
    let loadingTimeout: number;
    let checkInterval: number;
    
    const checkVideoLoad = () => {
      // Try to find the video container
      const videoContainer = document.getElementById(`vid_${videoContainerId}`);
      
      // If container not found, try to find any VTurb container as fallback
      if (!videoContainer) {
        const allContainers = document.querySelectorAll('[id^="vid_"]');
        if (allContainers.length > 0) {
          const foundId = allContainers[0].id.replace('vid_', '');
          console.log(`🔍 Main video container not found, using alternative: ${foundId}`);
          setVideoContainerId(foundId);
          return;
        }
      }
      
      if (videoContainer) {
        // Check for actual video content
        const hasVideo = videoContainer.querySelector('video') || 
                         videoContainer.querySelector('iframe') ||
                         videoContainer.querySelector('[data-vturb-player]') ||
                         window.vslVideoLoaded;
        console.log('🔍 Checking video load status:', hasVideo ? 'LOADED' : 'NOT LOADED');
        
        if (hasVideo) {
          setIsLoading(false);
          setHasError(false);
        }
      }
    };

    // Check immediately
    checkVideoLoad();

    try {
      // Check periodically for up to 15 seconds
      checkInterval = window.setInterval(checkVideoLoad, 1000);
      
      // Longer timeout for video loading
      loadingTimeout = window.setTimeout(() => {
        window.clearInterval(checkInterval);
        if (isLoading) {
          console.log('⚠️ Video loading timeout reached - showing error state');
          setHasError(true);
          setIsLoading(false);
        }
      }, 20000);
      
      console.log('🎬 Starting video load check...');
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
  }, [isLoading, videoContainerId]);

  // ✅ UPDATED: Better retry logic with more logging
  const handleRetryLoad = () => {
    // Increment retry count
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);
    
    // Force reload the VTurb script
    const existingScript = document.getElementById(`scr_${videoContainerId}`);
    if (existingScript) {
      existingScript.remove();
      console.log('🔄 Removed existing VTurb script');
    }

    // ✅ CRITICAL: Reset custom element registration flag
    window.vslVideoLoaded = false;
    if (window.vslCustomElementsRegistered) {
      console.log('🔄 Retry #' + (retryCount + 1) + ': Resetting custom elements registration flag');
      window.vslCustomElementsRegistered = false;
    }
    console.log('🔄 Retry #' + (retryCount + 1) + ': Attempting to reload VTurb script...');

    // Re-inject script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = `scr_${videoContainerId}`;
    script.async = true;
    script.innerHTML = `
      console.log('🔄 Retry #${retryCount + 1}: Executing VTurb script reload...');
      (function() {
        try {
          // ✅ CRITICAL: Check if custom elements are already defined before proceeding
          if (window.customElements && window.customElements.get('vturb-bezel')) {
            console.log('⚠️ Custom elements already registered, attempting safe reload');
          }
          
          var s = document.createElement("script");
          s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoContainerId}/player.js";
          s.async = true; 
          s.defer = true;
          
          console.log('🔄 Retry #${retryCount + 1}: Created new script element for VTurb');
          // ✅ CRITICAL: Handle custom element errors gracefully
          s.onerror = function(error) {
            console.error('Error reloading VTurb script:', error);
            // Don't completely fail if it's just a custom element issue
            if (error && error.toString().includes('vturb-bezel')) {
              console.log('🔄 Custom element error on reload, video may still work');
              window.vslVideoLoaded = true; // Mark as loaded anyway
            }
          };
          
          s.onload = function() {
            console.log('✅ Retry #${retryCount + 1}: VTurb player script loaded successfully');
            // ✅ CRITICAL: Track video play when script loads
            if (window.trackVideoPlay) window.trackVideoPlay();
            window.vslVideoLoaded = true;
          };
          document.head.appendChild(s);
        } catch (error) {
          console.error('Error reloading VTurb script:', error);
        }
      })();
    `;
    document.head.appendChild(script);
    console.log('🔄 Retry #' + (retryCount + 1) + ': New VTurb script injected');
    
    // ✅ FIXED: Force reload after 3 retries
    if (retryCount >= 3) {
      console.log('🔄 Maximum retries reached, trying alternative approach');
      
      // Try to create a completely new video container
      const videoContainer = document.getElementById(`vid_${videoContainerId}`);
      if (videoContainer) {
        // Clear the container
        videoContainer.innerHTML = '';
        
        // Create a new container with a different structure
        const newContainer = document.createElement('div');
        newContainer.style.width = '100%';
        newContainer.style.height = '100%';
        newContainer.style.position = 'relative';
        
        // Add a placeholder image
        const placeholderImg = document.createElement('img');
        placeholderImg.src = `https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoContainerId}/thumbnail.jpg`;
        placeholderImg.style.width = '100%';
        placeholderImg.style.height = '100%';
        placeholderImg.style.objectFit = 'cover';
        newContainer.appendChild(placeholderImg);
        
        // Add a play button overlay
        const playButton = document.createElement('div');
        playButton.style.position = 'absolute';
        playButton.style.top = '50%';
        playButton.style.left = '50%';
        playButton.style.transform = 'translate(-50%, -50%)';
        playButton.style.width = '80px';
        playButton.style.height = '80px';
        playButton.style.borderRadius = '50%';
        playButton.style.backgroundColor = 'rgba(0,0,0,0.7)';
        playButton.style.display = 'flex';
        playButton.style.alignItems = 'center';
        playButton.style.justifyContent = 'center';
        playButton.style.cursor = 'pointer';
        
        // Add play icon
        playButton.innerHTML = `
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        `;
        
        // Add click handler to play button
        playButton.onclick = () => {
          // Force reload page when clicked
          const scrollPos = window.scrollY;
          localStorage.setItem('scrollPosition', scrollPos.toString());
          window.location.reload();
        };
        
        newContainer.appendChild(playButton);
        videoContainer.appendChild(newContainer);
        
        // Hide loading and error states
        setIsLoading(false);
        setHasError(false);
      } else {
        // Last resort: force page reload
        console.log('🔄 Video container not found, forcing page refresh');
        const scrollPos = window.scrollY;
        localStorage.setItem('scrollPosition', scrollPos.toString());
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  };
  
  // ✅ FIXED: Restore scroll position after reload
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
      {/* Fixed aspect ratio container for mobile VSL */}
      <div className="relative w-full max-w-sm mx-auto">
        <div className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
          {/* ✅ FIXED: VTurb Video Container - Ensure container exists */}
          <div 
            id={`vid_${videoContainerId}`}
            className="absolute inset-0 w-full h-full z-30 cursor-pointer"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              touchAction: 'manipulation',
              isolation: 'isolate', // ✅ NEW: Isolate container
              contain: 'layout style paint' // ✅ NEW: Contain layout
            }} 
            onClick={() => {
              console.log('🎬 Video container clicked');
            }}
          >
            {/* ✅ FIXED: Ensure thumbnail and backdrop are always present */}
            <img 
              id={`thumb_${videoContainerId}`}
              src={`https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/${videoContainerId}/thumbnail.jpg`}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              alt="VSL Thumbnail"
              loading="eager"
              style={{ 
                touchAction: 'manipulation',
                zIndex: 1
              }}
            />
            
            {/* ✅ FIXED: Backdrop with proper z-index */}
            <div 
              id={`backdrop_${videoContainerId}`}
              className="absolute inset-0 w-full h-full cursor-pointer"
              style={{
                WebkitBackdropFilter: 'blur(5px)',
                backdropFilter: 'blur(5px)',
                zIndex: 2,
                touchAction: 'manipulation'
              }}
            />
            
            {/* ✅ NEW: VTurb content will be injected here with higher z-index */}
            <div 
              id={`vturb-content-${videoContainerId}`}
              className="absolute inset-0 w-full h-full"
              style={{
                zIndex: 10,
                isolation: 'isolate'
              }}
            >
              {/* VTurb player will be injected here */}
            </div>

            {/* Loading Overlay */}
            {(isLoading || !window.vslVideoLoaded) && !hasError && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 15 }}>
                <div className="text-center text-white p-4">
                  <RefreshCw className="w-12 h-12 text-white/80 animate-spin mb-3 mx-auto" />
                  <p className="text-sm font-medium mb-1">Carregando vídeo principal... ({retryCount}/4)</p>
                  <p className="text-xs text-white/70">Aguarde um momento</p>
                  
                  {/* ✅ FIXED: Add manual retry button after 5 seconds */}
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

            {/* Error Overlay */}
            {hasError && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center" style={{ zIndex: 15 }}>
                <div className="text-center text-white p-6">
                  <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-sm font-medium mb-3">Erro ao carregar o vídeo (ID: {videoContainerId})</p>
                  <p className="text-xs text-white/70 mb-4">Tentativa {retryCount + 1} de 4</p>
                  <button
                    onClick={handleRetryLoad}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px]"
                    style={{ touchAction: 'manipulation' }}
                  > 
                    Tentar novamente
                  </button>
                  
                  {/* ✅ FIXED: Add force reload button after 2 retries */}
                  {retryCount >= 2 && (
                    <button
                      onClick={() => {
                        // Save scroll position
                        const scrollPos = window.scrollY;
                        localStorage.setItem('scrollPosition', scrollPos.toString());
                        // Force reload
                        window.location.reload();
                      }}
                      className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] w-full"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Recarregar página
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ✅ FIXED: Play Button Overlay */}
            {!window.vslVideoLoaded && !hasError && (
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              style={{
                touchAction: 'manipulation',
                zIndex: 20
              }}
              onClick={() => {
                console.log('🎬 Play button clicked');
                const videoContainer = document.getElementById(`vid_${videoContainerId}`);
                if (videoContainer) {
                  videoContainer.click();
                }
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

      {/* ✅ NEW: Sound and Video Warning Section */}
      <div className="mt-4 space-y-3 max-w-sm mx-auto">
        {/* Sound Warning */}
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

        {/* Video Takedown Warning */}
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
  );
};