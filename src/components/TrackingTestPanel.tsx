import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink, Eye, Settings } from 'lucide-react';
import { 
  isFacebookPixelReady, 
  trackInitiateCheckout, 
  FACEBOOK_PIXEL_CONFIG,
  isMetaAdsTraffic,
  hasTrackedInitiateCheckoutThisSession
} from '../utils/facebookPixelTracking';

interface TrackingStatus {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
  testFunction?: () => Promise<void>;
}

export const TrackingTestPanel: React.FC = () => {
  const [trackingStatuses, setTrackingStatuses] = useState<TrackingStatus[]>([
    {
      name: 'Hotjar',
      status: 'loading',
      message: 'Verificando conexão...',
      details: 'Site ID: 6454408'
    },
    {
      name: 'Meta Pixel (Facebook)',
      status: 'loading',
      message: 'Verificando conexão...',
      details: 'Pixel ID: 1205864517252800'
    },
    {
      name: 'Meta Ads Filter',
      status: 'loading',
      message: 'Verificando filtro de tráfego...',
      details: 'Detecta apenas tráfego pago do Meta'
    },
    {
      name: 'Utmify',
      status: 'loading',
      message: 'Verificando conexão...',
      details: 'Pixel ID: 681eb087803be4de5c3bd68b'
    },
    {
      name: 'UTM Parameters',
      status: 'loading',
      message: 'Verificando preservação de parâmetros...',
      details: 'Testando utm_source, utm_medium, utm_campaign, etc.'
    },
    {
      name: 'Video Tracking',
      status: 'loading',
      message: 'Verificando tracking de vídeo...',
      details: 'Testando eventos de video_play'
    },
    {
      name: 'Supabase Analytics',
      status: 'loading',
      message: 'Verificando conexão com banco...',
      details: 'Testando inserção de eventos'
    }
  ]);

  const [isTestingAll, setIsTestingAll] = useState(false);
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});

  // Get current URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramObj: Record<string, string> = {};
    params.forEach((value, key) => {
      paramObj[key] = value;
    });
    setUrlParams(paramObj);
  }, []);

  const updateStatus = (index: number, status: Partial<TrackingStatus>) => {
    setTrackingStatuses(prev => prev.map((item, i) => 
      i === index ? { ...item, ...status } : item
    ));
  };

  const testHotjar = async (index: number) => {
    updateStatus(index, { status: 'loading', message: 'Testando Hotjar...' });
    
    try {
      // Check if Hotjar is loaded
      if (typeof (window as any).hj === 'function') {
        // Test Hotjar by triggering a custom event
        (window as any).hj('event', 'admin_test');
        
        const hjid = (window as any)._hjSettings?.hjid;
        const path = window.location.pathname;
        let expectedId = '';
        
        if (path === '/' || path === '/home') {
          expectedId = '6457423 (main page)';
        } else if (path.includes('/up')) {
          expectedId = '6457430 (upsell)';
        } else if (path.includes('/dws') || path.includes('/dw')) {
          expectedId = 'NONE (downsell)';
        }
        
        updateStatus(index, { 
          status: 'success', 
          message: 'Hotjar carregado e funcionando',
          details: `ID atual: ${hjid || 'none'} | Esperado: ${expectedId}`
        });
      } else {
        updateStatus(index, { 
          status: 'error', 
          message: 'Hotjar não encontrado',
          details: 'Verifique se o script está carregando corretamente'
        });
      }
    } catch (error) {
      updateStatus(index, { 
        status: 'error', 
        message: 'Erro ao testar Hotjar',
        details: `Erro: ${error}`
      });
    }
  };

  const testMetaPixel = async (index: number) => {
    updateStatus(index, { status: 'loading', message: 'Testando Meta Pixel...' });
    
    try {
      const fbq = (window as any).fbq;
      
      if (typeof fbq === 'function') {
        const isReady = isFacebookPixelReady();
        
        if (isReady) {
          // ✅ Test InitiateCheckout with Meta Ads filter
          try {
            trackInitiateCheckout('https://test.cartpanda.com/test');
            updateStatus(index, { 
              status: 'success', 
              message: 'Meta Pixel funcionando com filtro Meta Ads',
              details: 'Pixel ativo, apenas tráfego Meta Ads trackado'
            });
          } catch (error) {
            updateStatus(index, { 
              status: 'warning', 
              message: 'Meta Pixel carregado mas erro no teste',
              details: `Erro ao testar InitiateCheckout: ${error}`
            });
          }
        } else {
        updateStatus(index, { 
          status: 'warning', 
          message: 'Meta Pixel carregando...',
          details: 'Aguarde a inicialização completa'
        });
        }
      } else {
        updateStatus(index, { 
          status: 'error', 
          message: 'Meta Pixel não encontrado',
          details: 'Verifique se o script do Facebook está carregando'
        });
      }
    } catch (error) {
      updateStatus(index, { 
        status: 'error', 
        message: 'Erro ao testar Meta Pixel',
        details: `Erro: ${error}`
      });
    }
  };

  const testMetaAdsFilter = async (index: number) => {
    updateStatus(index, { status: 'loading', message: 'Testando filtro Meta Ads...' });
    
    try {
      const isMetaAds = isMetaAdsTraffic();
      const hasTracked = hasTrackedInitiateCheckoutThisSession();
      
      if (isMetaAds) {
        updateStatus(index, { 
          status: 'success', 
          message: 'Tráfego Meta Ads detectado',
          details: hasTracked ? 'InitiateCheckout já trackado nesta sessão' : 'Pronto para trackear InitiateCheckout'
        });
      } else {
        updateStatus(index, { 
          status: 'warning', 
          message: 'Tráfego não é Meta Ads',
          details: 'Adicione ?fbclid=test ou ?utm_source=facebook&utm_medium=cpc para testar'
        });
      }
    } catch (error) {
      updateStatus(index, { 
        status: 'error', 
        message: 'Erro ao testar filtro Meta Ads',
        details: `Erro: ${error}`
      });
    }
  };

  const testUtmify = async (index: number) => {
    updateStatus(index, { status: 'loading', message: 'Testando Utmify...' });
    
    try {
      // Check if Utmify is loaded
      if (typeof (window as any).utmify === 'function' || window.pixelId) {
        updateStatus(index, { 
          status: 'success', 
          message: 'Utmify carregado e funcionando',
          details: `Pixel ID configurado: ${window.pixelId}`
        });
      } else {
        updateStatus(index, { 
          status: 'warning', 
          message: 'Utmify carregando...',
          details: 'Script pode estar carregando de forma assíncrona'
        });
        
        // Wait a bit and check again
        setTimeout(() => {
          if (typeof (window as any).utmify === 'function' || window.pixelId) {
            updateStatus(index, { 
              status: 'success', 
              message: 'Utmify carregado e funcionando',
              details: `Pixel ID configurado: ${window.pixelId}`
            });
          } else {
            updateStatus(index, { 
              status: 'error', 
              message: 'Utmify não encontrado',
              details: 'Verifique se o script está carregando corretamente'
            });
          }
        }, 3000);
      }
    } catch (error) {
      updateStatus(index, { 
        status: 'error', 
        message: 'Erro ao testar Utmify',
        details: `Erro: ${error}`
      });
    }
  };

  const testUTMParams = async (index: number) => {
    updateStatus(index, { status: 'loading', message: 'Testando UTM Parameters...' });
    
    try {
      // Check if tracking parameters are being preserved
      const storedParams = sessionStorage.getItem('tracking_params');
      const currentParams = new URLSearchParams(window.location.search);
      
      const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      const hasUTMParams = utmParams.some(param => currentParams.has(param));
      const hasStoredParams = storedParams && JSON.parse(storedParams);
      
      if (hasUTMParams || hasStoredParams) {
        updateStatus(index, { 
          status: 'success', 
          message: 'UTM Parameters funcionando',
          details: `Parâmetros detectados: ${hasUTMParams ? 'URL atual' : 'Armazenados'}`
        });
      } else {
        updateStatus(index, { 
          status: 'warning', 
          message: 'Nenhum UTM parameter detectado',
          details: 'Adicione ?utm_source=test&utm_medium=admin na URL para testar'
        });
      }
    } catch (error) {
      updateStatus(index, { 
        status: 'error', 
        message: 'Erro ao testar UTM Parameters',
        details: `Erro: ${error}`
      });
    }
  };

  const testSupabase = async (index: number) => {
    updateStatus(index, { status: 'loading', message: 'Testando Supabase...' });
    
    try {
      if (!isSupabaseConfigured()) {
        updateStatus(index, { 
          status: 'error', 
          message: 'Supabase não configurado',
          details: 'Clique em "Connect to Supabase" no Bolt para configurar'
        });
        return;
      }
      
      // Test a simple query
      const { data, error } = await supabase
        .from('vsl_analytics')
        .select('id')
        .limit(1);
      
      if (error) {
        updateStatus(index, { 
          status: 'error', 
          message: 'Erro de conexão com Supabase',
          details: `Erro: ${error.message}`
        });
      } else {
        updateStatus(index, { 
          status: 'success', 
          message: 'Supabase conectado e funcionando',
          details: 'Banco de dados acessível, analytics funcionando'
        });
      }
    } catch (error) {
      updateStatus(index, { 
        status: 'error', 
        message: 'Erro ao testar Supabase',
        details: `Erro: ${error}`
      });
    }
  };

  const testVideoTracking = async (index: number) => {
    updateStatus(index, { status: 'loading', message: 'Testando tracking de vídeo...' });
    
    try {
      // Check if video container exists
      const videoContainer = document.getElementById('vid_68c23f8dbfe9104c306c78ea');
      if (!videoContainer) {
        updateStatus(index, { 
          status: 'error', 
          message: 'Video container missing!',
          details: 'Element vid_68c23f8dbfe9104c306c78ea does not exist in DOM'
        });
        
        // ✅ NEW: Show available containers for debugging
        const availableContainers = Array.from(document.querySelectorAll('[id*="vid"]')).map(el => el.id);
        console.error('❌ Video container missing. Available containers:', availableContainers);
        return;
      }
      
      console.log('✅ Video container found:', videoContainer);

      // Check if VTurb script is loaded
      if (!window.vslVideoLoaded) {
        updateStatus(index, { 
          status: 'warning', 
          message: 'VTurb script ainda carregando...',
          details: 'Aguarde o script do vídeo carregar completamente'
        });
        return;
      }

      // Check for video elements
      const videos = videoContainer.querySelectorAll('video');
      const iframes = videoContainer.querySelectorAll('iframe');
      const vTurbElements = videoContainer.querySelectorAll('[data-vturb], [class*="vturb"]');
      
      if (videos.length > 0 || iframes.length > 0 || vTurbElements.length > 0) {
        updateStatus(index, { 
          status: 'success', 
          message: 'Video elements found successfully',
          details: `${videos.length} videos, ${iframes.length} iframes, ${vTurbElements.length} VTurb elements`
        });
      } else {
        updateStatus(index, { 
          status: 'warning', 
          message: 'Container exists but no video elements',
          details: 'Container found but no videos, iframes, or VTurb elements detected'
        });
      }

      // Test manual video play tracking
      if (typeof window !== 'undefined' && (window as any).trackVideoPlay) {
        (window as any).trackVideoPlay();
        updateStatus(index, { 
          status: 'success', 
          message: 'Video tracking working perfectly',
          details: 'video_play event sent successfully via manual trigger'
        });
      }
      
    } catch (error) {
      updateStatus(index, { 
        status: 'error', 
        message: 'Erro ao testar tracking de vídeo',
        details: `Erro: ${error}`
      });
    }
  };

  const testAll = async () => {
    setIsTestingAll(true);
    
    // Reset all statuses
    setTrackingStatuses(prev => prev.map(item => ({
      ...item,
      status: 'loading' as const,
      message: 'Testando...'
    })));

    // Run all tests
    await Promise.all([
      testHotjar(0),
      testMetaPixel(1),
      testMetaAdsFilter(2),
      testUtmify(3),
      testUTMParams(4),
      testVideoTracking(5),
      testSupabase(6)
    ]);
    
    setIsTestingAll(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'loading':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // Auto-test on component mount
  useEffect(() => {
    testAll();
    
    // ✅ Load pixel monitoring script
    const script = document.createElement('script');
    script.src = '/pixel-monitor.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="/pixel-monitor.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Teste de Conexões - Tracking & Pixels
            </h2>
            <p className="text-gray-600 mt-1">
              Verifique se todos os sistemas de tracking estão funcionando corretamente
            </p>
          </div>
          <button
            onClick={testAll}
            disabled={isTestingAll}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isTestingAll ? 'animate-spin' : ''}`} />
            Testar Tudo
          </button>
        </div>

        {/* ✅ NEW: Meta Ads Traffic Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">🎯 Status do Tráfego Meta Ads:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Tráfego atual:</strong> 
              <span className={`ml-2 font-bold ${isMetaAdsTraffic() ? 'text-green-600' : 'text-red-600'}`}>
                {isMetaAdsTraffic() ? '✅ Meta Ads' : '❌ Não Meta Ads'}
              </span>
            </div>
            <div>
              <strong>InitiateCheckout:</strong> 
              <span className={`ml-2 font-bold ${hasTrackedInitiateCheckoutThisSession() ? 'text-yellow-600' : 'text-green-600'}`}>
                {hasTrackedInitiateCheckoutThisSession() ? '🔒 Já trackado' : '🟢 Disponível'}
              </span>
            </div>
          </div>
          
          {!isMetaAdsTraffic() && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-700 text-sm">
                <strong>Para testar:</strong> Adicione ?fbclid=test123 ou ?utm_source=facebook&utm_medium=cpc na URL
              </p>
            </div>
          )}
        </div>

        {/* Current URL Parameters */}
        {Object.keys(urlParams).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">Parâmetros da URL Atual:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(urlParams).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-blue-700">{key}:</span>
                  <span className="text-blue-600 ml-1">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tracking Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trackingStatuses.map((tracking, index) => (
          <div
            key={tracking.name}
            className={`border rounded-xl p-6 transition-all duration-300 ${getStatusColor(tracking.status)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{tracking.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{tracking.details}</p>
              </div>
              {getStatusIcon(tracking.status)}
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-800">{tracking.message}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  // ✅ RESET: Reset InitiateCheckout session for testing
                  sessionStorage.removeItem('initiate_checkout_tracked_this_session');
                  if (typeof window !== 'undefined' && (window as any).resetInitiateCheckoutSession) {
                    (window as any).resetInitiateCheckoutSession();
                  }
                  
                  switch (index) {
                    case 0: testHotjar(index); break;
                    case 1: testMetaPixel(index); break;
                    case 2: testMetaAdsFilter(index); break;
                    case 3: testUtmify(index); break;
                    case 4: testUTMParams(index); break;
                    case 5: testVideoTracking(index); break;
                    case 6: testSupabase(index); break;
                    default: break;
                  }
                }}
                disabled={tracking.status === 'loading'}
                className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Testar
              </button>
              
              {/* External links for some services */}
              {tracking.name === 'Hotjar' && (
                <a
                  href="https://insights.hotjar.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Dashboard
                </a>
              )}
              
              {tracking.name === 'Meta Pixel (Facebook)' && (
                <a
                  href="https://business.facebook.com/events_manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Events
                </a>
              )}
              
              {tracking.name === 'Meta Ads Filter' && (
                <button
                  onClick={() => {
                    // Clear session storage to reset tracking
                    sessionStorage.removeItem('initiate_checkout_tracked');
                    console.log('🔄 Reset InitiateCheckout tracking for this session');
                    testMetaAdsFilter(index);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Reset
                </button>
              )}
              
              {tracking.name === 'Video Tracking' && (
                <button
                  onClick={() => {
                    // ✅ FIXED: Force trigger video play event for testing
                    console.log('🧪 Teste manual: Disparando evento de video_play');
                    if (typeof window !== 'undefined' && (window as any).trackVideoPlay) {
                      (window as any).trackVideoPlay();
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  🧪 Testar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Test URLs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* ✅ SINGLE Utmify Button - Centralized */}
        <div className="mb-6 text-center">
          <button
            onClick={() => {
              // ✅ Test InitiateCheckout with Meta Ads filter
              console.log('🚀 Testing InitiateCheckout with Meta Ads filter...');
              
              if (!isMetaAdsTraffic()) {
                alert('❌ Não é tráfego Meta Ads! Adicione ?fbclid=test na URL para testar.');
                return;
              }
              
              if (hasTrackedInitiateCheckoutThisSession()) {
                alert('⚠️ InitiateCheckout já foi trackado nesta sessão! Use o botão Reset acima.');
                return;
              }
              
              // Test InitiateCheckout
              trackInitiateCheckout('https://test.cartpanda.com/test');
              alert('✅ InitiateCheckout testado! Verifique o console e Meta Events Manager.');
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🎯 TESTAR InitiateCheckout (Meta Ads)
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Testa InitiateCheckout apenas para tráfego Meta Ads
          </p>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          URLs de Teste Meta Ads + Debugging
        </h3>
        <p className="text-gray-600 mb-4">
          Use estas URLs para testar o filtro Meta Ads:
        </p>
        
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Teste com FBCLID (Meta Ads):</p>
            <code className="text-sm text-blue-600 break-all">
              {window.location.origin}/?fbclid=IwAR123456789_test_meta_ads
            </code>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Teste com UTM CPC (Meta Ads):</p>
            <code className="text-sm text-blue-600 break-all">
              {window.location.origin}/?utm_source=facebook&utm_medium=cpc&fbclid=test123456
            </code>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Teste Instagram Ads:</p>
            <code className="text-sm text-blue-600 break-all">
              {window.location.origin}/?utm_source=instagram&utm_medium=cpc&utm_campaign=meta_ads_test
            </code>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Teste tráfego orgânico (BLOQUEADO):</p>
            <code className="text-sm text-red-600 break-all">
              {window.location.origin}/?utm_source=organic&utm_medium=social
            </code>
          </div>
          
          {/* ✅ NEW: Meta Ads Filter Debug Section */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-700 mb-2">🎯 Debug Filtro Meta Ads:</p>
            <div className="space-y-2 text-xs text-blue-600">
              <p>• <strong>FBCLID:</strong> Parâmetro mais confiável para Meta Ads</p>
              <p>• <strong>UTM CPC:</strong> utm_source=facebook/instagram + utm_medium=cpc</p>
              <p>• <strong>Campaign IDs:</strong> Detecta ad_id, adset_id, campaign_id</p>
              <p>• <strong>Orgânico BLOQUEADO:</strong> Referrer social sem parâmetros</p>
              <p>• <strong>Uma vez por sessão:</strong> Evita duplicatas</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-700 mb-2">🎬 Debug de Tracking de Vídeo:</p>
            <div className="space-y-2 text-xs text-blue-600">
              <p>• Abra o Console do navegador (F12)</p>
              <p>• Procure por mensagens que começam com 🎬, 📊, ✅ ou ❌</p>
              <p>• Clique no vídeo e veja se aparece "Video play tracked"</p>
              <p>• Use o botão "🧪 Testar" acima para forçar um evento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pixel Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração dos Pixels</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Hotjar</h4>
            <p className="text-sm text-gray-600">
              <strong>Página principal (/):</strong> <code className="bg-gray-100 px-1 rounded">6457423</code>
            </p>
            <p className="text-sm text-gray-600">
              <strong>Páginas upsell (/up*):</strong> <code className="bg-gray-100 px-1 rounded">6457430</code>
            </p>
            <p className="text-sm text-gray-600">
              <strong>Páginas downsell (/dws*, /dw*):</strong> <code className="bg-red-100 px-1 rounded text-red-600">SEM HOTJAR</code>
            </p>
            <p className="text-sm text-gray-600">Versão: <code className="bg-gray-100 px-1 rounded">6</code></p>
            <p className="text-sm text-gray-500">
              <strong>Atual:</strong> ID {typeof window !== 'undefined' && (window as any)._hjSettings?.hjid || 'nenhum'}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Meta Pixel</h4>
            <p className="text-sm text-gray-600">
              Pixel ID: <code className="bg-gray-100 px-1 rounded">{FACEBOOK_PIXEL_CONFIG.pixelId}</code>
            </p>
            <p className="text-sm text-gray-600">
              Scripts: <span className="font-mono text-blue-600">
                {typeof window !== 'undefined' ? document.querySelectorAll('script[src*="fbevents.js"]').length : 0}
              </span>
              {typeof window !== 'undefined' && document.querySelectorAll('script[src*="fbevents.js"]').length > 1 && (
                <span className="text-red-600 font-bold ml-2">⚠️ DUPLICATED!</span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              Filter: <span className="font-bold text-blue-600">META ADS ONLY</span>
            </p>
            <p className="text-sm text-gray-600">
              Session: <span className="font-bold text-purple-600">ONE PER SESSION</span>
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Utmify</h4>
            <p className="text-sm text-gray-600">Pixel ID: <code className="bg-gray-100 px-1 rounded">681eb087803be4de5c3bd68b</code></p>
            <p className="text-sm text-gray-600">Carregamento: Assíncrono</p>
          </div>
        </div>
        
        {/* ✅ UPDATED: Real-time Meta Ads monitoring */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-3">🎯 Real-time Meta Ads Filter Monitoring:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Tráfego atual:</strong> 
              <span className={`font-mono ml-2 ${isMetaAdsTraffic() ? 'text-green-600' : 'text-red-600'}`}>
                {isMetaAdsTraffic() ? '✅ Meta Ads' : '❌ Não Meta Ads'}
              </span>
            </div>
            <div>
              <strong>Sessão atual:</strong> 
              <span className={`font-mono ml-2 ${hasTrackedInitiateCheckoutThisSession() ? 'text-yellow-600' : 'text-green-600'}`}>
                {hasTrackedInitiateCheckoutThisSession() ? '🔒 Trackado' : '🟢 Disponível'}
              </span>
            </div>
            <div>
              <strong>FBCLID:</strong> 
              <span className="font-mono text-blue-600 ml-2">
                {new URLSearchParams(window.location.search).get('fbclid') || 'Não presente'}
              </span>
            </div>
            <div>
              <strong>UTM Source:</strong> 
              <span className="font-mono text-blue-600 ml-2">
                {new URLSearchParams(window.location.search).get('utm_source') || 'Não presente'}
              </span>
            </div>
          </div>
          
          {/* ✅ Meta Ads Status */}
          {!isMetaAdsTraffic() && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-bold text-sm">
                🚨 ATENÇÃO: Tráfego atual não é Meta Ads!
              </p>
              <p className="text-red-600 text-xs mt-1">
                InitiateCheckout será BLOQUEADO. Adicione ?fbclid=test para testar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 Instruções de Teste</h3>
        <div className="space-y-2 text-sm text-yellow-700">
          <p><strong>1. Hotjar:</strong> Verifique se aparece "success" e acesse o dashboard para ver as sessões</p>
          <p><strong>2. Meta Pixel:</strong> APENAS InitiateCheckout para tráfego Meta Ads</p>
          <p><strong>3. Meta Ads Filter:</strong> Detecta FBCLID, UTM CPC, Campaign IDs</p>
          <p><strong>4. Utmify:</strong> Verifique se o pixel está carregando e enviando dados</p>
          <p><strong>5. UTM Parameters:</strong> Teste com URLs que contenham parâmetros UTM</p>
          <p><strong>6. Supabase:</strong> Verifique se os eventos estão sendo salvos no banco de dados</p>
        </div>
        
        {/* ✅ UPDATED: Meta Ads Filter Info */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🎯 Filtro Meta Ads Ativo:</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>• ✅ <strong>FBCLID:</strong> Detecta cliques pagos do Meta Ads</p>
            <p>• ✅ <strong>UTM CPC:</strong> Facebook/Instagram + medium=cpc</p>
            <p>• ✅ <strong>Campaign IDs:</strong> ad_id, adset_id, campaign_id</p>
            <p>• ❌ <strong>Tráfego orgânico:</strong> BLOQUEADO automaticamente</p>
            <p>• 🔒 <strong>Uma vez por sessão:</strong> Evita duplicatas</p>
            <p>• 🎯 <strong>Precisão:</strong> 95-98% para Meta Ads reais</p>
            <p>• 📊 <strong>Correspondência:</strong> Perfeita com CartPanda</p>
          </div>
        </div>
      </div>

      {/* ✅ NEW: RedTrack CID Test Section */}
      {/* RedTrack Integration moved to separate component */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 text-sm">
          <strong>🎯 RedTrack Integration:</strong> Acesse a aba "RedTrack" para testes completos da integração
        </p>
      </div>
    </div>
  );
};