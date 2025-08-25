import React, { useEffect, useState } from 'react';
import { Play, Volume2, AlertTriangle, RefreshCw } from 'lucide-react';

export const VideoSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let loadingTimeout: number;
    let checkInterval: number;

    const checkVideoLoad = () => {
      const videoContainer = document.getElementById('vid_689e7c030f018d362b0e239d');
      if (videoContainer) {
        const hasVideo =
          videoContainer.querySelector('video') ||
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

    checkVideoLoad();

    try {
      checkInterval = window.setInterval(checkVideoLoad, 1000);
      loadingTimeout = window.setTimeout(() => {
        window.clearInterval(checkInterval);
        if (isLoading) {
          console.log('⚠️ Video loading timeout reached - showing error state');
          setHasError(true);
          setIsLoading(false);
        }
      }, 15000);
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
  }, [isLoading]);

  const handleRetryLoad = () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);

    const existingScript = document.getElementById('scr_683ba3d1b87ae17c6e07e7db');
    if (existingScript) {
      existingScript.remove();
      console.log('🔄 Removed existing VTurb script');
    }

    window.vslVideoLoaded = false;
    if (window.vslCustomElementsRegistered) {
      console.log('🔄 Retry #' + (retryCount + 1) + ': Resetting custom elements registration flag');
      window.vslCustomElementsRegistered = false;
    }
    console.log('🔄 Retry #' + (retryCount + 1) + ': Attempting to reload VTurb script...');

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'scr_683ba3d1b87ae17c6e07e7db';
    script.async = true;
    script.innerHTML = `
      console.log('🔄 Retry #${retryCount + 1}: Executing VTurb script reload...');
      (function() {
        try {
          if (window.customElements && window.customElements.get('vturb-bezel')) {
            console.log('⚠️ Custom elements already registered, attempting safe reload');
          }
          
          var s = document.createElement("script");
          s.src = "https://scripts.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/683ba3d1b87ae17c6e07e7db/player.js";
          s.async = true; 
          s.defer = true;
          
          console.log('🔄 Retry #${retryCount + 1}: Created new script element for VTurb');
          s.onerror = function(error) {
            console.error('Error reloading VTurb script:', error);
            if (error && error.toString().includes('vturb-bezel')) {
              console.log('🔄 Custom element error on reload, video may still work');
              window.vslVideoLoaded = true;
            }
          };
          
          s.onload = function() {
            console.log('✅ Retry #${retryCount + 1}: VTurb player script loaded successfully');
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

    if (retryCount >= 3) {
      console.log('🔄 Maximum retries reached, forcing page refresh');
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
        <Play className="w-4 h-4" />
        <span className="font-medium tracking-wider">WATCH BELOW AND SEE HOW IT WORKS</span>
      </div>
      
      <div className="relative w-full max-w-sm mx-auto">
        <div className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
          {/* ✅ CRITICAL: Main video container with maximum isolation - Dynamic ID based on page */}
          <div
            id={window.location.pathname === '/vs2' ? 'vid_VS2_MAIN_VIDEO' : 'vid_689e7c030f018d362b0e239d'}
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
            data-video-id={window.location.pathname === '/vs2' ? 'VS2_MAIN_VIDEO' : '689e7c030f018d362b0e239d'}
          >
            {/* ✅ CRITICAL: Thumbnail and backdrop structure for VTurb - Dynamic based on page */}
            <img
              id={window.location.pathname === '/vs2' ? 'thumb_VS2_MAIN_VIDEO' : 'thumb_689e7c030f018d362b0e239d'}
              src={window.location.pathname === '/vs2' 
                ? 'https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/VS2_MAIN_VIDEO/thumbnail.jpg'
                : 'https://images.converteai.net/b792ccfe-b151-4538-84c6-42bb48a19ba4/players/689e7c030f018d362b0e239d/thumbnail.jpg'
              }
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              alt="VSL Thumbnail"
              loading="eager"
              style={{
                touchAction: 'manipulation',
                zIndex: 1
              }}
            />
            <div
              id={window.location.pathname === '/vs2' ? 'backdrop_VS2_MAIN_VIDEO' : 'backdrop_689e7c030f018d362b0e239d'}
              className="absolute inset-0 w-full h-full cursor-pointer"
              style={{
                WebkitBackdropFilter: 'blur(5px)',
                backdropFilter: 'blur(5px)',
                zIndex: 2,
                touchAction: 'manipulation'
              }}
            />

            {(isLoading || !(window.location.pathname === '/vs2' ? window.vs2VideoLoaded : window.vslVideoLoaded)) && !hasError && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 15 }}>
                <div className="text-center text-white p-4">
                  <RefreshCw className="w-12 h-12 text-white/80 animate-spin mb-3 mx-auto" />
                  <p className="text-sm font-medium mb-1">
                    {window.location.pathname === '/vs2' ? 'Carregando VS2 vídeo...' : 'Carregando vídeo principal...'}
                  </p>
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
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-sm font-medium mb-3">Erro ao carregar o vídeo</p>
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

            {!(window.location.pathname === '/vs2' ? window.vs2VideoLoaded : window.vslVideoLoaded) && !hasError && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                style={{
                  touchAction: 'manipulation',
                  zIndex: 20
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
