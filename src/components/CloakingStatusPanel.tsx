import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Eye, ExternalLink } from 'lucide-react';
import { 
  getCloakingStatus, 
  testCloaking, 
  CLOAKING_CONFIG,
  isBoltEnvironment,
  isTrafficAllowed 
} from '../utils/cloaking';

export const CloakingStatusPanel: React.FC = () => {
  const [cloakingStatus, setCloakingStatus] = useState(getCloakingStatus());
  const [testCampaign, setTestCampaign] = useState('');
  const [testResult, setTestResult] = useState<boolean | null>(null);

  // Update status every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCloakingStatus(getCloakingStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleTestCampaign = () => {
    if (!testCampaign.trim()) return;
    
    const result = testCloaking(testCampaign);
    setTestResult(result);
    
    console.log(`🧪 Cloaking Test: Campaign "${testCampaign}" would be ${result ? 'ALLOWED' : 'BLOCKED'}`);
  };

  const getStatusIcon = (allowed: boolean) => {
    return allowed ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusColor = (allowed: boolean) => {
    return allowed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  const testUrls = [
    {
      name: 'Tráfego ABO (PERMITIDO)',
      url: `${window.location.origin}/?utm_campaign=ABO_test_campaign`,
      allowed: true
    },
    {
      name: 'Tráfego CBO (PERMITIDO)',
      url: `${window.location.origin}/?utm_campaign=CBO_facebook_ads`,
      allowed: true
    },
    {
      name: 'Tráfego sem ABO/CBO (BLOQUEADO)',
      url: `${window.location.origin}/?utm_campaign=generic_campaign`,
      allowed: false
    },
    {
      name: 'Sem utm_campaign (BLOQUEADO)',
      url: `${window.location.origin}/`,
      allowed: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Sistema de Cloaking - Filtro de Tráfego
            </h2>
            <p className="text-gray-600 mt-1">
              Redireciona para Google se utm_campaign não contiver ABO ou CBO
            </p>
          </div>
          <button
            onClick={() => setCloakingStatus(getCloakingStatus())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        {/* Current Status */}
        <div className={`border rounded-lg p-4 ${getStatusColor(cloakingStatus.trafficAllowed)}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {getStatusIcon(cloakingStatus.trafficAllowed)}
              Status Atual do Tráfego
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              cloakingStatus.enabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {cloakingStatus.enabled ? '🛡️ ATIVO' : '🔧 BOLT MODE'}
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
              <strong>Sistema:</strong> 
              <span className={`ml-2 font-mono ${cloakingStatus.enabled ? 'text-green-600' : 'text-yellow-600'}`}>
                {cloakingStatus.enabled ? '✅ Enabled' : '⚠️ Disabled (Bolt)'}
              </span>
            </div>
            <div>
              <strong>Campaign atual:</strong> 
              <span className="ml-2 font-mono text-blue-600">
                {cloakingStatus.currentCampaign || 'Não presente'}
              </span>
            </div>
            <div>
              <strong>Tráfego:</strong> 
              <span className={`ml-2 font-mono font-bold ${cloakingStatus.trafficAllowed ? 'text-green-600' : 'text-red-600'}`}>
                {cloakingStatus.trafficAllowed ? '✅ PERMITIDO' : '❌ SERIA BLOQUEADO'}
              </span>
            </div>
          </div>
        </div>

        {/* Bolt Environment Warning */}
        {!cloakingStatus.enabled && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Ambiente Bolt Detectado</span>
            </div>
            <p className="text-blue-700 text-sm">
              O cloaking está <strong>DESABILITADO</strong> no ambiente Bolt para permitir desenvolvimento e testes.
              Em produção, este sistema estará ativo e redirecionará tráfego não autorizado.
            </p>
          </div>
        )}
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configuração do Cloaking</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Palavras-chave Permitidas:</label>
              <div className="mt-1 space-y-2">
                {cloakingStatus.allowedKeywords.map((keyword, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded px-3 py-2">
                    <span className="font-mono text-green-800">{keyword}</span>
                    <span className="text-green-600 text-xs ml-2">
                      (utm_campaign deve conter esta palavra)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">URL de Redirecionamento:</label>
              <div className="mt-1">
                <div className="bg-red-50 border border-red-200 rounded px-3 py-2">
                  <span className="font-mono text-red-800">{cloakingStatus.redirectUrl}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Como Funciona:</label>
              <div className="mt-1 space-y-2 text-sm text-gray-600">
                <p>• Verifica parâmetro <code>utm_campaign</code> na URL</p>
                <p>• Se não contiver <strong>ABO</strong> ou <strong>CBO</strong> → redireciona</p>
                <p>• Se não houver <code>utm_campaign</code> → redireciona</p>
                <p>• Desabilitado no ambiente Bolt para desenvolvimento</p>
                <p>• Verificação a cada 1 segundo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Campaign */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Teste de Campanhas
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="test-campaign" className="block text-sm font-medium text-gray-700 mb-2">
              Testar utm_campaign:
            </label>
            <div className="flex gap-3">
              <input
                id="test-campaign"
                type="text"
                value={testCampaign}
                onChange={(e) => setTestCampaign(e.target.value)}
                placeholder="Ex: ABO_facebook_ads ou generic_campaign"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleTestCampaign}
                disabled={!testCampaign.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Testar
              </button>
            </div>
          </div>
          
          {testResult !== null && (
            <div className={`border rounded-lg p-4 ${getStatusColor(testResult)}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResult)}
                <span className="font-semibold">
                  Resultado: {testResult ? 'PERMITIDO' : 'BLOQUEADO'}
                </span>
              </div>
              <p className="text-sm mt-1">
                Campaign "{testCampaign}" {testResult ? 'contém' : 'não contém'} palavras-chave permitidas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Test URLs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 URLs de Teste</h3>
        <p className="text-gray-600 mb-4">
          Use estas URLs para testar o sistema de cloaking:
        </p>
        
        <div className="space-y-3">
          {testUrls.map((testUrl, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getStatusColor(testUrl.allowed)}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(testUrl.allowed)}
                    <span className="font-medium text-gray-900">{testUrl.name}</span>
                  </div>
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
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 Instruções de Uso</h3>
        <div className="space-y-2 text-sm text-yellow-700">
          <p><strong>1. Desenvolvimento:</strong> Sistema desabilitado no Bolt para permitir testes</p>
          <p><strong>2. Produção:</strong> Sistema ativo, redireciona tráfego não autorizado</p>
          <p><strong>3. Campanhas Permitidas:</strong> Devem conter "ABO" ou "CBO" no utm_campaign</p>
          <p><strong>4. Redirecionamento:</strong> Tráfego bloqueado vai para google.com</p>
          <p><strong>5. Monitoramento:</strong> Verificação contínua a cada 1 segundo</p>
        </div>
        
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">⚠️ Importante:</h4>
          <div className="space-y-1 text-sm text-red-700">
            <p>• <strong>ABO:</strong> Average Budget Optimization (Facebook Ads)</p>
            <p>• <strong>CBO:</strong> Campaign Budget Optimization (Facebook Ads)</p>
            <p>• <strong>Apenas tráfego autorizado</strong> do Facebook Ads será permitido</p>
            <p>• <strong>Tráfego orgânico ou de outras fontes</strong> será redirecionado</p>
          </div>
        </div>
      </div>
    </div>
  );
};