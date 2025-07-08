import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  RefreshCw,
  Calendar,
  LogOut,
  Lock
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface SessionData {
  totalSessions: number;
  recentSessions: any[];
}

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  const [sessionData, setSessionData] = useState<SessionData>({
    totalSessions: 0,
    recentSessions: []
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = sessionStorage.getItem('admin_authenticated') === 'true';
      const loginTime = sessionStorage.getItem('admin_login_time');
      
      // Check if login is still valid (24 hours)
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

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (loginEmail === 'admin@magicbluedrops.com' && loginPassword === 'gotinhaazul') {
      // Set authentication
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

  // Clear all data from dashboard
  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      console.log('🗑️ Clearing ALL analytics data...');
      
      // Delete ALL records from vsl_analytics table
      const { error } = await supabase
        .from('vsl_analytics')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records (using impossible ID)
      
      if (error) {
        console.error('Error clearing data:', error);
        alert('Erro ao limpar dados: ' + error.message);
        return;
      }
      
      console.log('✅ All analytics data cleared successfully');
      
      // Reset local state
      setSessionData({
        totalSessions: 0,
        recentSessions: []
      });
      
      // Close confirmation modal
      setShowClearConfirm(false);
      
      // Show success message
      alert('✅ Todos os dados foram removidos com sucesso!');
      
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Erro ao limpar dados. Tente novamente.');
    } finally {
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

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      // Get all page_enter events (one per session) excluding Brazilian IPs
      const { data: allEvents, error } = await supabase
        .from('vsl_analytics')
        .select('*')
        .eq('event_type', 'page_enter')
        .neq('country_code', 'BR')
        .neq('country_name', 'Brazil')
        .order('created_at', { ascending: false });
      
      // Each page_enter event represents one unique session
      const totalSessions = allEvents.length;

      // Get recent sessions (last 20)
      const recentSessions = allEvents.slice(0, 20).map((session) => {
        return {
          sessionId: session.session_id,
          timestamp: session.created_at,
          country: session.country_name || 'Unknown',
          countryCode: session.country_code || 'XX',
          city: session.city || 'Unknown',
          ip: session.ip || 'Unknown',
        };
      });

      setSessionData({
        totalSessions,
        recentSessions
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching session data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessionData();
      
      // Set up real-time subscription for new sessions
      // ✅ ZEROED: Set all totals to zero
      setTotalSales({
        '6-bottle': 0,
        '3-bottle': 0,
        '1-bottle': 0,
        total: 0
      });
        .channel('vsl_analytics_sessions')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'vsl_analytics',
            filter: 'event_type=eq.page_enter'
          },
          () => {
            console.log('New session detected, refreshing data...');
            fetchSessionData();
          }
        )
        .subscribe();

      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchSessionData, 30000);

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [isAuthenticated]);

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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Entre com suas credenciais para acessar</p>
          </div>

          {/* Login Form */}
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

          {/* Footer */}
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
  if (loading && sessionData.totalSessions === 0) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Dashboard - Sessões Iniciadas
                </h1>
                <p className="text-gray-600">
                  Monitoramento de sessões únicas (excluindo Brasil)
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="text-sm text-gray-500">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Última atualização: {formatDate(lastUpdated.toISOString())}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchSessionData}
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

          {/* Main Stats Card */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Sessões Iniciadas</h2>
                      <p className="text-gray-600 text-sm">Total de usuários únicos que entraram</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {sessionData.totalSessions.toLocaleString()}
                  </div>
                  <div className="text-blue-600 text-sm font-medium">
                    100.0% do total
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-blue-100 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sessions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Sessões Recentes
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Todos os dados foram resetados para zero
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      País
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessionData.recentSessions.map((session, index) => (
                    <tr key={session.sessionId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(session.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{getCountryFlag(session.countryCode, session.country)}</span>
                          <span className="truncate max-w-32">{session.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {maskIP(session.ip)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {session.sessionId.substring(0, 12)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* No Data Message */}
            {sessionData.totalSessions === 0 && !loading && (
              <div className="text-center p-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium text-lg mb-2">
                  📊 Nenhuma sessão registrada ainda
                </p>
                <p className="text-gray-400 text-sm">
                  Aguarde usuários acessarem o site
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};