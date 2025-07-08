import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  RefreshCw,
  Calendar,
  LogOut,
  Lock
} from 'lucide-react';

interface DashboardData {
  totalSessions: number;
}

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSessions: 0
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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get count of unique sessions
      const { data: allEvents, error } = await supabase
        .from('vsl_analytics')
        .select('session_id')
        .eq('event_type', 'page_enter')
        .neq('country_code', 'BR')
        .neq('country_name', 'Brazil')
        .is('is_brazilian_ip', false);

      if (error) throw error;

      // Count unique sessions
      const uniqueSessions = new Set();
      if (allEvents) {
        allEvents.forEach(event => {
          uniqueSessions.add(event.session_id);
        });
      }
      
      setDashboardData({
        totalSessions: uniqueSessions.size
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
      
      // Set up real-time subscription for new sessions
      const subscription = supabase
        .channel('vsl_analytics_sessions')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'vsl_analytics',
            filter: 'event_type=eq.page_enter'
          },
          () => {
            console.log('New session detected, refreshing dashboard...');
            fetchDashboardData();
          }
        )
        .subscribe();

      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [isAuthenticated]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
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
  if (loading && dashboardData.totalSessions === 0) {
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
                  Última atualização: {formatDate(lastUpdated.toISOString())}
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

          {/* Main Counter */}
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-4 mb-4">
                <Users className="w-12 h-12 text-blue-400" />
                <h2 className="text-3xl font-bold text-white">Sessões Iniciadas</h2>
              </div>
              
              <div className="text-8xl font-black text-blue-400 mb-6">
                {dashboardData.totalSessions}
              </div>
              
              <div className="w-full max-w-lg bg-gray-700 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: '100%' }}
                ></div>
              </div>
              
              <div className="text-gray-400 mt-2">
                100.0% do total
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};