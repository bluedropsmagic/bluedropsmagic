import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  RefreshCw,
  Calendar,
  LogOut,
  Lock,
  Eye,
  ShoppingCart,
  TrendingUp,
  Play,
  BarChart3,
  Target,
  Activity,
  Globe,
  Clock,
  UserCheck
} from 'lucide-react';

interface DashboardData {
  // Visitas e Sessões
  totalVisits: number;
  uniqueVisitors: number;
  liveUsers: number;
  
  // Vídeo
  videoViews: number;
  videoPlayRate: number;
  
  // Conversões
  totalPurchases: number;
  conversionRate: number;
  purchasesByProduct: {
    '6-bottle': number;
    '3-bottle': number;
    '1-bottle': number;
  };
  
  // Engajamento
  averageTimeOnPage: number;
  pitchReached: number;
  leadReached: number;
  
  // Geografia
  topCountries: Array<{ country: string; count: number; flag: string }>;
  
  // Sessões recentes
  recentSessions: any[];
}

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalVisits: 0,
    uniqueVisitors: 0,
    liveUsers: 0,
    videoViews: 0,
    videoPlayRate: 0,
    totalPurchases: 0,
    conversionRate: 0,
    purchasesByProduct: {
      '6-bottle': 0,
      '3-bottle': 0,
      '1-bottle': 0,
    },
    averageTimeOnPage: 0,
    pitchReached: 0,
    leadReached: 0,
    topCountries: [],
    recentSessions: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = sessionStorage.getItem('admin_authenticated') === 'true';
      const loginTime = sessionStorage.getItem('admin_login_time');
      
      if (isLoggedIn && loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (now - loginTimestamp < twentyFourHours) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem('admin_authenticated');
          sessionStorage.removeItem('admin_login_time');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    await new Promise(resolve => setTimeout(resolve, 500));

    if (loginEmail === 'admin@magicbluedrops.com' && loginPassword === 'gotinhaazul') {
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_login_time', Date.now().toString());
      setIsAuthenticated(true);
      setLoginEmail('');
      setLoginPassword('');
      console.log('✅ Admin login successful');
    } else {
      setLoginError('Email ou senha incorretos');
      console.log('❌ Admin login failed - incorrect credentials');
    }
    
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_login_time');
    setIsAuthenticated(false);
    navigate('/');
  };

  // Enhanced country flag mapping
  const getCountryFlag = (countryCode: string, countryName?: string) => {
    const countryFlags: { [key: string]: string } = {
      'BR': '🇧🇷', 'US': '🇺🇸', 'PT': '🇵🇹', 'ES': '🇪🇸', 'AR': '🇦🇷',
      'MX': '🇲🇽', 'CA': '🇨🇦', 'GB': '🇬🇧', 'FR': '🇫🇷', 'DE': '🇩🇪',
      'IT': '🇮🇹', 'JP': '🇯🇵', 'CN': '🇨🇳', 'IN': '🇮🇳', 'AU': '🇦🇺',
      'RU': '🇷🇺', 'KR': '🇰🇷', 'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴',
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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get all analytics data excluding Brazilian IPs
      const { data: allEvents, error } = await supabase
        .from('vsl_analytics')
        .select('*')
        .neq('country_code', 'BR')
        .neq('country_name', 'Brazil')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!allEvents) {
        setLoading(false);
        return;
      }

      // Group events by session
      const sessionGroups = allEvents.reduce((acc, event) => {
        if (!acc[event.session_id]) {
          acc[event.session_id] = [];
        }
        acc[event.session_id].push(event);
        return acc;
      }, {} as Record<string, any[]>);

      const sessions = Object.values(sessionGroups);
      const totalVisits = sessions.length;
      const uniqueVisitors = totalVisits; // Each session = unique visitor

      // Calculate live users (users active in last 2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const liveSessionsMap = new Map();
      allEvents.forEach(event => {
        if (event.last_ping && new Date(event.last_ping) > twoMinutesAgo) {
          const sessionId = event.session_id;
          if (!liveSessionsMap.has(sessionId) || 
              new Date(event.last_ping) > new Date(liveSessionsMap.get(sessionId).last_ping)) {
            liveSessionsMap.set(sessionId, event);
          }
        }
      });
      const liveUsers = liveSessionsMap.size;

      // Video metrics
      const videoPlayEvents = allEvents.filter(event => event.event_type === 'video_play');
      const videoViews = videoPlayEvents.length;
      const videoPlayRate = totalVisits > 0 ? (videoViews / totalVisits) * 100 : 0;

      // Purchase metrics
      const purchaseEvents = allEvents.filter(event => 
        event.event_type === 'offer_click' && 
        event.event_data?.offer_type &&
        event.event_data.offer_type.includes('upsell') &&
        event.event_data.offer_type.includes('accept')
      );
      const totalPurchases = purchaseEvents.length;
      const conversionRate = totalVisits > 0 ? (totalPurchases / totalVisits) * 100 : 0;

      // Purchases by product
      const purchasesByProduct = {
        '6-bottle': purchaseEvents.filter(e => e.event_data?.offer_type?.includes('6-bottle')).length,
        '3-bottle': purchaseEvents.filter(e => e.event_data?.offer_type?.includes('3-bottle')).length,
        '1-bottle': purchaseEvents.filter(e => e.event_data?.offer_type?.includes('1-bottle')).length,
      };

      // Engagement metrics
      const pitchReachedEvents = allEvents.filter(event => event.event_type === 'pitch_reached');
      const pitchReached = pitchReachedEvents.length;

      const leadReachedEvents = allEvents.filter(event => 
        event.event_type === 'video_progress' && 
        event.event_data?.milestone === 'lead_reached'
      );
      const leadReached = leadReachedEvents.length;

      // Average time on page
      const pageExitEvents = allEvents.filter(event => 
        event.event_type === 'page_exit' && 
        event.event_data?.total_time_on_page_ms
      );
      const totalTimeOnPage = pageExitEvents.reduce((sum, event) => 
        sum + (event.event_data.total_time_on_page_ms || 0), 0
      );
      const averageTimeOnPage = pageExitEvents.length > 0 ? 
        totalTimeOnPage / pageExitEvents.length / 1000 : 0; // Convert to seconds

      // Top countries
      const countryStats = sessions.reduce((acc, session) => {
        const event = session.find(e => e.country_name) || session[0];
        const country = event.country_name || 'Unknown';
        const countryCode = event.country_code || 'XX';
        
        if (!acc[country]) {
          acc[country] = { count: 0, countryCode };
        }
        acc[country].count++;
        return acc;
      }, {} as { [key: string]: { count: number; countryCode: string } });

      const topCountries = Object.entries(countryStats)
        .map(([country, data]) => ({
          country,
          count: data.count,
          flag: getCountryFlag(data.countryCode, country)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent sessions
      const recentSessions = sessions.slice(0, 10).map(session => {
        const pageEnter = session.find(e => e.event_type === 'page_enter');
        const videoPlay = session.find(e => e.event_type === 'video_play');
        const offerClick = session.find(e => e.event_type === 'offer_click');
        const sessionEvent = session[0];

        return {
          sessionId: session[0].session_id,
          timestamp: pageEnter?.created_at,
          country: sessionEvent.country_name || 'Unknown',
          countryCode: sessionEvent.country_code || 'XX',
          city: sessionEvent.city || 'Unknown',
          ip: sessionEvent.ip || 'Unknown',
          playedVideo: !!videoPlay,
          clickedOffer: offerClick?.event_data?.offer_type || null,
        };
      });

      setDashboardData({
        totalVisits,
        uniqueVisitors,
        liveUsers,
        videoViews,
        videoPlayRate,
        totalPurchases,
        conversionRate,
        purchasesByProduct,
        averageTimeOnPage,
        pitchReached,
        leadReached,
        topCountries,
        recentSessions,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      
      const subscription = supabase
        .channel('vsl_analytics_dashboard')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'vsl_analytics'
          },
          () => {
            console.log('New event detected, refreshing dashboard...');
            fetchDashboardData();
          }
        )
        .subscribe();

      const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [isAuthenticated]);

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR');
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    if (minutes > 0) {
      return `${minutes}min${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Entre com suas credenciais para acessar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="admin@magicbluedrops.com"
                required
                disabled={isLoggingIn}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                required
                disabled={isLoggingIn}
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar no Dashboard'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Acesso restrito apenas para administradores autorizados
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen while fetching data
  if (loading && dashboardData.totalVisits === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Main dashboard content (authenticated)
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Dashboard BlueDrops VSL
                </h1>
                <p className="text-gray-400">
                  Monitoramento em tempo real (excluindo Brasil)
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="text-sm text-gray-400">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Users Highlight */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <h2 className="text-xl lg:text-2xl font-bold">
                      👤 {dashboardData.liveUsers} usuários online agora
                    </h2>
                  </div>
                  <p className="text-green-100 text-base lg:text-lg">
                    🌎 Visitantes ativos nos últimos 2 minutos
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <Activity className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* Total de Visitas */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total de Visitas</span>
                <Eye className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(dashboardData.totalVisits)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Sessões únicas iniciadas
              </div>
            </div>

            {/* Visualizações de Vídeo */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Visualizações de Vídeo</span>
                <Play className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(dashboardData.videoViews)}
              </div>
              <div className="text-xs text-green-400 mt-1">
                {formatPercentage(dashboardData.videoPlayRate)} taxa de reprodução
              </div>
            </div>

            {/* Total de Compras */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total de Compras</span>
                <ShoppingCart className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-green-400">
                {formatNumber(dashboardData.totalPurchases)}
              </div>
              <div className="text-xs text-green-400 mt-1">
                {formatPercentage(dashboardData.conversionRate)} conversão
              </div>
            </div>

            {/* Tempo Médio na Página */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Tempo Médio na Página</span>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatTime(dashboardData.averageTimeOnPage)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Por sessão
              </div>
            </div>

          </div>

          {/* Second Row - Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* Chegaram no Lead (7:45) */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Viraram Lead (7:45)</span>
                <Target className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {formatNumber(dashboardData.leadReached)}
              </div>
              <div className="text-xs text-yellow-400 mt-1">
                {dashboardData.totalVisits > 0 ? formatPercentage((dashboardData.leadReached / dashboardData.totalVisits) * 100) : '0%'} das visitas
              </div>
            </div>

            {/* Chegaram no Pitch (35:55) */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Chegaram no Pitch (35:55)</span>
                <Target className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {formatNumber(dashboardData.pitchReached)}
              </div>
              <div className="text-xs text-purple-400 mt-1">
                {dashboardData.totalVisits > 0 ? formatPercentage((dashboardData.pitchReached / dashboardData.totalVisits) * 100) : '0%'} das visitas
              </div>
            </div>

            {/* Visitantes Únicos */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Visitantes Únicos</span>
                <UserCheck className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(dashboardData.uniqueVisitors)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Sessões individuais
              </div>
            </div>

            {/* Taxa de Conversão */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Taxa de Conversão</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400">
                {formatPercentage(dashboardData.conversionRate)}
              </div>
              <div className="text-xs text-green-400 mt-1">
                Visitas → Compras
              </div>
            </div>

          </div>

          {/* Third Row - Product Sales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            
            {/* Compras 6 Frascos */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">Compras por Produto</span>
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">6 Frascos</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">{dashboardData.purchasesByProduct['6-bottle']}</span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${dashboardData.totalPurchases > 0 ? (dashboardData.purchasesByProduct['6-bottle'] / dashboardData.totalPurchases) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">3 Frascos</span>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold">{dashboardData.purchasesByProduct['3-bottle']}</span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-yellow-500 rounded-full" 
                        style={{ width: `${dashboardData.totalPurchases > 0 ? (dashboardData.purchasesByProduct['3-bottle'] / dashboardData.totalPurchases) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">1 Frasco</span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">{dashboardData.purchasesByProduct['1-bottle']}</span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-red-500 rounded-full" 
                        style={{ width: `${dashboardData.totalPurchases > 0 ? (dashboardData.purchasesByProduct['1-bottle'] / dashboardData.totalPurchases) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Países */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">Top Países</span>
                <Globe className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-2">
                {dashboardData.topCountries.slice(0, 5).map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-white text-sm truncate">{country.country}</span>
                    </div>
                    <span className="text-blue-400 font-bold">{country.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Métricas de Engajamento */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">Métricas de Engajamento</span>
                <Activity className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Taxa de Vídeo</span>
                  <span className="text-green-400 font-bold">{formatPercentage(dashboardData.videoPlayRate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Lead Rate</span>
                  <span className="text-yellow-400 font-bold">
                    {dashboardData.totalVisits > 0 ? formatPercentage((dashboardData.leadReached / dashboardData.totalVisits) * 100) : '0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Pitch Rate</span>
                  <span className="text-purple-400 font-bold">
                    {dashboardData.totalVisits > 0 ? formatPercentage((dashboardData.pitchReached / dashboardData.totalVisits) * 100) : '0%'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Recent Sessions Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Sessões Recentes
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      País
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Cidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Vídeo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Oferta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Horário
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {dashboardData.recentSessions.slice(0, 10).map((session, index) => (
                    <tr key={session.sessionId} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <div className="flex items-center gap-2">
                          <span>{getCountryFlag(session.countryCode, session.country)}</span>
                          <span className="truncate max-w-20">{session.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {session.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                        {session.ip.split('.').slice(0, 2).join('.')}.***.**
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          session.playedVideo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {session.playedVideo ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {session.clickedOffer ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {session.clickedOffer}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {session.timestamp ? new Date(session.timestamp).toLocaleTimeString('pt-BR') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};