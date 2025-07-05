// 🔁 Geração automática com suporte a RedTrack CID

import React, { useState, useEffect } from 'react';

interface CheckoutButtonsProps {
  page: 'main' | 'upsell' | 'downsell';
  variant?: '1-bottle' | '3-bottle' | '6-bottle' | 'dws1' | 'dws2' | 'dw3';
  onButtonClick?: (url: string, action: string) => void;
}

interface ButtonConfig {
  text: string;
  url: string;
  className: string;
  action: string;
}

export const CheckoutButtons: React.FC<CheckoutButtonsProps> = ({
  page,
  variant,
  onButtonClick
}) => {
  const [currentCid, setCurrentCid] = useState<string | null>(null);

  // Detectar CID automaticamente da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    setCurrentCid(cid);
    
    if (cid) {
      console.log('🎯 RedTrack CID applied:', cid);
    }
  }, []);

  // Função para adicionar CID à URL
  const addCidToUrl = (url: string): string => {
    if (!currentCid || url.includes('cid=')) {
      return url;
    }
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cid=${encodeURIComponent(currentCid)}`;
  };

  // Configurações dos botões baseadas no contexto
  const getButtonConfigs = (): ButtonConfig[] => {
    if (page === 'main') {
      return [
        {
          text: 'CLAIM OFFER NOW',
          url: 'https://pagamento.paybluedrops.com/checkout/176849703:1',
          className: 'w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg border-2 border-white/40',
          action: '6-bottle-main'
        },
        {
          text: 'BUY 3 NOW',
          url: 'https://pagamento.paybluedrops.com/checkout/176845818:1',
          className: 'w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-sm border border-white/30',
          action: '3-bottle-main'
        },
        {
          text: 'BUY 1 NOW',
          url: 'https://pagamento.paybluedrops.com/checkout/176654642:1',
          className: 'w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-sm border border-white/30',
          action: '1-bottle-main'
        }
      ];
    }

    if (page === 'upsell' && variant) {
      const upsellUrls = {
        '1-bottle': {
          accept: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=yes',
          reject: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/mWYd5nGjgx?accepted=no'
        },
        '3-bottle': {
          accept: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/qJjMdRwYNl?accepted=yes',
          reject: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/qJjMdRwYNl?accepted=no'
        },
        '6-bottle': {
          accept: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=yes',
          reject: 'https://pagamento.paybluedrops.com/ex-ocu/next-offer/46jLdobjp3?accepted=no'
        }
      };

      const urls = upsellUrls[variant];
      return [
        {
          text: 'YES — COMPLETE MY 9‑MONTH TREATMENT',
          url: urls.accept,
          className: 'w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-lg border-2 border-white/40',
          action: `upsell-${variant}-accept`
        },
        {
          text: 'No thanks — I\'ll throw away my progress and risk permanent failure',
          url: urls.reject,
          className: 'w-full bg-gradient-to-br from-gray-400/80 to-gray-600/80 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-xl text-white hover:bg-gray-500/80 transition-all duration-300 text-sm font-medium',
          action: `upsell-${variant}-reject`
        }
      ];
    }

    if (page === 'downsell' && variant) {
      const downsellUrls = {
        'dws1': {
          accept: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws1?accepted=yes',
          reject: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws1?accepted=no'
        },
        'dws2': {
          accept: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=yes',
          reject: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=no'
        },
        'dw3': {
          accept: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=yes',
          reject: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=no'
        }
      };

      const urls = downsellUrls[variant as keyof typeof downsellUrls];
      return [
        {
          text: 'SIM, EU ACEITO ESTA OFERTA FINAL',
          url: urls.accept,
          className: 'w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors border-2 border-gray-400',
          action: `downsell-${variant}-accept`
        },
        {
          text: '❌ No thanks — I\'ll pass on this opportunity',
          url: urls.reject,
          className: 'w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors border border-gray-300',
          action: `downsell-${variant}-reject`
        }
      ];
    }

    return [];
  };

  // Handler para clique nos botões
  const handleButtonClick = (buttonConfig: ButtonConfig) => {
    const urlWithCid = addCidToUrl(buttonConfig.url);
    
    // Log para debug
    if (currentCid) {
      console.log('🎯 RedTrack CID applied:', currentCid);
      console.log('🔗 Button redirect with CID:', buttonConfig.url, '->', urlWithCid);
    }
    
    // Callback opcional
    if (onButtonClick) {
      onButtonClick(urlWithCid, buttonConfig.action);
    }
    
    // Redirecionar
    window.location.href = urlWithCid;
  };

  const buttonConfigs = getButtonConfigs();

  if (buttonConfigs.length === 0) {
    return (
      <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="font-semibold">Configuração inválida</p>
        <p className="text-sm">Page: {page}, Variant: {variant || 'none'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      {/* Debug info para desenvolvimento */}
      {(window.location.hostname.includes('localhost') || 
        window.location.hostname.includes('stackblitz') ||
        window.location.hostname.includes('bolt.new')) && currentCid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
          <p className="text-green-700 text-sm font-medium">
            🎯 RedTrack CID: <code className="bg-green-100 px-2 py-1 rounded">{currentCid}</code>
          </p>
          <p className="text-green-600 text-xs mt-1">
            Todos os botões serão automaticamente atualizados com este CID
          </p>
        </div>
      )}

      {/* Botões */}
      {buttonConfigs.map((buttonConfig, index) => (
        <button
          key={index}
          onClick={() => handleButtonClick(buttonConfig)}
          className={buttonConfig.className}
          style={{ touchAction: 'manipulation' }}
        >
          {buttonConfig.text}
        </button>
      ))}

      {/* Info adicional para contexto de upsell/downsell */}
      {(page === 'upsell' || page === 'downsell') && (
        <div className="text-center text-xs text-gray-500 mt-2">
          <p>Contexto: {page} - {variant}</p>
          {currentCid && <p>CID será preservado na navegação</p>}
        </div>
      )}
    </div>
  );
};