import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, TrendingUp, Users, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';

interface SessionData {
  page_type: string;
  page_variant: string;
  unique_sessions: number;
  total_page_views: number;
  last_visit: string;
}

interface UpsellDownsellSessionsProps {
  className?: string;
}

export const UpsellDownsellSessions: React.FC<UpsellDownsellSessionsProps> = ({ className = '' }) => {
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    'second-upsell': false,
    'upsell': false,
    'downsell': false
  });
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchSessionData = async (date: string) => {
    setLoading(true);
    try {
      // Get all page_enter events for upsell and downsell pages, excluding Brazilian IPs
      const { data: pageEnters, error } = await supabase
        .from('vsl_analytics')
        .select('session_id, event_data, created_at, country_code, country_name')
        .eq('event_type', 'page_enter')
        .neq('country_code', 'BR')
        .neq('country_name', 'Brazil')
        .gte('created_at', `${date}T00:00:00.000Z`)
        .lt('created_at', `${date}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter for upsell and downsell pages only
      const relevantPages = (pageEnters || []).filter(event => {
        const eventData = event.event_data || {};
        const currentPath = eventData.current_path || eventData.page || '';
        
        return currentPath.includes('/up') || 
               currentPath.includes('/dws') || 
               currentPath.includes('/dw3') ||
               currentPath.includes('/upig');
      });

      // Group by page type and count unique sessions
      const pageGroups: { [key: string]: { sessions: Set<string>, events: any[] } } = {};

      relevantPages.forEach(event => {
        const eventData = event.event_data || {};
        const currentPath = eventData.current_path || eventData.page || '';
        
        let pageType = 'unknown';
        let pageVariant = '';
        
        if (currentPath.includes('/upig1bt')) {
          pageType = 'Second Upsell';
          pageVariant = 'UPIG1BT';
        } else if (currentPath.includes('/upig3bt')) {
          pageType = 'Second Upsell';
          pageVariant = 'UPIG3BT';
        } else if (currentPath.includes('/upig6bt')) {
          pageType = 'Second Upsell';
          pageVariant = 'UPIG6BT';
        } else if (currentPath.includes('/up1bt')) {
          pageType = 'Upsell';
          pageVariant = 'UP1BT';
        } else if (currentPath.includes('/up3bt')) {
          pageType = 'Upsell';
          pageVariant = 'UP3BT';
        } else if (currentPath.includes('/up6bt')) {
          pageType = 'Upsell';
          pageVariant = 'UP6BT';
        } else if (currentPath.includes('/dws1')) {
          pageType = 'Downsell';
          pageVariant = 'DWS1';
        } else if (currentPath.includes('/dws2')) {
          pageType = 'Downsell';
          pageVariant = 'DWS2';
        } else if (currentPath.includes('/dw3')) {
          pageType = 'Downsell';
          pageVariant = 'DW3';
        }
        
        const key = `${pageType}-${pageVariant}`;
        
        if (!pageGroups[key]) {
          pageGroups[key] = {
            sessions: new Set(),
            events: []
          };
        }
        
        pageGroups[key].sessions.add(event.session_id);
        pageGroups[key].events.push(event);
      });

      // Convert to array format
      const sessionDataArray: SessionData[] = Object.entries(pageGroups).map(([key, data]) => {
        const [pageType, pageVariant] = key.split('-');
        const sortedEvents = data.events.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        return {
          page_type: pageType,
          page_variant: pageVariant,
          unique_sessions: data.sessions.size,
          total_page_views: data.events.length,
          last_visit: sortedEvents[0]?.created_at || ''
        };
      });

      // Sort by page type and variant
      sessionDataArray.sort((a, b) => {
        if (a.page_type !== b.page_type) {
          const order = ['Second Upsell', 'Upsell', 'Downsell'];
          return order.indexOf(a.page_type) - order.indexOf(b.page_type);
        }
        return a.page_variant.localeCompare(b.page_variant);
      });

      setSessionData(sessionDataArray);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching session data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData(selectedDate);
  }, [selectedDate]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessionData(selectedDate);
    }, 120000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPageTypeIcon = (pageType: string) => {
    switch (pageType) {
      case 'Second Upsell':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'Upsell':
        return <ArrowUp className="w-4 h-4 text-blue-600" />;
      case 'Downsell':
        return <ArrowDown className="w-4 h-4 text-orange-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPageTypeColor = (pageType: string) => {
    switch (pageType) {
      case 'Second Upsell':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'Upsell':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Downsell':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const formatLastVisit = (dateString: string) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const getTotalSessions = () => {
    return sessionData.reduce((sum, item) => sum + item.unique_sessions, 0);
  };

  const getTotalPageViews = () => {
    return sessionData.reduce((sum, item) => sum + item.total_page_views, 0);
  };

  // Group data by page type
  const groupedData = {
    'second-upsell': sessionData.filter(item => item.page_type === 'Second Upsell'),
    'upsell': sessionData.filter(item => item.page_type === 'Upsell'),
    'downsell': sessionData.filter(item => item.page_type === 'Downsell')
  };

  const getSectionStats = (sectionData: SessionData[]) => {
    return {
      totalSessions: sectionData.reduce((sum, item) => sum + item.unique_sessions, 0),
      totalPageViews: sectionData.reduce((sum, item) => sum + item.total_page_views, 0),
      pageCount: sectionData.length
    };
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sessões por Página - Upsells & Downsells
          </h3>
          <button
            onClick={() => fetchSessionData(selectedDate)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="session-date-select" className="text-sm font-medium text-gray-700">
            Data:
          </label>
          <input
            id="session-date-select"
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total de Sessões</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">{getTotalSessions()}</p>
            <p className="text-xs text-blue-600">sessões únicas</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Total de Visualizações</span>
            </div>
            <p className="text-2xl font-bold text-green-800">{getTotalPageViews()}</p>
            <p className="text-xs text-green-600">page views</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Páginas Ativas</span>
            </div>
            <p className="text-2xl font-bold text-purple-800">{sessionData.length}</p>
            <p className="text-xs text-purple-600">com tráfego</p>
          </div>
        </div>
      </div>

      {/* Session Data Table */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando dados de sessões...</p>
            </div>
          </div>
        ) : (
          <>
            {sessionData.length > 0 ? (
              <div className="space-y-6">
                {/* Second Upsell Section */}
                <div className="border border-purple-200 rounded-lg">
                  <div 
                    className="bg-purple-50 p-4 cursor-pointer hover:bg-purple-100 transition-colors rounded-t-lg"
                    onClick={() => toggleSection('second-upsell')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <div>
                          <h4 className="font-semibold text-purple-900">
                            🟠 Second Upsells (IGNITEMEN)
                          </h4>
                          <p className="text-sm text-purple-700">
                            Páginas UPIG - Ofertas de testosterone support
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {(() => {
                          const stats = getSectionStats(groupedData['second-upsell']);
                          return (
                            <div className="text-right text-sm">
                              <p className="font-bold text-purple-800">{stats.totalSessions} sessões</p>
                              <p className="text-purple-600">{stats.pageCount} páginas ativas</p>
                            </div>
                          );
                        })()}
                        
                        {expandedSections['second-upsell'] ? (
                          <ChevronUp className="w-5 h-5 text-purple-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedSections['second-upsell'] && (
                    <div className="p-4 space-y-3 border-t border-purple-200">
                      {groupedData['second-upsell'].length > 0 ? (
                        groupedData['second-upsell'].map((item) => (
                          <div
                            key={`${item.page_type}-${item.page_variant}`}
                            className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <span className="text-purple-600 font-bold text-sm">
                                    {item.page_variant.replace('UPIG', '')}
                                  </span>
                                </div>
                                <div>
                                  <h5 className="font-semibold text-purple-900">
                                    /{item.page_variant.toLowerCase()}
                                  </h5>
                                  <p className="text-xs text-purple-600">
                                    Second Upsell Page
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="font-bold text-purple-900">{item.unique_sessions}</p>
                                    <p className="text-purple-600 text-xs">Sessões</p>
                                  </div>
                                  <div>
                                    <p className="font-bold text-purple-900">{item.total_page_views}</p>
                                    <p className="text-purple-600 text-xs">Views</p>
                                  </div>
                                </div>
                                <p className="text-xs text-purple-500 mt-1">
                                  {formatLastVisit(item.last_visit)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-purple-600 text-sm text-center py-4">
                          Nenhuma sessão registrada para second upsells hoje
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Original Upsell Section */}
                <div className="border border-blue-200 rounded-lg">
                  <div 
                    className="bg-blue-50 p-4 cursor-pointer hover:bg-blue-100 transition-colors rounded-t-lg"
                    onClick={() => toggleSection('upsell')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ArrowUp className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-blue-900">
                            📦 Upsells Originais
                          </h4>
                          <p className="text-sm text-blue-700">
                            Páginas UP - Ofertas de mais frascos BlueDrops
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {(() => {
                          const stats = getSectionStats(groupedData['upsell']);
                          return (
                            <div className="text-right text-sm">
                              <p className="font-bold text-blue-800">{stats.totalSessions} sessões</p>
                              <p className="text-blue-600">{stats.pageCount} páginas ativas</p>
                            </div>
                          );
                        })()}
                        
                        {expandedSections['upsell'] ? (
                          <ChevronUp className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedSections['upsell'] && (
                    <div className="p-4 space-y-3 border-t border-blue-200">
                      {groupedData['upsell'].length > 0 ? (
                        groupedData['upsell'].map((item) => (
                          <div
                            key={`${item.page_type}-${item.page_variant}`}
                            className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="text-blue-600 font-bold text-sm">
                                    {item.page_variant.replace('UP', '').replace('BT', '')}
                                  </span>
                                </div>
                                <div>
                                  <h5 className="font-semibold text-blue-900">
                                    /{item.page_variant.toLowerCase()}
                                  </h5>
                                  <p className="text-xs text-blue-600">
                                    Upsell Page
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="font-bold text-blue-900">{item.unique_sessions}</p>
                                    <p className="text-blue-600 text-xs">Sessões</p>
                                  </div>
                                  <div>
                                    <p className="font-bold text-blue-900">{item.total_page_views}</p>
                                    <p className="text-blue-600 text-xs">Views</p>
                                  </div>
                                </div>
                                <p className="text-xs text-blue-500 mt-1">
                                  {formatLastVisit(item.last_visit)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-blue-600 text-sm text-center py-4">
                          Nenhuma sessão registrada para upsells hoje
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Downsell Section */}
                <div className="border border-orange-200 rounded-lg">
                  <div 
                    className="bg-orange-50 p-4 cursor-pointer hover:bg-orange-100 transition-colors rounded-t-lg"
                    onClick={() => toggleSection('downsell')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ArrowDown className="w-5 h-5 text-orange-600" />
                        <div>
                          <h4 className="font-semibold text-orange-900">
                            💰 Downsells
                          </h4>
                          <p className="text-sm text-orange-700">
                            Páginas DWS/DW3 - Ofertas de desconto
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {(() => {
                          const stats = getSectionStats(groupedData['downsell']);
                          return (
                            <div className="text-right text-sm">
                              <p className="font-bold text-orange-800">{stats.totalSessions} sessões</p>
                              <p className="text-orange-600">{stats.pageCount} páginas ativas</p>
                            </div>
                          );
                        })()}
                        
                        {expandedSections['downsell'] ? (
                          <ChevronUp className="w-5 h-5 text-orange-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedSections['downsell'] && (
                    <div className="p-4 space-y-3 border-t border-orange-200">
                      {groupedData['downsell'].length > 0 ? (
                        groupedData['downsell'].map((item) => (
                          <div
                            key={`${item.page_type}-${item.page_variant}`}
                            className="bg-orange-50 border border-orange-200 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <span className="text-orange-600 font-bold text-sm">
                                    {item.page_variant.replace('DWS', 'D').replace('DW', 'D')}
                                  </span>
                                </div>
                                <div>
                                  <h5 className="font-semibold text-orange-900">
                                    /{item.page_variant.toLowerCase()}
                                  </h5>
                                  <p className="text-xs text-orange-600">
                                    Downsell Page
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="font-bold text-orange-900">{item.unique_sessions}</p>
                                    <p className="text-orange-600 text-xs">Sessões</p>
                                  </div>
                                  <div>
                                    <p className="font-bold text-orange-900">{item.total_page_views}</p>
                                    <p className="text-orange-600 text-xs">Views</p>
                                  </div>
                                </div>
                                <p className="text-xs text-orange-500 mt-1">
                                  {formatLastVisit(item.last_visit)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-orange-600 text-sm text-center py-4">
                          Nenhuma sessão registrada para downsells hoje
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg mb-2">
                  📊 Nenhuma sessão registrada para esta data
                </p>
                <p className="text-gray-500 text-sm">
                  Selecione uma data diferente ou aguarde novas visitas às páginas de upsell/downsell
                </p>
              </div>
            )}

            {/* Info */}
            <div className="mt-4 text-center text-xs text-gray-500">
              🔄 Atualização automática a cada 2 minutos • 🇧🇷 IPs brasileiros excluídos
            </div>
          </>
        )}
      </div>
    </div>
  );
};