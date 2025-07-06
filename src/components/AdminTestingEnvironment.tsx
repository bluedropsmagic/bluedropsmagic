import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, Monitor, ShoppingCart } from 'lucide-react';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';

interface TestingEnvironmentProps {
  className?: string;
}

export const AdminTestingEnvironment: React.FC<TestingEnvironmentProps> = ({ className = '' }) => {
  const [showWebView, setShowWebView] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // URLs dos produtos
  const productUrls = {
    '1-bottle': 'https://pagamento.paybluedrops.com/checkout/176654642:1',
    '3-bottle': 'https://pagamento.paybluedrops.com/checkout/176845818:1',
    '6-bottle': 'https://pagamento.paybluedrops.com/checkout/176849703:1'
  };

  const handlePurchaseTest = (packageType: '1-bottle' | '3-bottle' | '6-bottle') => {
    const url = productUrls[packageType];
    
    // Track InitiateCheckout como normal
    trackInitiateCheckout(url);
    
    // Adicionar CID se presente
    let finalUrl = url;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !finalUrl.includes('cid=')) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    console.log('🧪 Admin Test: Opening webview for', packageType, 'URL:', finalUrl);
    
    // Abrir no webview ao invés de nova aba
    setCurrentUrl(finalUrl);
    setIsLoading(true);
    setShowWebView(true);
  };

  const closeWebView = () => {
    setShowWebView(false);
    setCurrentUrl('');
    setIsLoading(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                🧪 Ambiente de Teste - Botões de Compra
              </h3>
              <p className="text-sm text-gray-600">
                Teste os botões de compra com webview integrado (apenas admin)
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Como Funciona:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Clique nos botões abaixo para testar</li>
              <li>• InitiateCheckout será trackado normalmente</li>
              <li>• Página abrirá em webview de tela inteira</li>
              <li>• CID será preservado automaticamente</li>
              <li>• Use ESC ou X para fechar o webview</li>
            </ul>
          </div>
        </div>

        {/* Botões de Teste */}
        <div className="p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Botões de Compra para Teste:
          </h4>

          <div className="space-y-4">
            {/* 6 Bottle Package - Principal */}
            <div className="relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-600 px-4 py-1 rounded-full text-xs font-black shadow-lg border border-white/40">
                  BEST VALUE
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600/95 to-blue-800/95 rounded-xl p-4 pt-6 border-2 border-white/30 shadow-lg">
                <div className="text-center mb-3">
                  <h5 className="text-lg font-bold text-white mb-1">BLUEDROPS - 6 BOTTLE PACKAGE</h5>
                  <p className="text-white/80 text-sm">$49 per bottle, $294 total</p>
                </div>
                
                <button 
                  onClick={() => handlePurchaseTest('6-bottle')}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-base"
                >
                  🧪 TESTAR 6-BOTTLE PACKAGE
                </button>
              </div>
            </div>

            {/* 3 e 1 Bottle lado a lado */}
            <div className="grid grid-cols-2 gap-4">
              {/* 3 Bottle Package */}
              <div className="bg-gradient-to-br from-blue-400/80 to-blue-600/80 rounded-xl p-4 border border-white/20 shadow-lg">
                <div className="text-center mb-3">
                  <h5 className="text-base font-bold text-white mb-1">3 BOTTLE PACKAGE</h5>
                  <p className="text-white/80 text-xs">$66 per bottle, $198 total</p>
                </div>
                
                <button 
                  onClick={() => handlePurchaseTest('3-bottle')}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-sm"
                >
                  🧪 TESTAR 3-BOTTLE
                </button>
              </div>

              {/* 1 Bottle Package */}
              <div className="bg-gradient-to-br from-blue-300/80 to-blue-500/80 rounded-xl p-4 border border-white/20 shadow-lg">
                <div className="text-center mb-3">
                  <h5 className="text-base font-bold text-white mb-1">1 BOTTLE PACKAGE</h5>
                  <p className="text-white/80 text-xs">$89, $79 + $9.99 ship</p>
                </div>
                
                <button 
                  onClick={() => handlePurchaseTest('1-bottle')}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-sm"
                >
                  🧪 TESTAR 1-BOTTLE
                </button>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-semibold text-gray-700 mb-2">📊 Status do Teste:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Tracking:</strong> <span className="text-green-600">InitiateCheckout ativo</span>
              </div>
              <div>
                <strong>CID:</strong> <span className="text-blue-600">
                  {new URLSearchParams(window.location.search).get('cid') || 'Não presente'}
                </span>
              </div>
              <div>
                <strong>Modo:</strong> <span className="text-purple-600">WebView Admin</span>
              </div>
              <div>
                <strong>Ambiente:</strong> <span className="text-orange-600">Teste Controlado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WebView Modal de Tela Inteira */}
      {showWebView && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header do WebView */}
          <div className="bg-gray-900 text-white p-4 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">🧪 Admin Test WebView</h3>
                <p className="text-xs text-gray-300 truncate max-w-96">
                  {currentUrl}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isLoading && (
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              )}
              
              <button
                onClick={() => window.open(currentUrl, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors"
                title="Abrir em nova aba"
              >
                <ExternalLink className="w-3 h-3" />
                Nova Aba
              </button>
              
              <button
                onClick={closeWebView}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors"
                title="Fechar WebView (ESC)"
              >
                <X className="w-3 h-3" />
                Fechar
              </button>
            </div>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="bg-white rounded-lg p-6 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
                <p className="text-gray-700 font-medium">Carregando página de checkout...</p>
                <p className="text-gray-500 text-sm mt-1">Aguarde um momento</p>
              </div>
            </div>
          )}

          {/* WebView Content */}
          <div className="flex-1 relative">
            <iframe
              src={currentUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              title="Admin Test WebView"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            />
          </div>
        </div>
      )}

      {/* ESC Key Handler */}
      {showWebView && (
        <div
          className="fixed inset-0 z-40"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeWebView();
            }
          }}
          tabIndex={-1}
          style={{ outline: 'none' }}
        />
      )}
    </>
  );
};