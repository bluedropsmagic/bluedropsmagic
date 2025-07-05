import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, Calendar, Globe, MousePointer, TrendingUp, Users, Package, Clock } from 'lucide-react';

interface InternationalClickData {
  totalClicks: number;
  uniqueSessions: number;
  countryBreakdown: { [key: string]: number };
  packageBreakdown: { [key: string]: number };
  recentClicks: Array<{
    sessionId: string;
    country: string;
    countryCode: string;
    packageType: string;
    timestamp: string;
    ip: string;
  }>;
  topCountries: Array<{ country: string; count: number; flag: string }>;
}

export const InternationalClicksPanel: React.FC = () => {
  const [clickData, setClickData] = useState<InternationalClickData>({
    totalClicks: 0,
    uniqueSessions: 0,
    countryBreakdown: {},
    packageBreakdown: {},
    recentClicks: [],
    topCountries: []
  });
  
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Enhanced country flag mapping
  const getCountryFlag = (countryCode: string, countryName?: string) => {
    const countryFlags: { [key: string]: string } = {
      'BR': '🇧🇷', 'US': '🇺🇸', 'PT': '🇵🇹', 'ES': '🇪🇸', 'AR': '🇦🇷',
      'MX': '🇲🇽', 'CA': '🇨🇦', 'GB': '🇬🇧', 'FR': '🇫🇷', 'DE': '🇩🇪',
      'IT': '🇮🇹', 'JP': '🇯🇵', 'CN': '🇨🇳', 'IN': '🇮🇳', 'AU': '🇦🇺',
      'RU': '🇷🇺', 'KR': '🇰🇷', 'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴',
      'DK': '🇩🇰', 'FI': '🇫🇮', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'AT': '🇦🇹',
      'CH': '🇨🇭', 'BE': '🇧🇪', 'IE': '🇮🇪', 'GR': '🇬🇷', 'TR': '🇹🇷',
      'IL': '🇮🇱', 'SA': '🇸🇦', 'AE': '🇦🇪', 'EG': '🇪🇬', 'ZA': '🇿🇦',
      'NG': '🇳🇬', 'KE': '🇰🇪', 'MA': '🇲🇦', 'TN': '🇹🇳', 'DZ': '🇩🇿',
      'XX': '🌍', '': '🌍'
    };

    if (countryCode && countryFlags[countryCode.toUpperCase()]) {
      return countryFlags[countryCode.toUpperCase()];
    }

    const nameFlags: { [key: string]: string } = {
      'Brazil': '🇧🇷', 'United States': '🇺🇸', 'Portugal': '🇵🇹',
      'Spain': '🇪🇸', 'Argentina': '🇦🇷', 'Mexico': '🇲🇽',
      'Canada': '🇨🇦', 'United Kingdom': '🇬🇧', 'France': '🇫🇷',
      'Germany': '🇩🇪', 'Italy': '🇮🇹', 'Unknown': '🌍'
    };

    return nameFlags[countryName || 'Unknown'] || '🌍';
  };

  const fetchInternationalClicks = async (date: string) => {
    setLoading(true);
    try {
      console.log('🔍 Fetching international clicks for date:', date);
      
      // Query offer clicks excluding Brazilian IPs
      const { data: offerClicks, error } = await supabase
        .from('vsl_analytics')
        .select('session_id, event_data, country_code, country_name, ip, created_at')
        .eq('event_type', 'offer_click')
        .neq('country_code', 'BR')
        .neq('country_name', 'Brazil')
        .gte('created_at', `${date}T00:00:00.000Z`)
        .lt('created_at', `${date}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!offerClicks) {
        setClickData({
          totalClicks: 0,
          uniqueSessions: 0,
          countryBreakdown: {},
          packageBreakdown: {},
          recentClicks: [],
          topCountries: []
        });
        setLoading(false);
        return;
      }

      // Calculate metrics
      const totalClicks = offerClicks.length;
      const uniqueSessions = new Set(offerClicks.map(click => click.session_id)).size;
      
      // Country breakdown
      const countryBreakdown: { [key: string]: number } = {};
      const packageBreakdown: { [key: string]: number } = {};
      
      offerClicks.forEach(click => {
        const country = click.country_name || 'Unknown';
        const packageType = click.event_data?.offer_type || 'Unknown';
        
        countryBreakdown[country] = (countryBreakdown[country] || 0) + 1;
        packageBreakdown[packageType] = (packageBreakdown[packageType] || 0) + 1;
      });

      // Top countries with flags
      const topCountries = Object.entries(countryBreakdown)
        .map(([country, count]) => ({
          country,
          count,
          flag: getCountryFlag('', country)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Recent clicks
      const recentClicks = offerClicks.slice(0, 10).map(click => ({
        sessionId: click.session_id,
        country: click.country_name || 'Unknown',
        countryCode: click.country_code || 'XX',
        packageType: click.event_data?.offer_type || 'Unknown',
        timestamp: click.created_at,
        ip: click.ip || 'Unknown'
      }));

      setClickData({
        totalClicks,
        uniqueSessions,
        countryBreakdown,
        packageBreakdown,
        recentClicks,
        topCountries
      });

      setLastUpdated(new Date());
      console.log('✅ International clicks data loaded:', { totalClicks, uniqueSessions });

    } catch (error) {
      console.error('❌ Error fetching international clicks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternationalClicks(selectedDate);
  }, [selectedDate]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchInternationalClicks(selectedDate);
    }, 120000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR');
  };

  const maskIP = (ip: string) => {
    if (ip === 'Unknown') return ip;
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.**`;
    }
    return ip;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Cliques Internacionais em Botões de Compra
            </h2>
            <p className="text-gray-600 mt-1">
              Análise de cliques em ofertas de usuários fora do Brasil
            </p>
          </div>
          <button
            onClick={() => fetchInternationalClicks(selectedDate)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label htmlFor="international-date-select" className="text-sm font-medium text-gray-700">
              Data:
            </label>
          </div>
          <input
            id="international-date-select"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <span className="text-sm text-gray-500">
            Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total de Cliques</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">{clickData.totalClicks}</p>
            <p className="text-xs text-blue-600">cliques em ofertas</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Sessões Únicas</span>
            </div>
            <p className="text-2xl font-bold text-green-800">{clickData.uniqueSessions}</p>
            <p className="text-xs text-green-600">usuários únicos</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Países</span>
            </div>
            <p className="text-2xl font-bold text-purple-800">{Object.keys(clickData.countryBreakdown).length}</p>
            <p className="text-xs text-purple-600">países representados</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Taxa de Conversão</span>
            </div>
            <p className="text-2xl font-bold text-orange-800">
              {clickData.uniqueSessions > 0 ? ((clickData.totalClicks / clickData.uniqueSessions) * 100).toFixed(1) : '0.0'}%
            </p>
            <p className="text-xs text-orange-600">cliques por sessão</p>
          </div>
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Top Países por Cliques
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : clickData.topCountries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clickData.topCountries.map((country, index) => (
              <div key={country.country} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{country.country}</p>
                      <p className="text-sm text-gray-600">#{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">{country.count}</p>
                    <p className="text-xs text-gray-500">cliques</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum clique internacional registrado para esta data</p>
          </div>
        )}
      </div>

      {/* Package Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Breakdown por Pacote
        </h3>
        
        {Object.keys(clickData.packageBreakdown).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(clickData.packageBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([packageType, count]) => (
                <div key={packageType} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800 capitalize">{packageType}</p>
                    <p className="text-2xl font-bold text-blue-600">{count}</p>
                    <p className="text-sm text-gray-600">cliques</p>
                    <div className="mt-2 bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(count / clickData.totalClicks) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((count / clickData.totalClicks) * 100).toFixed(1)}% do total
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum dado de pacote disponível</p>
          </div>
        )}
      </div>

      {/* Recent Clicks Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Cliques Recentes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  País
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pacote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sessão
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clickData.recentClicks.length > 0 ? (
                clickData.recentClicks.map((click, index) => (
                  <tr key={`${click.sessionId}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(click.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{getCountryFlag(click.countryCode, click.country)}</span>
                        <span>{click.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {maskIP(click.ip)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {click.packageType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {click.sessionId.slice(-8)}...
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum clique recente encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">ℹ️ Sobre os Cliques Internacionais</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• <strong>Filtros aplicados:</strong> Apenas IPs fora do Brasil são contabilizados</p>
          <p>• <strong>Eventos rastreados:</strong> Cliques em botões de compra (offer_click)</p>
          <p>• <strong>Sessões únicas:</strong> Cada session_id é contado apenas uma vez</p>
          <p>• <strong>Atualização:</strong> Dados atualizados automaticamente a cada 2 minutos</p>
          <p>• <strong>Geolocalização:</strong> Baseada em APIs de detecção de IP</p>
          <p>• <strong>Privacidade:</strong> IPs são mascarados para proteção de dados</p>
        </div>
      </div>
    </div>
  );
};