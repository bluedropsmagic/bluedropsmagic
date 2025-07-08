import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  RefreshCw,
  Calendar,
  LogOut,
  Lock,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  BarChart3,
  CreditCard,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardData {
  // Sessões
  totalSessions: number;
  recentSessions: any[];
  
  // Vendas
  totalSales: number;
  salesByProduct: {
    '6-bottle': number;
    '3-bottle': number;
    '1-bottle': number;
  };
  
  // Faturamento
  grossRevenue: number;
  netRevenue: number;
  
  // Métricas
  roas: number;
  roi: number;
  margin: number;
  arpu: number;
  reimbursement: number;
  chargeback: number;
  productCosts: number;
  cpa: number;
  taxes: number;
}

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSessions: 0,
    recentSessions: [],
    totalSales: 0,
    salesByProduct: {
      '6-bottle': 0,
      '3-bottle': 0,
      '1-bottle': 0,
    },
    grossRevenue: 0,
    netRevenue: 0,
    roas: 0,
    roi: 0,
    margin: 0,
    arpu: 0,
    reimbursement: 0,
    chargeback: 0,
    productCosts: 0,
    cpa: 0,
    taxes: 0,
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

      // Calculate sessions (unique page_enter events)
      const sessionEvents = allEvents.filter(event => event.event_type === 'page_enter');
      const totalSessions = sessionEvents.length;

      // Calculate sales (offer_click events with upsell accepts)
      const salesEvents = allEvents.filter(event => 
        event.event_type === 'offer_click' && 
        event.event_data?.offer_type &&
        event.event_data.offer_type.includes('upsell') &&
        event.event_data.offer_type.includes('accept')
      );
      
      const totalSales = salesEvents.length;

      // Sales by product
      const salesByProduct = {
        '6-bottle': salesEvents.filter(e => e.event_data?.offer_type?.includes('6-bottle')).length,
        '3-bottle': salesEvents.filter(e => e.event_data?.offer_type?.includes('3-bottle')).length,
        '1-bottle': salesEvents.filter(e => e.event_data?.offer_type?.includes('1-bottle')).length,
      };

      // Calculate revenue (mock data based on product prices)
      const productPrices = {
        '6-bottle': 294,
        '3-bottle': 198,
        '1-bottle': 79,
      };

      const grossRevenue = 
        (salesByProduct['6-bottle'] * productPrices['6-bottle']) +
        (salesByProduct['3-bottle'] * productPrices['3-bottle']) +
        (salesByProduct['1-bottle'] * productPrices['1-bottle']);

      // Mock calculations for other metrics
      const adSpend = 500; // Mock ad spend
      const productCosts = grossRevenue * 0.15; // 15% product costs
      const taxes = grossRevenue * 0.08; // 8% taxes
      const chargeback = grossRevenue * 0.005; // 0.5% chargeback
      const reimbursement = 0; // No reimbursements
      
      const netRevenue = grossRevenue - productCosts - taxes - chargeback;
      const roas = adSpend > 0 ? grossRevenue / adSpend : 0;
      const roi = adSpend > 0 ? ((netRevenue - adSpend) / adSpend) * 100 : 0;
      const margin = grossRevenue > 0 ? ((netRevenue / grossRevenue) * 100) : 0;
      const arpu = totalSessions > 0 ? grossRevenue / totalSessions : 0;
      const cpa = totalSales > 0 ? adSpend / totalSales : 0;

      // Recent sessions
      const recentSessions = sessionEvents.slice(0, 20).map((session) => ({
        sessionId: session.session_id,
        timestamp: session.created_at,
        country: session.country_name || 'Unknown',
        countryCode: session.country_code || 'XX',
        city: session.city || 'Unknown',
        ip: session.ip || 'Unknown',
      }));

      setDashboardData({
        totalSessions,
        recentSessions,
        totalSales,
        salesByProduct,
        grossRevenue,
        netRevenue,
        roas,
        roi,
        margin: margin - 100, // Show as negative margin for demo
        arpu,
        reimbursement,
        chargeback: chargeback / grossRevenue * 100, // As percentage
        productCosts,
        cpa,
        taxes,
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

      const interval = setInterval(fetchDashboardData, 60000); // Update every minute

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [isAuthenticated]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
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
                  Dashboard Analytics
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

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* Gastos com Anúncios */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Gastos com Anúncios</span>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(1235.21)}
              </div>
            </div>

            {/* Faturamento Bruto */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Faturamento Bruto</span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(dashboardData.grossRevenue)}
              </div>
            </div>

            {/* ROAS */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">ROAS</span>
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400">
                {formatNumber(dashboardData.roas)}
              </div>
            </div>

            {/* Lucro */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Lucro</span>
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-400">
                {formatCurrency(-94.51)}
              </div>
            </div>

          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* Faturamento Líquido */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Faturamento Líquido</span>
                <CreditCard className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(dashboardData.netRevenue)}
              </div>
            </div>

            {/* ROI */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">ROI</span>
                <Percent className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-400">
                {formatNumber(0.92)}
              </div>
            </div>

            {/* Margem */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Margem</span>
                <TrendingUp className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-400">
                {formatPercentage(-8.33)}
              </div>
            </div>

            {/* ARPU */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">ARPU</span>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(dashboardData.arpu)}
              </div>
            </div>

          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* Reembolso */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Reembolso</span>
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatPercentage(0)}
              </div>
            </div>

            {/* Chargeback */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Chargeback</span>
                <CreditCard className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatPercentage(dashboardData.chargeback)}
              </div>
            </div>

            {/* Custos de Produto */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Custos de Produto</span>
                <Package className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(dashboardData.productCosts)}
              </div>
            </div>

            {/* CPA */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">CPA</span>
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(dashboardData.cpa)}
              </div>
            </div>

          </div>

          {/* Fourth Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            {/* Vendas por Produto */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">Vendas por Produto</span>
                <ShoppingCart className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white">Magic Bluedrops - 6 Bottle</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{dashboardData.salesByProduct['6-bottle']}</span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${dashboardData.totalSales > 0 ? (dashboardData.salesByProduct['6-bottle'] / dashboardData.totalSales) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-blue-400 text-sm">
                      {dashboardData.totalSales > 0 ? ((dashboardData.salesByProduct['6-bottle'] / dashboardData.totalSales) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendas Chargeback */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Vendas chargeback</span>
                <CreditCard className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(0)}
              </div>
            </div>

          </div>

          {/* Taxes */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Taxas</span>
              <Percent className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(dashboardData.taxes)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};