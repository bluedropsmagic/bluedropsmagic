import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Volume2, AlertTriangle, RefreshCw } from 'lucide-react';

/** 🔧 Ajuste apenas estas duas constantes */
const ACCOUNT_ID = 'b792ccfe-b151-4538-84c6-42bb48a19ba4';
const PLAYER_ID  = '689e7c030f018d362b0e239d'; // o ID "limpo" sem 'vid-'

/** 🧠 Tipos para variáveis globais usadas no fluxo */
declare global {
  interface Window {
    vslVideoLoaded?: boolean;
    vslCustomElementsRegistered?: boolean;
    trackVideoPlay?: () => void;
  }
}

export const VideoSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError]   = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const timeoutRef  = useRef<number | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  /** IDs derivados, SEMPRE com hífen como no embed oficial */
  const DOM_IDS = useMemo(() => {
    const base = `vid-${PLAYER_ID}`;
    return {
      containerId: base,
      thumbId:     `thumb-${PLAYER_ID}`,
      backdropId:  `backdrop-${PLAYER_ID}`,
      scriptId:    `scr_${PLAYER_ID}`,
      scriptSrc:   `https://scripts.converteai.net/${ACCOUNT_ID}/players/${PLAYER_ID}/v4/player.js`,
      thumbSrc:    `https://images.converteai.net/${ACCOUNT_ID}/players/${PLAYER_ID}/thumbnail.jpg`,
    };
  }, []);

  /** 🔍 Checa se o player já foi inserido no container */
  const checkVideoLoad = () => {
    const el = document.getElementById(DOM_IDS.containerId);
    if (!el) return;

    const hasVideo =
      el.querySelector('video') ||
      el.querySelector('iframe') ||
      el.querySelector('[data-vturb-player]') ||
      window.vslVideoLoaded;

    if (hasVideo) {
      setIsLoading(false);
      setHasError(false);
      // limpa interval/observer quando carregar
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    }
  };

  /** ▶️ Injeta o script oficial do player (idempotente) */
  const ensurePlayerScript = () => {
    // evita duplicar
    if (document.querySelector(`script[src="${DOM_IDS.scriptSrc}"]`)) return;

    const s = document.createElement('script');
    s.src = DOM_IDS.scriptSrc;
    s.async = true;
    s.defer = true;

    s.onload = () => {
      window.vslVideoLoaded = true; // será confirmado pelo check
      if (window.trackVideoPlay) window.trackVideoPlay();
    };

    s.onerror = (err) => {
      console.error('Erro ao carregar script Vturb:', err);
    };

    document.head.appendChild(s);
  };

  useEffect(() => {
    // estado inicial
    setIsLoading(true);
    setHasError(false);

    // observa mudanças no container (quando o VTurb injeta o <video>/<iframe>)
    const container = document.getElementById(DOM_IDS.containerId);
    if (container && 'MutationObserver' in window) {
      observerRef.current = new MutationObserver(() => checkVideoLoad());
      observerRef.current.observe(container, { childList: true, subtree: true });
    }

    // checagem periódica (fallback)
    intervalRef.current = window.setInterval(checkVideoLoad, 800);

    // timeout de segurança
    timeoutRef.current = window.setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    }, 15000);

    // garante script do player
    ensurePlayerScript();
    // dispara uma checagem imediata
    checkVideoLoad();

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DOM_IDS.scriptSrc, DOM_IDS.containerId]); // roda uma vez para este player

  /** 🔁 Retry com script certo e mesmo PLAYER_ID */
  const handleRetryLoad = () => {
    setRetryCount((n) => n + 1);
    setIsLoading(true);
    setHasError(false);
    window.vslVideoLoaded = false;

    // remove script do player (se existir) para reinjetar
    const existing = document.querySelector(`script[src="${DOM_IDS.scriptSrc}"]`);
    if (existing) existing.remove();

    // reinjeta
    ensurePlayerScript();

    // reforça verificações
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(checkVideoLoad, 800);

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    }, 15000);

    // fallback hard refresh após 4 tentativas
    if (retryCount + 1 >= 4) {
      const scrollPos = window.scrollY;
      localStorage.setItem('scrollPosition', String(scrollPos));
      setTimeout(() => window.location.reload(), 800);
    }
  };

  // restaura posição de scroll (se recarregou)
  useEffect(() => {
    const saved = localStorage.getItem('scrollPosition');
    if (saved) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(saved, 10));
        localStorage.removeItem('scrollPosition');
      }, 400);
    }
  }, []);

  return (
    <div className="w-full mb-6 sm:mb-8 animate-fadeInUp animation-delay-600">
      <div className="flex items-center justify-center gap-2 text-blue-700 text-sm mb-4">
        <Play className="w-4 h-4" />
        <span className="font-medium tracking-wider">WATCH BELOW AND SEE HOW IT WORKS</span>
      </div>

      <div className="relative w-full max-w-sm mx-auto">
        <div className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
          {/* 🔑 Container principal com ID padronizado: vid-<PLAYER_ID> */}
          <div
            id={DOM_IDS.containerId}
            className="absolute inset-0 w-full h-full z-30 cursor-pointer main-video-container"
            style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              touchAction: 'manipulation',
              isolation: 'isolate',
              contain: 'layout style paint size',
              zIndex: 30,
              overflow: 'hidden',
              borderRadius: '1rem',
              backgroundColor: 'transparent'
            }}
            data-main-video="true"
            data-video-id={PLAYER_ID}
          >
            {/* 🖼️ Thumbnail padrão */}
            <img
              id={DOM_IDS.thumbId}
              src={DOM_IDS.thumbSrc}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              alt="VSL Thumbnail"
              loading="eager"
              style={{
                touchAction: 'manipulation',
                zIndex: 1
              }}
            />
            
            {/* 🌫️ Backdrop blur */}
            <div
              id={DOM_IDS.backdropId}
              className="absolute inset-0 w-full h-full cursor-pointer"
              style={{
                WebkitBackdropFilter: 'blur(5px)',
                backdropFilter: 'blur(5px)',
                zIndex: 2,
                touchAction: 'manipulation'
              }}
            />

            {/* 🔄 Loading state */}
            {(isLoading || !window.vslVideoLoaded) && !hasError && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 15 }}>
                <div className="text-center text-white p-4">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
                  <p className="text-sm font-medium mb-1">Loading video...</p>
                  <p className="text-xs text-white/70">Please wait</p>
                  {isLoading && (
                    <button
                      onClick={handleRetryLoad}
                      className="mt-3 bg-blue-600/80 hover:bg-blue-700/80 text-white px-3 py-1.5 rounded text-xs transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ❌ Error state */}
            {hasError && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center" style={{ zIndex: 15 }}>
                <div className="text-center text-white p-6">
                  <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-sm font-medium mb-3">Error loading video</p>
                  <p className="text-xs text-white/70 mb-4">Attempt {retryCount + 1} of 4</p>
                  <button
                    onClick={handleRetryLoad}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Retry
                  </button>
                  {retryCount >= 2 && (
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] w-full"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Reload page
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ▶️ Play button overlay */}
            {!window.vslVideoLoaded && !hasError && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                style={{
                  touchAction: 'manipulation',
                  zIndex: 20
                }}
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-white/30 transition-colors">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📢 Avisos importantes */}
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