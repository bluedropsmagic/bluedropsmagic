import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink, Eye, Target } from 'lucide-react';
import { getCidFromUrl, addCidToUrl, isPurchaseUrl, REDTRACK_CONFIG } from '../utils/redtrackIntegration';

export const RedTrackTestPanel: React.FC = () => {
  const [currentCid, setCurrentCid] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'success' | 'warning' | 'error';
    message: string;
    details?: string;
  }>>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);

  useEffect(() => {
    // Get current CID on component mount
    setCurrentCid(getCidFromUrl());
    
    // Run initial tests
    runAllTests();
  }, []);

  const runAllTests = async () => {
    setIsTestingAll(true);
    const results = [];

    // Test 1: CID Detection
    const cid = getCidFromUrl();
    if (cid) {
      results.push({
        test: 'CID Detection',
        status: 'success' as const,
        message: `CID detectado: ${cid}`,
        details: 'Parâmetro CID encontrado na URL atual'
      });
    } else {
      results.push({
        test: 'CID Detection',
        status: 'warning' as const,
        message: 'Nenhum CID na URL atual',
        details: 'Adicione ?cid=test123 para testar'
      });
    }

    // Test 2: RedTrack Script
    const redtrackScript = document.querySelector(`script[src*="${REDTRACK_CONFIG.domain}"]`);
    if (redtrackScript) {
      results.push({
        test: 'RedTrack Script',
        status: 'success' as const,
        message: 'Script RedTrack carregado',
        details: `Domínio: ${REDTRACK_CONFIG.domain}`
      });
    } else {
      results.push({
        test: 'RedTrack Script',
        status: 'error' as const,
        message: 'Script RedTrack não encontrado',
        details: 'Verifique se o script está no <head>'
      });
    }

    // Test 3: Purchase Links
    const purchaseLinks = document.querySelectorAll('a[href*="paybluedrops.com"], a[href*="cartpanda.com"]');
    if (purchaseLinks.length > 0) {
      const linksWithCid = Array.from(purchaseLinks).filter(link => 
        (link as HTMLAnchorElement).href.includes('cid=')
      );
      
      if (cid && linksWithCid.length > 0) {
        results.push({
          test: 'Purchase Links',
          status: 'success' as const,
          message: `${linksWithCid.length}/${purchaseLinks.length} links com CID`,
          details: 'Links de compra atualizados automaticamente'
        });
      } else if (cid) {
        results.push({
          test: 'Purchase Links',
          status: 'warning' as const,
          message: `${purchaseLinks.length} links encontrados, mas sem CID`,
          details: 'CID será adicionado automaticamente ao clicar'
        });
      } else {
        results.push({
          test: 'Purchase Links',
          status: 'warning' as const,
          message: `${purchaseLinks.length} links de compra encontrados`,
          details: 'Adicione CID na URL para testar atualização'
        });
      }
    } else {
      results.push({
        test: 'Purchase Links',
        status: 'error' as const,
        message: 'Nenhum link de compra encontrado',
        details: 'Verifique se os botões de compra estão carregados'
      });
    }

    // Test 4: URL Building
    const testUrl = 'https://pagamento.paybluedrops.com/checkout/176849703:1';
    const urlWithCid = addCidToUrl(testUrl, cid || 'test123');
    if (urlWithCid !== testUrl) {
      results.push({
        test: 'URL Building',
        status: 'success' as const,
        message: 'Função de adicionar CID funcionando',
        details: `Teste: ${testUrl} → ${urlWithCid}`
      });
    } else {
      results.push({
        test: 'URL Building',
        status: 'warning' as const,
        message: 'URL não foi modificada',
        details: 'Pode ser porque já contém CID ou CID não está presente'
      });
    }

    // Test 5: Cookie Domain
    if (window.location.hostname === REDTRACK_CONFIG.cookieDomain || 
        window.location.hostname.includes('localhost') ||
        window.location.hostname.includes('stackblitz') ||
        window.location.hostname.includes('bolt.new')) {
      results.push({
        test: 'Cookie Domain',
        status: 'success' as const,
        message: 'Domínio configurado corretamente',
        details: `Configurado para: ${REDTRACK_CONFIG.cookieDomain}`
      });
    } else {
      results.push({
        test: 'Cookie Domain',
        status: 'warning' as const,
        message: 'Domínio pode não corresponder',
        details: `Atual: ${window.location.hostname}, Configurado: ${REDTRACK_CONFIG.cookieDomain}`
      });
    }

    setTestResults(results);
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
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const testUrls = [
    {
      name: 'Teste básico com CID',
      url: `${window.location.origin}/?cid=test123`
    },
    {
      name: 'Teste com UTM + CID',
      url: `${window.location.origin}/?utm_source=redtrack&utm_campaign=test&cid=rt_12345`
    },
    {
      name: 'Teste página de upsell',
      url: `${window.location.origin}/up6bt?cid=upsell_test`
    },
    {
      name: 'Teste página de downsell',
      url: `${window.location.origin}/dws1?cid=downsell_test`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6" />
              RedTrack Integration Test
            </h2>
            <p className="text-gray-600 mt-1">
              Verificação completa da integração com RedTrack
            </p>
          </div>
          <button
            onClick={runAllTests}
            disabled={isTestingAll}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isTestingAll ? 'animate-spin' : ''}`} />
            Testar Tudo
          </button>
        </div>

        {/* Current CID Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">Status Atual do CID:</h3>
          {currentCid ? (
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="font-medium text-green-700">CID Detectado</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="font-medium text-yellow-700">Nenhum CID na URL</span>
            </div>
          )}
          
          <div className="bg-white p-3 rounded border border-blue-200">
            {currentCid ? (
              <>
                <strong>Valor:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{currentCid}</code>
                <div className="mt-2 text-green-600 text-xs">
                  ✅ Todos os links para Cartpanda serão automaticamente atualizados
                </div>
              </>
            ) : (
              <p className="text-yellow-700 text-sm">
                Para testar, adicione <code>?cid=test123</code> na URL
              </p>
            )}
          </div>
        </div>

        {/* RedTrack Configuration */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Configuração RedTrack:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Domínio:</strong> <code>{REDTRACK_CONFIG.domain}</code>
            </div>
            <div>
              <strong>Cookie Domain:</strong> <code>{REDTRACK_CONFIG.cookieDomain}</code>
            </div>
            <div>
              <strong>Attribution:</strong> <code>{REDTRACK_CONFIG.attribution}</code>
            </div>
            <div>
              <strong>Cookie Duration:</strong> <code>{REDTRACK_CONFIG.cookieDuration} dias</code>
            </div>
            <div>
              <strong>Campaign ID:</strong> <code>{REDTRACK_CONFIG.defaultCampaignId}</code>
            </div>
            <div>
              <strong>Reg View Once:</strong> <code>{REDTRACK_CONFIG.regViewOnce ? 'true' : 'false'}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`border rounded-xl p-6 transition-all duration-300 ${getStatusColor(result.status)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{result.test}</h3>
                {result.details && (
                  <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                )}
              </div>
              {getStatusIcon(result.status)}
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-800">{result.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Test URLs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          URLs de Teste
        </h3>
        <p className="text-gray-600 mb-4">
          Use estas URLs para testar a integração RedTrack:
        </p>
        
        <div className="space-y-3">
          {testUrls.map((testUrl, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">{testUrl.name}:</p>
                  <code className="text-sm text-blue-600 break-all">
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

      {/* Integration Guide */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-3">🔗 Como Funciona a Integração:</h3>
        <div className="space-y-2 text-sm text-green-700">
          <p>• <strong>Script Universal:</strong> Carregado no &lt;head&gt; de todas as páginas</p>
          <p>• <strong>Detecção Automática:</strong> CID é detectado automaticamente na URL</p>
          <p>• <strong>Links &lt;a&gt;:</strong> CID adicionado automaticamente a links da Cartpanda</p>
          <p>• <strong>Botões:</strong> CID incluído em redirecionamentos via data-href</p>
          <p>• <strong>Window.open:</strong> Interceptado e CID adicionado automaticamente</p>
          <p>• <strong>Navegação:</strong> CID preservado entre páginas (upsells/downsells)</p>
          <p>• <strong>Monitoramento:</strong> Observer detecta novos elementos dinamicamente</p>
          <p>• <strong>Checkout:</strong> Tracking de conversão no thank you page</p>
        </div>
      </div>

      {/* Debug Console */}
      <div className="bg-gray-900 text-green-400 rounded-xl p-6 font-mono text-sm">
        <h3 className="text-white font-bold mb-3">🖥️ Console de Debug:</h3>
        <div className="space-y-1">
          <p>🎯 RedTrack CID detected: {currentCid || 'null'}</p>
          <p>🔗 Purchase links found: {document.querySelectorAll('a[href*="paybluedrops.com"], a[href*="cartpanda.com"]').length}</p>
          <p>📊 Script loaded: {document.querySelector(`script[src*="${REDTRACK_CONFIG.domain}"]`) ? 'true' : 'false'}</p>
          <p>🌐 Current domain: {window.location.hostname}</p>
          <p>⚙️ Integration status: {currentCid ? 'ACTIVE' : 'STANDBY'}</p>
        </div>
      </div>
    </div>
  );
};