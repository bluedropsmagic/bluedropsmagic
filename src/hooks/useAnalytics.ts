import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SalesChart } from './SalesChart';
import { ConversionFunnel } from './ConversionFunnel';
import { ConversionHeatmap } from './ConversionHeatmap';
import { TrackingTestPanel } from './TrackingTestPanel';
import { ManelChart } from './ManelChart';
import { RedTrackTestPanel } from './RedTrackTestPanel';
import { AdminTestingEnvironment } from './AdminTestingEnvironment';
import { 
  BarChart3, 
  Users, 
  Play, 
  Target, 
  ShoppingCart, 
  Clock,
  TrendingUp,
  RefreshCw,
  Calendar,
  Eye,
  Globe,
  UserCheck,
  Activity,
  MapPin,
  Zap,
  Settings,
  Lock,
  LogOut,
  TestTube
} from 'lucide-react';

interface AnalyticsData {
  totalSessions: number;
  videoPlayRate: number;
  pitchReachRate: number;
  leadReachRate: number;
  offerClickRates: {
    '1-bottle': number;
    '3-bottle': number;
    '6-bottle': number;
  };
  upsellStats: {
    '1-bottle': { clicks: number; accepts: number; rejects: number };
    '3-bottle': { clicks: number; accepts: number; rejects: number };
    '6-bottle': { clicks: number; accepts: number; rejects: number };
  };
  averageTimeOnPage: number;
  totalOfferClicks: number;
  totalPurchases: number;
  recentSessions: any[];
  liveUsers: number;
  countryStats: { [key: string]: number };
  topCountries: Array<{ country: string; count: number; flag: string }>;
  topCities: Array<{ city: string; country: string; count: number }>;
  liveCountryBreakdown: Array<{ country: string; countryCode: string; count: number; flag: string }>;
}

interface LiveSession {
  sessionId: string;
  country: string;
  countryCode: string;
  city: string;
  ip: string;
  lastActivity: Date;
  isActive: boolean;
}

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // ✅ ZEROED: All analytics data starts at zero
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSessions: 0,
    videoPlayRate: 0,
    pitchReachRate: 0,
    leadReachRate: 0,
    offerClickRates: {
      '1-bottle': 0,
      '3-bottle': 0,
      '6-bottle': 0,
    },
    upsellStats: {
      '1-bottle': { clicks: 0, accepts: 0, rejects: 0 },
      '3-bottle': { clicks: 0, accepts: 0, rejects: 0 },
      '6-bottle': { clicks: 0, accepts: 0, rejects: 0 },
    },
    averageTimeOnPage: 0,
    totalOfferClicks: 0,
    totalPurchases: 0,
    recentSessions: [],
    liveUsers: 0,
    countryStats: {},
    topCountries: [],
    topCities: [],
    liveCountryBreakdown: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'tracking' | 'redtrack' | 'testing' | 'settings'>('analytics');
  const [contentDelay, setContentDelay] = useState(2155);

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

  const handleDelayChange = (newDelay: number) => {
    setContentDelay(newDelay);
    localStorage.setItem('content_delay', newDelay.toString());
    window.dispatchEvent(new CustomEvent('delayChanged'));
    console.log('🕐 Admin changed delay to:', newDelay, 'seconds');
  };

  const resetToDefault = () => {
    handleDelayChange(2155);
  };

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

  const getCountryNameFromCode = (code: string): string => {
    const countryNames: { [key: string]: string } = {
      'BR': 'Brazil', 'US': 'United States', 'PT': 'Portugal',
      'ES': 'Spain', 'AR': 'Argentina', 'MX': 'Mexico',
      'CA': 'Canada', 'GB': 'United Kingdom', 'FR': 'France',
      'DE': 'Germany', 'IT': 'Italy', 'XX': 'Unknown'
    };
    return countryNames[code.toUpperCase()] || 'Unknown';
  };

  // ✅ ZEROED: Fetch function returns zero data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // ✅ ZEROED: Always return zero data regardless of database content
      console.log('📊 Dashboard in ZERO mode - all metrics set to 0');
      
      setAnalytics({
        totalSessions: 0,
        videoPlayRate: 0,
        pitchReachRate: 0,
        leadReachRate: 0,
        offerClickRates: {
          '1-bottle': 0,
          '3-bottle': 0,
          '6-bottle': 0,
        },
        upsellStats: {
          '1-bottle': { clicks: 0, accepts: 0, rejects: 0 },
          '3-bottle': { clicks: 0, accepts: 0, rejects: 0 },
          '6-bottle': { clicks: 0, accepts: 0, rejects: 0 },
        },
        averageTimeOnPage: 0,
        totalOfferClicks: 0,
        totalPurchases: 0,
        recentSessions: [],
        liveUsers: 0,
        countryStats: {},
        topCountries: [],
        topCities: [],
        liveCountryBreakdown: [],
      });

      setLiveSessions([]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
      
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchAnalytics, 10000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isAuthenticated]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    if (minutes > 0) {
      return `${minutes}min${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    } else {
      return `${remainingSeconds}s`;
    }
  };
  
  const formatPageTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getPageProgress = (seconds: number) => {
    if (seconds >= 2155) return '🎯 Pitch';
    if (seconds >= 465) return '📈 Lead';
    if (seconds >= 60) return '▶️ Navegando';
    if (seconds > 0) return '👀 Início';
    return '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const maskIP = (ip: string) => {
    if (ip === 'Unknown') return ip;
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.**`;
    }
    return ip;
  };

  const formatLiveCountryBreakdown = () => {
    if (analytics.liveCountryBreakdown.length === 0) return '';
    
    return analytics.liveCountryBreakdown
      .slice(0, 3)
      .map(item => `${item.flag} ${item.count} ${item.countryCode}`)
      .join(' • ');
  };

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

  if (loading && analytics.totalSessions === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Dashboard VSL Analytics
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Monitoramento em tempo real (excluindo Brasil)
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="text-xs sm:text-sm text-gray-500">
                  <Calendar className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1" />
                  Última atualização: {formatDate(lastUpdated.toISOString())}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchAnalytics}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                  >
                    <RefreshCw className={`w-3 sm:w-4 h-3 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Atualizar</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                  >
                    <LogOut className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-4 sm:mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('tracking')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'tracking'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Tracking
                </button>
                <button
                  onClick={() => setActiveTab('redtrack')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'redtrack'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Target className="w-4 h-4 inline mr-2" />
                  RedTrack
                </button>
                <button
                  onClick={() => setActiveTab('testing')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'testing'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TestTube className="w-4 h-4 inline mr-2" />
                  Testing
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'analytics' ? (
            <>
              {/* Live Users Highlight - ZEROED */}
              <div className="mb-4 sm:mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-2 sm:w-3 h-2 sm:h-3 bg-white rounded-full animate-pulse"></div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                          👤 0 usuários ativos agora
                        </h2>
                      </div>
                      <p className="text-green-100 text-sm sm:text-base lg:text-lg">
                        🌎 Nenhum usuário ativo
                      </p>
                    </div>
                    <div className="bg-white/20 p-3 sm:p-4 rounded-xl">
                      <Zap className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Funnel - ZEROED */}
              <div className="mb-4 sm:mb-8">
                <ConversionFunnel />
              </div>

              {/* Conversion Heatmap - ZEROED */}
              <div className="mb-4 sm:mb-8">
                <ConversionHeatmap />
              </div>

              {/* Sales Chart - ZEROED */}
              <div className="mb-4 sm:mb-8">
                <SalesChart />
              </div>

              {/* Manel Chart - ZEROED */}
              <div className="mb-4 sm:mb-8">
                <ManelChart />
              </div>

              {/* Stats Grid - ZEROED */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200 relative overflow-hidden">
                  <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                    <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Online</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">0</p>
                      <p className="text-xs text-gray-500">2 min</p>
                    </div>
                    <div className="bg-green-100 p-2 sm:p-3 rounded-lg self-end sm:self-auto">
                      <Activity className="w-4 sm:w-6 h-4 sm:h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Sessões</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="bg-gray-100 p-2 sm:p-3 rounded-lg self-end sm:self-auto">
                      <Users className="w-4 sm:w-6 h-4 sm:h-6 text-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">VTurb</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">0.0%</p>
                      <p className="text-xs text-gray-500">Carregou</p>
                    </div>
                    <div className="bg-green-100 p-2 sm:p-3 rounded-lg self-end sm:self-auto">
                      <Play className="w-4 sm:w-6 h-4 sm:h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Compras</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">0</p>
                      <p className="text-xs text-gray-500">Upsells</p>
                    </div>
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-lg self-end sm:self-auto">
                      <ShoppingCart className="w-4 sm:w-6 h-4 sm:h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upsell Performance - ZEROED */}
              <div className="mb-4 sm:mb-8">
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance dos Upsells
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(analytics.upsellStats).map(([packageType, stats]) => (
                      <div key={packageType} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2 capitalize">
                          {packageType.replace('-', ' ')}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Cliques:</span>
                            <span className="font-semibold">0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Aceites:</span>
                            <span className="font-semibold text-green-600">0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recusas:</span>
                            <span className="font-semibold text-red-600">0</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span>Taxa:</span>
                            <span className="font-semibold text-blue-600">0.0%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Sessions Table - ZEROED */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Sessões Recentes
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          País
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          VTurb
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tempo Página
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Oferta
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* ZEROED: No sessions to display */}
                    </tbody>
                  </table>
                </div>
                
                {/* No Data Message */}
                <div className="text-center p-8 bg-blue-50 rounded-lg border border-blue-200 m-6">
                  <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-blue-700 font-medium text-lg mb-2">
                    📊 Dashboard completamente zerada
                  </p>
                  <p className="text-blue-600 text-sm">
                    Todos os dados foram resetados para zero
                  </p>
                </div>
              </div>
            </>
          ) : activeTab === 'tracking' ? (
            <TrackingTestPanel />
          ) : activeTab === 'redtrack' ? (
            <RedTrackTestPanel />
          ) : activeTab === 'testing' ? (
            <AdminTestingEnvironment />
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Configuração de Delay de Conteúdo</h3>
                </div>

                <p className="text-sm text-blue-600 mb-6 font-semibold">
                  ⏰ SISTEMA DE DELAY ATIVO: O conteúdo completo aparece após o tempo configurado (padrão: 35min55s).
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Status atual: Delay de {Math.floor(contentDelay / 60)}min{contentDelay % 60 > 0 ? ` ${contentDelay % 60}s` : ''}
                    </span>
                  </div>
                  <div className="bg-blue-100 border border-blue-300 rounded px-2 py-1 inline-block">
                    <span className="text-blue-800 text-xs font-bold">
                      {contentDelay === 0 ? 'SEM DELAY' : `DELAY: ${contentDelay}s`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Sem delay', value: 0 },
                    { label: '30 segundos', value: 30 },
                    { label: '1 minuto', value: 60 },
                    { label: '2 minutos', value: 120 },
                    { label: '5 minutos', value: 300 },
                    { label: '30 segundos (Teste)', value: 30 },
                    { label: '35min55s (Padrão)', value: 2155, isDefault: true }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleDelayChange(preset.value)}
                      disabled={false}
                      className={`p-3 text-sm rounded-lg border transition-colors ${
                        contentDelay === preset.value
                          ? preset.isDefault 
                            ? 'bg-blue-500 text-white border-blue-600'
                            : 'bg-blue-600 text-white border-blue-600'
                          : preset.isDefault
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                      } hover:bg-blue-100`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delay personalizado (segundos):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="3600"
                      value={contentDelay}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        handleDelayChange(value);
                      }}
                      disabled={false}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <button
                      onClick={resetToDefault}
                      disabled={false}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Padrão (35:55)
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">⏰ Sistema de Delay Ativo:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Conteúdo inicial:</strong> Vídeo + avisos até "Watch now before it's removed"</li>
                    <li>• <strong>Conteúdo completo:</strong> Aparece após {Math.floor(contentDelay / 60)}min{contentDelay % 60 > 0 ? ` ${contentDelay % 60}s` : ''}</li>
                    <li>• <strong>Inclui:</strong> Botões de compra, depoimentos, médicos, notícias, garantia</li>
                    <li>• <strong>Admin override:</strong> Botão no canto superior direito para mostrar tudo</li>
                    <li>• <strong>Objetivo:</strong> Usuário assiste mais tempo antes de ver ofertas</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};