import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink, Eye, Settings } from 'lucide-react';

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
        updateStatus(index, { 
          status: 'success', 
          message: 'Hotjar carregado e funcionando',
          details: 'Script carregado, eventos sendo enviados'
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
      // Check if Facebook Pixel is loaded
      if (typeof (window as any).fbq === 'function') {
        // Test Facebook Pixel by triggering a custom event
        (window as any).fbq('trackCustom', 'AdminTest');
        updateStatus(index, { 
          status: 'success', 
          message: 'Meta Pixel carregado e funcionando',
          details: 'Pixel ativo, eventos sendo enviados para Facebook'
        });
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
      // Import supabase dynamically to test connection
      const { supabase } = await import('../lib/supabase');
      
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
      const videoContainer = document.getElementById('vid_683ba3d1b87ae17c6e07e7db');
      if (!videoContainer) {
        updateStatus(index, { 
          status: 'error', 
          message: 'Container de vídeo não encontrado',
          details: 'Elemento vid_683ba3d1b87ae17c6e07e7db não existe'
        });
        return;
      }

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
      
      if (videos.length > 0 || iframes.length > 0) {
        updateStatus(index, { 
          status: 'success', 
          message: 'Elementos de vídeo encontrados',
          details: `${videos.length} vídeos, ${iframes.length} iframes detectados`
        });
      } else {
        updateStatus(index, { 
          status: 'warning', 
          message: 'Nenhum elemento de vídeo detectado',
          details: 'Container existe mas não há vídeos ou iframes'
        });
      }

      // Test manual video play tracking
      if (typeof window !== 'undefined' && (window as any).trackVideoPlay) {
        (window as any).trackVideoPlay();
        updateStatus(index, { 
          status: 'success', 
          message: 'Tracking de vídeo funcionando',
          details: 'Evento de video_play enviado com sucesso'
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
      testUtmify(2),
      testUTMParams(3),
      testVideoTracking(4),
      testSupabase(5)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  switch (index) {
                    case 0: testHotjar(index); break;
                    case 1: testMetaPixel(index); break;
                    case 2: testUtmify(index); break;
                    case 3: testUTMParams(index); break;
                    case 4: testVideoTracking(index); break;
                    case 5: testSupabase(index); break;
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
              
              {tracking.name === 'Video Tracking' && (
                <button
                  onClick={() => {
                    // Force trigger video play event for testing
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          URLs de Teste + Debugging de Vídeo
        </h3>
        <p className="text-gray-600 mb-4">
          Use estas URLs para testar se os parâmetros UTM estão sendo preservados corretamente:
        </p>
        
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Teste básico de UTM:</p>
            <code className="text-sm text-blue-600 break-all">
              {window.location.origin}/?utm_source=admin_test&utm_medium=dashboard&utm_campaign=tracking_test
            </code>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Teste com Facebook Click ID:</p>
            <code className="text-sm text-blue-600 break-all">
              {window.location.origin}/?utm_source=facebook&utm_medium=cpc&fbclid=test123456
            </code>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Teste com Google Click ID:</p>
            <code className="text-sm text-blue-600 break-all">
              {window.location.origin}/?utm_source=google&utm_medium=cpc&gclid=test789012
            </code>
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
            <p className="text-sm text-gray-600">Site ID: <code className="bg-gray-100 px-1 rounded">6454408</code></p>
            <p className="text-sm text-gray-600">Versão: <code className="bg-gray-100 px-1 rounded">6</code></p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Meta Pixel</h4>
            <p className="text-sm text-gray-600">Pixel ID: <code className="bg-gray-100 px-1 rounded">1205864517252800</code></p>
            <p className="text-sm text-gray-600">Eventos: PageView, Purchase, Lead</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Utmify</h4>
            <p className="text-sm text-gray-600">Pixel ID: <code className="bg-gray-100 px-1 rounded">681eb087803be4de5c3bd68b</code></p>
            <p className="text-sm text-gray-600">Carregamento: Assíncrono</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 Instruções de Teste</h3>
        <div className="space-y-2 text-sm text-yellow-700">
          <p><strong>1. Hotjar:</strong> Verifique se aparece "success" e acesse o dashboard para ver as sessões</p>
          <p><strong>2. Meta Pixel:</strong> Use o Facebook Pixel Helper (extensão do Chrome) para verificar eventos</p>
          <p><strong>3. Utmify:</strong> Verifique se o pixel está carregando e enviando dados</p>
          <p><strong>4. UTM Parameters:</strong> Teste com URLs que contenham parâmetros UTM</p>
          <p><strong>5. Supabase:</strong> Verifique se os eventos estão sendo salvos no banco de dados</p>
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