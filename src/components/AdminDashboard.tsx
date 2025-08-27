import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Settings, 
  LogOut, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Clock,
  MapPin
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ConversionFunnel } from './ConversionFunnel';
import { SalesChart } from './SalesChart';
import { ConversionHeatmap } from './ConversionHeatmap';
import { UpsellDownsellSessions } from './UpsellDownsellSessions';
import { ManelChart } from './ManelChart';
import { TrackingTestPanel } from './TrackingTestPanel';
import { RedTrackTestPanel } from './RedTrackTestPanel';
import { AdminTestingEnvironment } from './AdminTestingEnvironment';

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
  totalUsers: number;
  countries: { [key: string]: number };
  pages: { [key: string]: number };
  averageTimeOnSite: number;
}

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [liveUsersCount, setLiveUsersCount] = useState(0);
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [liveUsersStats, setLiveUsersStats] = useState<LiveUsersStats>({
    totalUsers: 0,
    countries: {},
    pages: {},
    averageTimeOnSite: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const navigate = useNavigate();

  // Check Supabase connection status
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      setSupabaseStatus('checking');
      
      if (!isSupabaseConfigured()) {
        setSupabaseStatus('error');
        return;
      }
      
      try {
        if (!supabase) {
          setSupabaseStatus('error');
          return;
        }
        
        // Test connection with a simple query
        const { data, error } = await supabase
          .from('vsl_analytics')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setSupabaseStatus('error');
        } else {
          setSupabaseStatus('connected');
          console.log('✅ Supabase connection successful');
        }
      } catch (error) {
        console.error('Error testing Supabase connection:', error);
        setSupabaseStatus('error');
      }
    };

    checkSupabaseConnection();
  }, []);

  // Check authentication on mount
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
          // Session expired
          sessionStorage.removeItem('admin_authenticated');
          sessionStorage.removeItem('admin_login_time');
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Simple authentication check
    if (email === 'admin@magicbluedrops.com' && password === 'gotinhaazul') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_login_time', Date.now().toString());
      console.log('Admin authenticated successfully');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_login_time');
    navigate('/');
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: TrendingUp },
    { id: 'live-users', label: '👥 Live Users', icon: Users },
    { id: 'funnel', label: '🔄 Conversion Funnel', icon: Activity },
    { id: 'sales', label: '💰 Sales Chart', icon: TrendingUp },
    { id: 'heatmap', label: '🔥 Conversion Heatmap', icon: Activity },
    { id: 'sessions', label: '👥 Upsell/Downsell Sessions', icon: Users },
    { id: 'manel', label: '🎯 Manel Chart', icon: TrendingUp },
    { id: 'tracking', label: '🧪 Tracking Test', icon: Settings },
    { id: 'redtrack', label: '🎯 RedTrack', icon: Settings },
    { id: 'testing', label: '🧪 Testing Environment', icon: Settings }
  ];

  // Fetch live users count
  const fetchLiveUsersCount = async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('vsl_analytics')
        .select('session_id')
        .neq('country_code', 'BR')
        .neq('country_name', 'Brazil')
        .gte('last_ping', twoMinutesAgo);
      
      if (error) throw error;
      
      // Count unique sessions
      const uniqueSessions = new Set(data?.map(item => item.session_id) || []);
      setLiveUsersCount(uniqueSessions.size);
    } catch (error) {
      console.error('Error fetching live users count:', error);
      setLiveUsersCount(0);
    }
  };

  // Fetch detailed live users data
  const fetchLiveUsersData = async () => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('vsl_analytics')
        .select('session_id, country_name, country_code, city, region, last_ping, created_at, event_data')
        .neq('country_code', 'BR')
        .neq('country_name', 'Brazil')
        .gte('last_ping', twoMinutesAgo)
        .order('last_ping', { ascending: false });
      
      if (error) throw error;
      
      // Group by session to get unique users
      const sessionGroups: { [key: string]: any[] } = {};
      (data || []).forEach(event => {
        if (!sessionGroups[event.session_id]) {
          sessionGroups[event.session_id] = [];
        }
        sessionGroups[event.session_id].push(event);
      });
      
      // Process live users
      const users: LiveUser[] = [];
      const countries: { [key: string]: number } = {};
      const pages: { [key: string]: number } = {};
      let totalTimeOnSite = 0;
      
      Object.entries(sessionGroups).forEach(([sessionId, events]) => {
        const latestEvent = events[0]; // Most recent event
        const firstEvent = events[events.length - 1]; // Oldest event
        
        const timeOnSite = Math.floor((new Date(latestEvent.last_ping).getTime() - new Date(firstEvent.created_at).getTime()) / 1000);
        totalTimeOnSite += timeOnSite;
        
        // Determine current page
        let currentPage = 'Home';
        const eventData = latestEvent.event_data || {};
        const path = eventData.current_path || eventData.page || window.location.pathname;
        
        if (path.includes('/up1bt') || path.includes('/up3bt') || path.includes('/up6bt')) {
          currentPage = 'Upsell';
        } else if (path.includes('/upig')) {
          currentPage = 'Second Upsell';
        } else if (path.includes('/dws') || path.includes('/dw3')) {
          currentPage = 'Downsell';
        } else if (path.includes('/admin')) {
          currentPage = 'Admin';
        } else if (path.includes('/thankyou')) {
          currentPage = 'Thank You';
        }
        
        users.push({
          session_id: sessionId,
          country_name: latestEvent.country_name || 'Unknown',
          country_code: latestEvent.country_code || 'XX',
          city: latestEvent.city || 'Unknown',
          region: latestEvent.region || 'Unknown',
          last_ping: latestEvent.last_ping,
          created_at: firstEvent.created_at,
          current_page: currentPage,
          time_on_site: timeOnSite
        });
        
        // Count by country
        const country = latestEvent.country_name || 'Unknown';
        countries[country] = (countries[country] || 0) + 1;
        
        // Count by page
        pages[currentPage] = (pages[currentPage] || 0) + 1;
      });
      
      const averageTimeOnSite = users.length > 0 ? Math.floor(totalTimeOnSite / users.length) : 0;
      
      setLiveUsers(users);
      setLiveUsersStats({
        totalUsers: users.length,
        countries,
        pages,
        averageTimeOnSite
      });
      setLiveUsersCount(users.length);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching live users data:', error);
      setLiveUsers([]);
      setLiveUsersStats({
        totalUsers: 0,
        countries: {},
        pages: {},
        averageTimeOnSite: 0
      });
    }
  };

  // Auto-refresh live users count every 30 seconds
  useEffect(() => {
    if (isAuthenticated && supabaseStatus === 'connected') {
      fetchLiveUsersData();
      
      const interval = setInterval(() => {
        fetchLiveUsersData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, supabaseStatus]);

  const getCountryFlag = (countryCode: string): string => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
      'IT': '🇮🇹', 'ES': '🇪🇸', 'MX': '🇲🇽', 'AR': '🇦🇷', 'AU': '🇦🇺',
      'JP': '🇯🇵', 'KR': '🇰🇷', 'IN': '🇮🇳', 'CN': '🇨🇳', 'RU': '🇷🇺',
      'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪',
      'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'PT': '🇵🇹', 'PL': '🇵🇱',
      'XX': '🌍'
    };
    return flags[countryCode] || '🌍';
  };

  const formatTimeOnSite = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPageIcon = (page: string): string => {
    switch (page) {
      case 'Home': return '🏠';
      case 'Upsell': return '📦';
      case 'Second Upsell': return '🎯';
      case 'Downsell': return '💰';
      case 'Admin': return '👨‍💼';
      case 'Thank You': return '🎉';
      default: return '📄';
    }
  };
  // Supabase Status Component
  const SupabaseStatusBanner = () => {
    const getStatusConfig = () => {
      switch (supabaseStatus) {
        case 'checking':
          return {
            bg: 'bg-blue-50 border-blue-200',
            text: 'text-blue-700',
            icon: <RefreshCw className="w-5 h-5 animate-spin" />,
            title: 'Verificando conexão com Supabase...',
            message: 'Testando conectividade com o banco de dados'
          };
        case 'connected':
          return {
            bg: 'bg-green-50 border-green-200',
            text: 'text-green-700',
            icon: <CheckCircle className="w-5 h-5" />,
            title: '✅ Supabase conectado com sucesso',
            message: 'Todas as funcionalidades de analytics estão disponíveis'
          };
        case 'error':
          return {
            bg: 'bg-red-50 border-red-200',
            text: 'text-red-700',
            icon: <XCircle className="w-5 h-5" />,
            title: '❌ Erro de conexão com Supabase',
            message: 'Clique em "Connect to Supabase" no canto superior direito para configurar'
          };
        default:
          return {
            bg: 'bg-gray-50 border-gray-200',
            text: 'text-gray-700',
            icon: <Database className="w-5 h-5" />,
            title: 'Status desconhecido',
            message: 'Verifique a configuração do Supabase'
          };
      }
    };

    const config = getStatusConfig();

    return (
      <div className={`${config.bg} border rounded-lg p-4 mb-6`}>
        <div className="flex items-center gap-3">
          {config.icon}
          <div>
            <h3 className={`font-semibold ${config.text}`}>{config.title}</h3>
            <p className={`text-sm ${config.text} opacity-80`}>{config.message}</p>
          </div>
        </div>
      </div>
    );
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <img 
              src="https://i.imgur.com/QJxTIcN.png" 
              alt="Blue Drops Logo"
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-blue-200">BlueDrops VSL Analytics</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                placeholder="admin@magicbluedrops.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm pr-12"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                <p className="text-red-300 text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Login to Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-300 text-sm">
              Use the credentials provided in the documentation
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://i.imgur.com/QJxTIcN.png" 
                alt="Blue Drops Logo"
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">BlueDrops VSL Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                View Site
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Supabase Status Banner */}
          <SupabaseStatusBanner />
          
          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Live Users</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-800">
                        {liveUsersCount}
                      </p>
                      <p className="text-xs text-blue-600">
                        usuários ativos agora
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Database className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Database</span>
                      </div>
                      <p className="text-2xl font-bold text-green-800">
                        {supabaseStatus === 'connected' ? 'Online' : 'Offline'}
                      </p>
                      <p className="text-xs text-green-600">
                        {supabaseStatus === 'connected' ? 'Conectado' : 'Não configurado'}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Environment</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-800">
                        {window.location.hostname.includes('localhost') ? 'Dev' : 'Prod'}
                      </p>
                      <p className="text-xs text-purple-600">
                        {window.location.hostname}
                      </p>
                    </div>
                  </div>
                </div>

                {supabaseStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-900">
                        Supabase Configuration Required
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-red-700">
                        Para usar o dashboard de analytics, você precisa configurar o Supabase:
                      </p>
                      
                      <ol className="list-decimal list-inside space-y-2 text-red-700 text-sm">
                        <li>Clique no botão <strong>"Connect to Supabase"</strong> no canto superior direito</li>
                        <li>Faça login na sua conta Supabase</li>
                        <li>Crie um novo projeto ou selecione um existente</li>
                        <li>As variáveis de ambiente serão configuradas automaticamente</li>
                        <li>As migrações do banco serão aplicadas automaticamente</li>
                      </ol>
                      
                      <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">Estrutura do Banco:</h4>
                        <p className="text-red-700 text-sm">
                          O projeto já possui todas as migrações necessárias na pasta <code>supabase/migrations/</code>. 
                          Elas serão aplicadas automaticamente quando você conectar ao Supabase.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {supabaseStatus === 'connected' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Live Users
                      </h3>
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Live users functionality temporarily disabled</p>
                        <p className="text-gray-400 text-sm">Use the Live Users tab for full functionality</p>
                      </div>
                    </div>
                    <ConversionFunnel className="h-fit" />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'live-users' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Live Users - Usuários Ativos
                </h2>
                
                {supabaseStatus === 'connected' ? (
                  <div className="space-y-6">
                    {/* Header Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-600">Live Users</p>
                            <p className="text-2xl font-bold text-blue-900">{liveUsersStats.totalUsers}</p>
                            <p className="text-xs text-blue-500">últimos 2 minutos</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Globe className="w-5 h-5 text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-green-600">Países</p>
                            <p className="text-2xl font-bold text-green-900">{Object.keys(liveUsersStats.countries).length}</p>
                            <p className="text-xs text-green-500">países ativos</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Activity className="w-5 h-5 text-purple-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-purple-600">Páginas Ativas</p>
                            <p className="text-2xl font-bold text-purple-900">{Object.keys(liveUsersStats.pages).length}</p>
                            <p className="text-xs text-purple-500">páginas diferentes</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-orange-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-orange-600">Tempo Médio</p>
                            <p className="text-lg font-bold text-orange-900">{formatTimeOnSite(liveUsersStats.averageTimeOnSite)}</p>
                            <p className="text-xs text-orange-500">no site</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Refresh Button */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        👥 Usuários Online Agora ({liveUsersStats.totalUsers})
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
                        </span>
                        <button
                          onClick={fetchLiveUsersData}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Atualizar
                        </button>
                      </div>
                    </div>

                    {liveUsersStats.totalUsers > 0 ? (
                      <>
                        {/* Countries Breakdown */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Por País:
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {Object.entries(liveUsersStats.countries)
                              .sort(([,a], [,b]) => b - a)
                              .map(([country, count]) => {
                                const countryCode = liveUsers.find(u => u.country_name === country)?.country_code || 'XX';
                                return (
                                  <div key={country} className="bg-white p-3 rounded border border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{getCountryFlag(countryCode)}</span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{country}</p>
                                        <p className="text-xs text-gray-500">{count} usuário{count > 1 ? 's' : ''}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Pages Breakdown */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Por Página:
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {Object.entries(liveUsersStats.pages)
                              .sort(([,a], [,b]) => b - a)
                              .map(([page, count]) => (
                                <div key={page} className="bg-white p-3 rounded border border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{getPageIcon(page)}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{page}</p>
                                      <p className="text-xs text-gray-500">{count} usuário{count > 1 ? 's' : ''}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Individual Users List */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                          <div className="p-4 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Lista Individual de Usuários:
                            </h4>
                          </div>
                          
                          <div className="max-h-96 overflow-y-auto">
                            {liveUsers.map((user, index) => (
                              <div key={user.session_id} className={`p-4 ${index !== liveUsers.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg">{getCountryFlag(user.country_code)}</span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">
                                          {user.city}, {user.country_name}
                                        </span>
                                        <span className="text-lg">{getPageIcon(user.current_page)}</span>
                                        <span className="text-xs text-gray-500">{user.current_page}</span>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        Sessão: {user.session_id.substring(0, 8)}...
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                      {formatTimeOnSite(user.time_on_site)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(user.last_ping).toLocaleTimeString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 bg-blue-50 rounded-lg">
                        <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <p className="text-blue-700 font-medium text-lg mb-2">
                          📊 Nenhum usuário ativo no momento
                        </p>
                        <p className="text-blue-600 text-sm">
                          Usuários aparecerão aqui quando visitarem o site
                        </p>
                      </div>
                    )}
                    
                    {/* Auto-refresh info */}
                    <div className="text-center text-xs text-gray-500">
                      🔄 Atualização automática a cada 30 segundos • 🇧🇷 IPs brasileiros excluídos
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Supabase connection required</p>
                    <p className="text-gray-500 text-sm">Connect to Supabase to view live users</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'funnel' && supabaseStatus === 'connected' && (
              <ConversionFunnel />
            )}

            {activeTab === 'sales' && supabaseStatus === 'connected' && (
              <SalesChart />
            )}

            {activeTab === 'heatmap' && supabaseStatus === 'connected' && (
              <ConversionHeatmap />
            )}

            {activeTab === 'sessions' && supabaseStatus === 'connected' && (
              <UpsellDownsellSessions />
            )}

            {activeTab === 'manel' && supabaseStatus === 'connected' && (
              <ManelChart />
            )}

            {activeTab === 'tracking' && (
              <TrackingTestPanel />
            )}

            {activeTab === 'redtrack' && (
              <RedTrackTestPanel />
            )}

            {activeTab === 'testing' && (
              <AdminTestingEnvironment />
            )}

            {/* Show configuration message for analytics tabs when Supabase is not connected */}
            {['live-users', 'funnel', 'sales', 'heatmap', 'sessions', 'manel'].includes(activeTab) && supabaseStatus !== 'connected' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                <Database className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-yellow-900 mb-2">
                  Supabase Configuration Required
                </h3>
                <p className="text-yellow-700 mb-4">
                  Esta funcionalidade requer conexão com o Supabase para acessar os dados de analytics.
                </p>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Como configurar:</strong> Clique em "Connect to Supabase" no canto superior direito do Bolt
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};