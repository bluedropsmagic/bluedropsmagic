import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, safeSupabaseOperation } from '../lib/supabase';
import { RefreshCw, Users, Globe, Clock, Activity, MapPin, Eye } from 'lucide-react';

interface LiveUser {
  session_id: string;
  country_name: string;
  country_code: string;
  city: string;
  region: string;
  last_ping: string;
  created_at: string;
  current_page: string;
  time_on_site: number;
}

interface LiveUsersStats {
  total: number;
  byCountry: { [country: string]: number };
  byPage: { [page: string]: number };
  averageTimeOnSite: number;
}

interface LiveUsersPanelProps {
  className?: string;
}

export const LiveUsersPanel: React.FC<LiveUsersPanelProps> = ({ className = '' }) => {
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [stats, setStats] = useState<LiveUsersStats>({
    total: 0,
    byCountry: {},
    byPage: {},
    averageTimeOnSite: 0
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLiveUsers = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        console.warn('⚠️ Supabase not configured, using empty live users data');
        setLiveUsers([]);
        setStats({
          total: 0,
          byCountry: {},
          byPage: {},
          averageTimeOnSite: 0
        });
        setLoading(false);
        return;
      }
      
      // Get users active in the last 2 minutes (excluding Brazilian IPs)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      
      const activeUsers = await safeSupabaseOperation(async () => {
        if (!supabase) throw new Error('Supabase client not available');
        
        const { data, error } = await supabase
          .from('vsl_analytics')
          .select('session_id, country_name, country_code, city, region, last_ping, created_at, event_data')
          .neq('country_code', 'BR')
          .neq('country_name', 'Brazil')
          .gte('last_ping', twoMinutesAgo)
          .order('last_ping', { ascending: false });
        
        if (error) throw error;
        return data;
      });

      if (!activeUsers) {
        setLiveUsers([]);
        setStats({
          total: 0,
          byCountry: {},
          byPage: {},
          averageTimeOnSite: 0
        });
        setLoading(false);
        return;
      }

      // Group by session_id to get unique users
      const uniqueUsers = new Map<string, LiveUser>();
      
      activeUsers.forEach(user => {
        const sessionId = user.session_id;
        const currentPage = user.event_data?.current_path || user.event_data?.page || '/';
        const timeOnSite = Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / 1000);
        
        // Keep the most recent ping for each session
        if (!uniqueUsers.has(sessionId) || 
            new Date(user.last_ping) > new Date(uniqueUsers.get(sessionId)!.last_ping)) {
          uniqueUsers.set(sessionId, {
            session_id: sessionId,
            country_name: user.country_name || 'Unknown',
            country_code: user.country_code || 'XX',
            city: user.city || 'Unknown',
            region: user.region || 'Unknown',
            last_ping: user.last_ping,
            created_at: user.created_at,
            current_page: currentPage,
            time_on_site: timeOnSite
          });
        }
      });

      const liveUsersArray = Array.from(uniqueUsers.values());
      
      // Calculate stats
      const byCountry: { [country: string]: number } = {};
      const byPage: { [page: string]: number } = {};
      let totalTimeOnSite = 0;

      liveUsersArray.forEach(user => {
        // Count by country
        const country = user.country_name || 'Unknown';
        byCountry[country] = (byCountry[country] || 0) + 1;
        
        // Count by page
        const page = user.current_page || '/';
        const pageName = getPageName(page);
        byPage[pageName] = (byPage[pageName] || 0) + 1;
        
        // Sum time on site
        totalTimeOnSite += user.time_on_site;
      });

      const averageTimeOnSite = liveUsersArray.length > 0 ? totalTimeOnSite / liveUsersArray.length : 0;

      setLiveUsers(liveUsersArray);
      setStats({
        total: liveUsersArray.length,
        byCountry,
        byPage,
        averageTimeOnSite
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching live users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPageName = (path: string): string => {
    if (path === '/' || path === '/home') return 'Home Page';
    if (path.includes('/up1bt')) return 'Upsell 1BT';
    if (path.includes('/up3bt')) return 'Upsell 3BT';
    if (path.includes('/up6bt')) return 'Upsell 6BT';
    if (path.includes('/upig1bt')) return 'Second Upsell 1BT';
    if (path.includes('/upig3bt')) return 'Second Upsell 3BT';
    if (path.includes('/upig6bt')) return 'Second Upsell 6BT';
    if (path.includes('/dws1')) return 'Downsell 1';
    if (path.includes('/dws2')) return 'Downsell 2';
    if (path.includes('/dw3')) return 'Downsell 3';
    if (path.includes('/admin')) return 'Admin Dashboard';
    if (path.includes('/thankyou')) return 'Thank You Page';
    return path;
  };

  const formatTimeOnSite = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getCountryFlag = (countryCode: string): string => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'CA': '🇨🇦',
      'GB': '🇬🇧',
      'DE': '🇩🇪',
      'FR': '🇫🇷',
      'IT': '🇮🇹',
      'ES': '🇪🇸',
      'MX': '🇲🇽',
      'AR': '🇦🇷',
      'AU': '🇦🇺',
      'JP': '🇯🇵',
      'KR': '🇰🇷',
      'IN': '🇮🇳',
      'XX': '🌍'
    };
    return flags[countryCode] || '🌍';
  };

  const formatLastSeen = (lastPing: string): string => {
    const now = new Date();
    const pingTime = new Date(lastPing);
    const diffSeconds = Math.floor((now.getTime() - pingTime.getTime()) / 1000);
    
    if (diffSeconds < 30) return 'Agora mesmo';
    if (diffSeconds < 60) return `${diffSeconds}s atrás`;
    if (diffSeconds < 120) return `${Math.floor(diffSeconds / 60)}m atrás`;
    return pingTime.toLocaleTimeString('pt-BR');
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchLiveUsers();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLiveUsers();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                👥 Usuários Ativos Agora
              </h3>
              <p className="text-sm text-gray-600">
                Usuários ativos nos últimos 2 minutos
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-700">Auto-refresh</span>
            </label>
            
            <button
              onClick={fetchLiveUsers}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Total Ativo</span>
            </div>
            <p className="text-3xl font-bold text-green-800">{stats.total}</p>
            <p className="text-xs text-green-600">usuários online</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Países</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">{Object.keys(stats.byCountry).length}</p>
            <p className="text-xs text-blue-600">países diferentes</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Páginas</span>
            </div>
            <p className="text-2xl font-bold text-purple-800">{Object.keys(stats.byPage).length}</p>
            <p className="text-xs text-purple-600">páginas ativas</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Tempo Médio</span>
            </div>
            <p className="text-xl font-bold text-orange-800">{formatTimeOnSite(stats.averageTimeOnSite)}</p>
            <p className="text-xs text-orange-600">no site</p>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          🔄 Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')} 
          {autoRefresh && <span className="ml-2">• Auto-refresh ativo (30s)</span>}
        </div>
      </div>

      {/* Live Users Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
              <p className="text-gray-600">Carregando usuários ativos...</p>
            </div>
          </div>
        ) : (
          <>
            {stats.total > 0 ? (
              <div className="space-y-6">
                {/* Country Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Breakdown por País
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(stats.byCountry)
                      .sort(([,a], [,b]) => b - a)
                      .map(([country, count]) => {
                        const countryCode = liveUsers.find(u => u.country_name === country)?.country_code || 'XX';
                        return (
                          <div key={country} className="bg-white p-3 rounded border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getCountryFlag(countryCode)}</span>
                              <span className="text-sm font-medium text-gray-900 truncate">{country}</span>
                            </div>
                            <p className="text-lg font-bold text-green-600">{count}</p>
                            <p className="text-xs text-gray-500">usuário{count !== 1 ? 's' : ''}</p>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Page Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Breakdown por Página
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(stats.byPage)
                      .sort(([,a], [,b]) => b - a)
                      .map(([page, count]) => (
                        <div key={page} className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{page}</span>
                          </div>
                          <p className="text-lg font-bold text-blue-600">{count}</p>
                          <p className="text-xs text-gray-500">usuário{count !== 1 ? 's' : ''}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Individual Users */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Usuários Individuais ({stats.total})
                  </h4>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {liveUsers.map((user, index) => (
                      <div key={user.session_id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-bold text-sm">{index + 1}</span>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{getCountryFlag(user.country_code)}</span>
                                <span className="font-medium text-gray-900">{user.country_name}</span>
                                {user.city !== 'Unknown' && (
                                  <span className="text-gray-500 text-sm">• {user.city}</span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{getPageName(user.current_page)}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTimeOnSite(user.time_on_site)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 font-medium">ONLINE</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatLastSeen(user.last_ping)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhum usuário ativo no momento
                </h3>
                <p className="text-gray-500 mb-4">
                  Usuários aparecerão aqui quando estiverem navegando no site
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-700 text-sm">
                    <strong>Como funciona:</strong> Usuários são considerados ativos se fizeram ping nos últimos 2 minutos
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const formatLastSeen = (lastPing: string): string => {
  const now = new Date();
  const pingTime = new Date(lastPing);
  const diffSeconds = Math.floor((now.getTime() - pingTime.getTime()) / 1000);
  
  if (diffSeconds < 30) return 'Agora mesmo';
  if (diffSeconds < 60) return `${diffSeconds}s atrás`;
  if (diffSeconds < 120) return `${Math.floor(diffSeconds / 60)}m atrás`;
  return pingTime.toLocaleTimeString('pt-BR');
};