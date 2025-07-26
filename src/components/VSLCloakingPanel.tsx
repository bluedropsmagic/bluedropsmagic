import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Eye, EyeOff, RefreshCw, Settings, ExternalLink } from 'lucide-react';
import { 
  getVSLCloakingStatus, 
  toggleVSLCloaking, 
  VSL_CLOAKING_CONFIG,
  isBoltEnvironment,
  isDesktopDevice 
} from '../utils/vslCloaking';

export const VSLCloakingPanel: React.FC = () => {
  const [cloakingStatus, setCloakingStatus] = useState(getVSLCloakingStatus());
  const [isToggling, setIsToggling] = useState(false);

  // Update status every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCloakingStatus(getVSLCloakingStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Listen for window resize to update device type
  useEffect(() => {
    const handleResize = () => {
      setCloakingStatus(getVSLCloakingStatus());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleCloaking = async () => {
    setIsToggling(true);
    
    try {
      const newStatus = toggleVSLCloaking();
      setCloakingStatus(getVSLCloakingStatus());
      
      // Show confirmation
      const action = newStatus ? 'ATIVADO' : 'DESATIVADO';
      console.log(`🎬 VSL Cloaking ${action} pelo admin`);
      
      // Suggest page reload for changes to take effect
      if (confirm(`VSL Cloaking ${action}! Recarregar a página para aplicar as mudanças?`)) {
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Error toggling VSL cloaking:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? (
      <Eye className="w-5 h-5 text-green-600" />
    ) : (
      <EyeOff className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType === 'desktop' ? (
      <Monitor className="w-5 h-5 text-purple-600" />
    ) : (
      <Smartphone className="w-5 h-5 text-blue-600" />
    );
  };

  const testUrls = [
    {
      name: 'Teste Desktop (deve usar desktop VSL)',
      url: `${window.location.origin}/`,
      description: 'Abra em tela cheia (>1024px) para ver desktop VSL'
    },
    {
      name: 'Teste Mobile (deve usar mobile VSL)',
      url: `${window.location.origin}/`,
      description: 'Redimensione para <1024px para ver mobile VSL'
    },
    {
      name: 'Teste Bolt (sempre mobile VSL)',
      url: `${window.location.origin}/`,
      description: 'No ambiente Bolt sempre usa mobile VSL'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Monitor className="w-6 h-6" />
              🎬 Cloaking de VSL - Vídeos por Dispositivo
            </h2>
            <p className="text-gray-600 mt-1">
              Mostra vídeo diferente para desktop vs mobile (desabilitado no Bolt)
            </p>
          </div>
          <button
            onClick={() => setCloakingStatus(getVSLCloakingStatus())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        {/* Current Status */}
        <div className={`border rounded-lg p-4 ${getStatusColor(cloakingStatus.enabled)}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {getStatusIcon(cloakingStatus.enabled)}
              Status do VSL Cloaking
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              cloakingStatus.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {cloakingStatus.enabled ? '👁️ ATIVO' : '🚫 DESATIVADO'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Ambiente:</strong> 
              <span className={`ml-2 font-mono ${cloakingStatus.environment === 'development' ? 'text-blue-600' : 'text-green-600'}`}>
                {cloakingStatus.environment === 'development' ? '🔧 Development' : '🚀 Production'}
              </span>
            </div>
            <div>
              <strong>Dispositivo atual:</strong> 
              <span className={`ml-2 font-mono ${cloakingStatus.deviceType === 'desktop' ? 'text-purple-600' : 'text-blue-600'}`}>
                {cloakingStatus.deviceType === 'desktop' ? '💻 Desktop' : '📱 Mobile'} ({window.innerWidth}px)
              </span>
            </div>
            <div>
              <strong>Vídeo em uso:</strong> 
              <span className="ml-2 font-mono text-blue-600">
                {cloakingStatus.currentVideoId}
              </span>
            </div>
            <div>
              <strong>Tipo de vídeo:</strong> 
              <span className={`ml-2 font-mono font-bold ${cloakingStatus.isUsingDesktopVideo ? 'text-purple-600' : 'text-blue-600'}`}>
                {cloakingStatus.isUsingDesktopVideo ? '💻 Desktop VSL' : '📱 Mobile VSL'}
              </span>
            </div>
          </div>
        </div>

        {/* Bolt Environment Warning */}
        {cloakingStatus.environment === 'development' && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Ambiente Bolt Detectado</span>
            </div>
            <p className="text-blue-700 text-sm">
              O VSL cloaking está <strong>DESABILITADO</strong> no ambiente Bolt para permitir desenvolvimento.
              Sempre usa o vídeo mobile (683ba3d1b87ae17c6e07e7db) independente do dispositivo.
            </p>
          </div>
        )}
      </div>

      {/* Toggle Control */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          ⚙️ Controle do VSL Cloaking
        </h3>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-semibold text-gray-900">VSL Cloaking</h4>
            <p className="text-sm text-gray-600">
              {cloakingStatus.enabled ? 
                'Desktop users veem vídeo landscape, mobile users veem vídeo portrait' : 
                'Todos os usuários veem o mesmo vídeo mobile'
              }
            </p>
          </div>
          
          <button
            onClick={handleToggleCloaking}
            disabled={isToggling}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              cloakingStatus.enabled
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isToggling ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {cloakingStatus.enabled ? '🚫 DESATIVAR' : '👁️ ATIVAR'}
              </>
            )}
          </button>
        </div>
        
        {/* Warning about page reload */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            ⚠️ <strong>Importante:</strong> Após alterar a configuração, recarregue a página para aplicar as mudanças.
          </p>
        </div>
      </div>

      {/* Video Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📹 Configuração dos Vídeos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mobile Video */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">📱 Vídeo Mobile (Portrait)</h4>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{cloakingStatus.mobileVideoId}</code>
                </div>
                <div>
                  <strong>Aspect Ratio:</strong> <span className="text-blue-700">9:16 (Portrait)</span>
                </div>
                <div>
                  <strong>Dispositivos:</strong> <span className="text-blue-700">Mobile, Tablet</span>
                </div>
                <div>
                  <strong>Breakpoint:</strong> <span className="text-blue-700">&lt; {cloakingStatus.breakpoint}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Video */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">💻 Vídeo Desktop (Landscape)</h4>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>ID:</strong> <code className="bg-purple-100 px-2 py-1 rounded">{cloakingStatus.desktopVideoId}</code>
                </div>
                <div>
                  <strong>Aspect Ratio:</strong> <span className="text-purple-700">16:9 (Landscape)</span>
                </div>
                <div>
                  <strong>Dispositivos:</strong> <span className="text-purple-700">Desktop, Laptop</span>
                </div>
                <div>
                  <strong>Breakpoint:</strong> <span className="text-purple-700">≥ {cloakingStatus.breakpoint}px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test URLs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          🧪 Testes de VSL Cloaking
        </h3>
        <p className="text-gray-600 mb-4">
          Use estas instruções para testar o sistema:
        </p>
        
        <div className="space-y-3">
          {testUrls.map((testUrl, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {index === 0 ? <Monitor className="w-4 h-4 text-purple-600" /> : 
                     index === 1 ? <Smartphone className="w-4 h-4 text-blue-600" /> : 
                     <Settings className="w-4 h-4 text-gray-600" />}
                    <span className="font-medium text-gray-900">{testUrl.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{testUrl.description}</p>
                  <code className="text-sm text-blue-600 break-all block">
                    {testUrl.url}
                  </code>
                </div>
                <a
                  href={testUrl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Testar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 Como Funciona o VSL Cloaking</h3>
        <div className="space-y-2 text-sm text-yellow-700">
          <p><strong>1. Detecção de Dispositivo:</strong> Verifica se largura da tela ≥ 1024px</p>
          <p><strong>2. Mobile (&lt;1024px):</strong> Usa vídeo portrait (683ba3d1b87ae17c6e07e7db)</p>
          <p><strong>3. Desktop (≥1024px):</strong> Usa vídeo landscape (681fdea4e3b3cfc4a1396f3c)</p>
          <p><strong>4. Ambiente Bolt:</strong> Sempre usa vídeo mobile para desenvolvimento</p>
          <p><strong>5. Configuração:</strong> Pode ser ativado/desativado pelo admin</p>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🎯 Benefícios:</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>• <strong>Mobile:</strong> Vídeo otimizado para tela vertical (9:16)</p>
            <p>• <strong>Desktop:</strong> Vídeo otimizado para tela horizontal (16:9)</p>
            <p>• <strong>UX:</strong> Melhor experiência para cada tipo de dispositivo</p>
            <p>• <strong>Conversão:</strong> Vídeos específicos podem ter melhor performance</p>
            <p>• <strong>Flexibilidade:</strong> Admin pode desativar se necessário</p>
          </div>
        </div>
      </div>

      {/* Debug Console */}
      <div className="bg-gray-900 text-green-400 rounded-xl p-6 font-mono text-sm">
        <h3 className="text-white font-bold mb-3">🖥️ Console de Debug VSL:</h3>
        <div className="space-y-1">
          <p>🎬 VSL Cloaking enabled: {cloakingStatus.enabled.toString()}</p>
          <p>🔧 Bolt environment: {cloakingStatus.environment === 'development' ? 'true' : 'false'}</p>
          <p>📱 Device type: {cloakingStatus.deviceType}</p>
          <p>📏 Screen width: {window.innerWidth}px (breakpoint: {cloakingStatus.breakpoint}px)</p>
          <p>🎯 Current video ID: {cloakingStatus.currentVideoId}</p>
          <p>💻 Using desktop video: {cloakingStatus.isUsingDesktopVideo.toString()}</p>
          <p>⚙️ System status: {cloakingStatus.enabled && cloakingStatus.environment === 'production' ? 'ACTIVE' : 'STANDBY'}</p>
        </div>
      </div>
    </div>
  );
};