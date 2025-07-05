import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SalesChart } from './SalesChart';
import { ConversionFunnel } from './ConversionFunnel';
import { ConversionHeatmap } from './ConversionHeatmap';
import { TrackingTestPanel } from './TrackingTestPanel';
import { ManelChart } from './ManelChart';
import { RedTrackTestPanel } from './RedTrackTestPanel';
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
  LogOut
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
  const [activeTab, setActiveTab] = useState<'analytics' | 'tracking' | 'redtrack' | 'settings'>('analytics');
  const [contentDelay, setContentDelay] = useState(0); // ✅ FIXED: No delay by default

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

  // ✅ NEW: Delay management functions
  const handleDelayChange = (newDelay: number) => {
    setContentDelay(newDelay);
    localStorage.setItem('content_delay', newDelay.toString());
    
    // Dispatch custom event to notify main app
    window.dispatchEvent(new CustomEvent('delayChanged'));
    
    console.log('🕐 Admin changed delay to:', newDelay, 'seconds - NOTE: Delay system has been removed, this setting has no effect');
  };

  const resetToDefault = () => {
    handleDelayChange(0); // ✅ FIXED: Default to no delay
  };

  // Enhanced country flag mapping
  const getCountryFlag = (countryCode: string, countryName?: string) => {
    // Use country code for more accurate flags
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

    // Try country code first, then fallback to country name mapping
    if (countryCode && countryFlags[countryCode.toUpperCase()]) {
      return countryFlags[countryCode.toUpperCase()];
    }

    // Fallback to name-based mapping
    const nameFlags: { [key: string]: string } = {
      'Brazil': '🇧🇷', 'United States': '🇺🇸', 'Portugal': '🇵🇹',
      'Spain': '🇪🇸', 'Argentina': '🇦🇷', 'Mexico': '🇲🇽',
      'Canada': '🇨🇦', 'United Kingdom': '🇬🇧', 'France': '🇫🇷',
      'Germany': '🇩🇪', 'Italy': '🇮🇹', 'Unknown': '🌍'
    };

    return nameFlags[countryName || 'Unknown'] || '🌍';
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Get all analytics data with new geolocation fields
      const { data: allEvents, error } = await supabase
        .from('vsl_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!allEvents) {
        setLoading(false);
        return;
      }

      // Filter out Brazilian IPs
      const filteredEvents = allEvents.filter(event => 
        event.country_code !== 'BR' && event.country_name !== 'Brazil'
      );

      // Group events by session
      const sessionGroups = filteredEvents.reduce((acc, event) => {
        if (!acc[event.session_id]) {
          acc[event.session_id] = [];
        }
        acc[event.session_id].push(event);
        return acc;
      }, {} as Record<string, any[]>);

      const sessions = Object.values(sessionGroups);
      const totalSessions = sessions.length;

      // Calculate live users using last_ping (users active in last 2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      
      // Get unique sessions with recent last_ping (excluding Brazil)
      const liveSessionsMap = new Map();
      filteredEvents.forEach(event => {
        if (event.last_ping && new Date(event.last_ping) > twoMinutesAgo) {
          const sessionId = event.session_id;
          if (!liveSessionsMap.has(sessionId) || 
              new Date(event.last_ping) > new Date(liveSessionsMap.get(sessionId).last_ping)) {
            liveSessionsMap.set(sessionId, event);
          }
        }
      });

      const liveSessionsArray = Array.from(liveSessionsMap.values());
      const liveUsers = liveSessionsArray.length;

      // Update live sessions with enhanced geolocation data
      const liveSessionsData: LiveSession[] = liveSessionsArray.map((sessionEvent) => {
        return {
          sessionId: sessionEvent.session_id,
          country: sessionEvent.country_name || 'Unknown',
          countryCode: sessionEvent.country_code || 'XX',
          city: sessionEvent.city || 'Unknown',
          ip: sessionEvent.ip || 'Unknown',
          lastActivity: new Date(sessionEvent.last_ping || sessionEvent.created_at),
          isActive: true
        };
      });

      setLiveSessions(liveSessionsData);

      // Calculate live country breakdown
      const liveCountryMap = new Map();
      liveSessionsData.forEach(session => {
        const key = session.country;
        if (liveCountryMap.has(key)) {
          liveCountryMap.get(key).count++;
        } else {
          liveCountryMap.set(key, {
            country: session.country,
            countryCode: session.countryCode,
            count: 1,
            flag: getCountryFlag(session.countryCode, session.country)
          });
        }
      });

      const liveCountryBreakdown = Array.from(liveCountryMap.values())
        .sort((a, b) => b.count - a.count);

      // Calculate enhanced country statistics
      const countryStats = liveSessionsData.reduce((acc, session) => {
        const key = session.country;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Calculate top countries from all sessions
      const allCountryStats = sessions.reduce((acc, session) => {
        const event = session.find(e => e.country_name) || session[0];
        const country = event.country_name || event.event_data?.country || 'Unknown';
        const countryCode = event.country_code || 'XX';
        
        if (!acc[country]) {
          acc[country] = { count: 0, countryCode };
        }
        acc[country].count++;
        return acc;
      }, {} as { [key: string]: { count: number; countryCode: string } });

      const topCountries = Object.entries(allCountryStats)
        .map(([country, data]) => ({
          country,
          count: data.count,
          flag: getCountryFlag(data.countryCode, country)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate top cities
      const allCityStats = sessions.reduce((acc, session) => {
        const event = session.find(e => e.city) || session[0];
        const city = event.city || 'Unknown';
        const country = event.country_name || event.event_data?.country || 'Unknown';
        const key = `${city}, ${country}`;
        
        if (!acc[key]) {
          acc[key] = { city, country, count: 0 };
        }
        acc[key].count++;
        return acc;
      }, {} as { [key: string]: { city: string; country: string; count: number } });

      const topCities = Object.values(allCityStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // ✅ UPDATED: Calculate video play rate (VTurb loaded successfully)
      const sessionsWithVideoPlay = sessions.filter(session =>
        session.some(event => 
          event.event_type === 'video_play' && 
          event.event_data?.vturb_loaded === true
        )
      ).length;
      const videoPlayRate = totalSessions > 0 ? (sessionsWithVideoPlay / totalSessions) * 100 : 0;

      // ✅ UPDATED: Calculate pitch reach rate (user on page for 35:55 = 2155 seconds)
      const sessionsWithPitchReached = sessions.filter(session =>
        session.some(event => 
          event.event_type === 'pitch_reached' || 
          (event.event_type === 'video_progress' && 
           (event.event_data?.total_time_on_page >= 2155 || event.event_data?.milestone === 'pitch_reached'))
        )
      ).length;
      const pitchReachRate = totalSessions > 0 ? (sessionsWithPitchReached / totalSessions) * 100 : 0;

      // ✅ UPDATED: Calculate lead reach rate (user on page for 7:45 = 465 seconds)
      const sessionsWithLeadReached = sessions.filter(session =>
        session.some(event => 
          event.event_type === 'video_progress' && 
          (event.event_data?.total_time_on_page >= 465 || event.event_data?.milestone === 'lead_reached')
        )
      ).length;
      const leadReachRate = totalSessions > 0 ? (sessionsWithLeadReached / totalSessions) * 100 : 0;

      // Calculate offer click rates and upsell stats
      const offerClicks = filteredEvents.filter(event => event.event_type === 'offer_click');
      const totalOfferClicks = offerClicks.length;
      
      const offerClicksByType = offerClicks.reduce((acc, event) => {
        const offerType = event.event_data?.offer_type;
        if (offerType) {
          acc[offerType] = (acc[offerType] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Calculate upsell statistics
      const upsellStats = {
        '1-bottle': { clicks: 0, accepts: 0, rejects: 0 },
        '3-bottle': { clicks: 0, accepts: 0, rejects: 0 },
        '6-bottle': { clicks: 0, accepts: 0, rejects: 0 },
      };

      offerClicks.forEach(event => {
        const offerType = event.event_data?.offer_type;
        if (offerType && offerType.includes('upsell')) {
          const [, packageType, action] = offerType.split('-');
          if (packageType && upsellStats[packageType as keyof typeof upsellStats]) {
            if (action === 'accept') {
              upsellStats[packageType as keyof typeof upsellStats].accepts++;
            } else if (action === 'reject') {
              upsellStats[packageType as keyof typeof upsellStats].rejects++;
            }
            upsellStats[packageType as keyof typeof upsellStats].clicks++;
          }
        }
      });

      // Count purchases (users who returned from checkout)
      const purchaseEvents = filteredEvents.filter(event => 
        event.event_type === 'offer_click' && 
        event.event_data?.offer_type && 
        event.event_data.offer_type.includes('upsell') &&
        event.event_data.offer_type.includes('accept')
      );
      const totalPurchases = purchaseEvents.length;

      const offerClickRates = {
        '1-bottle': totalSessions > 0 ? ((offerClicksByType['1-bottle'] || 0) / totalSessions) * 100 : 0,
        '3-bottle': totalSessions > 0 ? ((offerClicksByType['3-bottle'] || 0) / totalSessions) * 100 : 0,
        '6-bottle': totalSessions > 0 ? ((offerClicksByType['6-bottle'] || 0) / totalSessions) * 100 : 0,
      };

      // ✅ UPDATED: Calculate average time on page using total_time_on_page_ms
      const pageExitEvents = filteredEvents.filter(event => 
        event.event_type === 'page_exit' && 
        (event.event_data?.total_time_on_page_ms || event.event_data?.time_on_page_ms)
      );
      const totalTimeOnPage = pageExitEvents.reduce((sum, event) => 
        sum + (event.event_data.total_time_on_page_ms || event.event_data.time_on_page_ms || 0), 0
      );
      const averageTimeOnPage = pageExitEvents.length > 0 ? 
        totalTimeOnPage / pageExitEvents.length / 1000 : 0; // Convert to seconds

      // ✅ UPDATED: Get recent sessions with total time on page
      const recentSessions = sessions.slice(0, 10).map(session => {
        const pageEnter = session.find(e => e.event_type === 'page_enter');
        const videoPlay = session.find(e => e.event_type === 'video_play');
        const leadReached = session.find(e => 
          e.event_type === 'video_progress' && 
          (e.event_data?.total_time_on_page >= 465 || e.event_data?.milestone === 'lead_reached')
        );
        const pitchReached = session.find(e => 
          e.event_type === 'pitch_reached' ||
          (e.event_type === 'video_progress' && 
           (e.event_data?.total_time_on_page >= 2155 || e.event_data?.milestone === 'pitch_reached'))
        );
        const offerClick = session.find(e => e.event_type === 'offer_click');
        const pageExit = session.find(e => e.event_type === 'page_exit');
        
        // ✅ NEW: Calculate total time on page from page_exit event or current time
        let totalTimeOnPage = 0;
        if (pageExit?.event_data?.total_time_on_page_ms) {
          totalTimeOnPage = Math.round(pageExit.event_data.total_time_on_page_ms / 1000);
        } else if (pageExit?.event_data?.time_on_page_ms) {
          totalTimeOnPage = Math.round(pageExit.event_data.time_on_page_ms / 1000);
        } else if (pageEnter) {
          // Calculate from page enter to now for active sessions
          const enterTime = new Date(pageEnter.created_at).getTime();
          const now = Date.now();
          totalTimeOnPage = Math.round((now - enterTime) / 1000);
        }

        const sessionEvent = session[0];

        return {
          sessionId: session[0].session_id,
          timestamp: pageEnter?.created_at,
          country: sessionEvent.country_name || sessionEvent.event_data?.country || 'Unknown',
          countryCode: sessionEvent.country_code || 'XX',
          city: sessionEvent.city || 'Unknown',
          ip: sessionEvent.ip || 'Unknown',
          playedVideo: !!videoPlay, // ✅ UPDATED: VTurb loaded successfully
          reachedLead: !!leadReached,
          reachedPitch: !!pitchReached,
          clickedOffer: offerClick?.event_data?.offer_type || null,
          timeOnPage: pageExit?.event_data?.time_on_page_ms ? 
            Math.round(pageExit.event_data.time_on_page_ms / 1000) : null,
          totalTimeOnPage: totalTimeOnPage, // ✅ NEW: Total time on page
          isLive: liveSessionsData.some(liveSession => 
            liveSession.sessionId === session[0].session_id
          ),
        };
      });

      setAnalytics({
        totalSessions,
        videoPlayRate,
        pitchReachRate,
        leadReachRate,
        offerClickRates,
        upsellStats,
        averageTimeOnPage,
        totalOfferClicks,
        totalPurchases,
        recentSessions,
        liveUsers,
        countryStats,
        topCountries,
        topCities,
        liveCountryBreakdown,
      });

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
      
      // Set up real-time subscription for last_ping updates
      const subscription = supabase
        .channel('vsl_analytics_live_users')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'vsl_analytics',
            filter: 'last_ping=not.is.null'
          },
          () => {
            console.log('Live user ping detected, refreshing analytics...');
            fetchAnalytics();
          }
        )
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'vsl_analytics'
          },
          () => {
            console.log('New session detected, refreshing analytics...');
            fetchAnalytics();
          }
        )
        .subscribe();

      // Auto-refresh every 10 seconds for live user count
      const interval = setInterval(fetchAnalytics, 10000);

      return () => {
        subscription.unsubscribe();
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
  
  // ✅ NEW: Função para formatar tempo de página (não vídeo)
  const formatPageTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // ✅ NEW: Função para mostrar progresso baseado no tempo na página
  const getPageProgress = (seconds: number) => {
    if (seconds >= 2155) return '🎯 Pitch'; // 35:55
    if (seconds >= 465) return '📈 Lead'; // 7:45
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

  // Format live country breakdown for display
  const formatLiveCountryBreakdown = () => {
    if (analytics.liveCountryBreakdown.length === 0) return '';
    
    return analytics.liveCountryBreakdown
      .slice(0, 3) // Show top 3 countries
      .map(item => `${item.flag} ${item.count} ${item.countryCode}`)
      .join(' • ');
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

  // Show loading screen while fetching analytics
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

  // Main dashboard content (authenticated)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized layout */}
      <div className="p-2 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - Mobile optimized */}
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

          {/* Tab Navigation - Mobile optimized */}
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
              {/* Live Users Highlight - Mobile optimized */}
              <div className="mb-4 sm:mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-2 sm:w-3 h-2 sm:h-3 bg-white rounded-full animate-pulse"></div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                          👤 {analytics.liveUsers} usuários ativos agora
                        </h2>
                      </div>
                      {analytics.liveCountryBreakdown.length > 0 && (
                        <p className="text-green-100 text-sm sm:text-base lg:text-lg">
                          🌎 {formatLiveCountryBreakdown()}
                        </p>
                      )}
                    </div>
                    <div className="bg-white/20 p-3 sm:p-4 rounded-xl">
                      <Zap className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Funnel - Mobile optimized */}
              <div className="mb-4 sm:mb-8">
                <ConversionFunnel />
              </div>

              {/* Conversion Heatmap - Mobile optimized */}
              <div className="mb-4 sm:mb-8">
                <ConversionHeatmap />
              </div>

              {/* Sales Chart - Mobile optimized */}
              <div className="mb-4 sm:mb-8">
                <SalesChart />
              </div>

              {/* ✅ NEW: Manel Chart - Only shows with 5+ sales */}
              <div className="mb-4 sm:mb-8">
                <ManelChart />
              </div>

              {/* Stats Grid - Mobile optimized */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
                {/* Live Users */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200 relative overflow-hidden">
                  <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                    <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Online</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{analytics.liveUsers}</p>
                      <p className="text-xs text-gray-500">2 min</p>
                    </div>
                    <div className="bg-green-100 p-2 sm:p-3 rounded-lg self-end sm:self-auto">
                      <Activity className="w-4 sm:w-6 h-4 sm:h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Total Sessions */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Sessões</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{analytics.totalSessions}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="bg-gray-100 p-2 sm:p-3 rounded-lg self-end sm:self-auto">
                      <Users className="w-4 sm:w-6 h-4 sm:h-6 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* ✅ UPDATED: Video Play Rate (VTurb loaded) */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">VTurb</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{analytics.videoPlayRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Carregou</p>
                    </div>
                    <div className="bg-green-100 p-2 sm:p-3 rounded-lg self-end sm:self-auto">
                      <Play className="w-4 sm:w-6 h-4 sm:h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Purchases */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Compras</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{analytics.totalPurchases}</p>
                      <p className="text-xs text-gray-500">Upsells</p>
                    </div>
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-lg self-end sm:self-auto">
                      <ShoppingCart className="w-4 sm:w-6 h-4 sm:h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upsell Performance - Mobile optimized */}
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
                            <span className="font-semibold">{stats.clicks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Aceites:</span>
                            <span className="font-semibold text-green-600">{stats.accepts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recusas:</span>
                            <span className="font-semibold text-red-600">{stats.rejects}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span>Taxa:</span>
                            <span className="font-semibold text-blue-600">
                              {stats.clicks > 0 ? ((stats.accepts / stats.clicks) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ✅ UPDATED: Recent Sessions Table with new column */}
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
                      {analytics.recentSessions.slice(0, 10).map((session, index) => (
                        <tr key={session.sessionId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${session.isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                              <span className={`text-xs font-medium ${session.isLive ? 'text-green-600' : 'text-gray-500'}`}>
                                {session.isLive ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <span>{getCountryFlag(session.countryCode, session.country)}</span>
                              <span className="truncate max-w-16 sm:max-w-20">{session.country}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 font-mono">
                            {maskIP(session.ip)}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              session.playedVideo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {session.playedVideo ? 'Sim' : 'Não'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {session.totalTimeOnPage > 0 ? (
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {formatPageTime(session.totalTimeOnPage)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {getPageProgress(session.totalTimeOnPage)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {session.clickedOffer ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                {session.clickedOffer}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : activeTab === 'tracking' ? (
            <TrackingTestPanel />
          ) : activeTab === 'redtrack' ? (
            <RedTrackTestPanel />
          ) : (
            // ✅ NEW: Settings Tab - Delay Controller
            <div className="space-y-6">
              {/* Delay Controller */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Configuração de Delay (DESABILITADO)</h3>
                </div>

                <p className="text-sm text-red-600 mb-6 font-semibold">
                  ⚠️ SISTEMA DE DELAY REMOVIDO: Todos os botões e seções agora aparecem imediatamente. Esta configuração não tem mais efeito.
                </p>

                {/* Current Status */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Status atual: DELAY REMOVIDO - Conteúdo sempre visível
                    </span>
                  </div>
                  <div className="bg-red-100 border border-red-300 rounded px-2 py-1 inline-block">
                    <span className="text-red-800 text-xs font-bold">SISTEMA DESABILITADO</span>
                  </div>
                </div>

                {/* Preset Buttons - Disabled */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 opacity-50">
                  {[
                    { label: 'Sem delay', value: 0 },
                    { label: '30 segundos', value: 30 },
                    { label: '1 minuto', value: 60 },
                    { label: '2 minutos', value: 120 },
                    { label: '5 minutos', value: 300 },
                    { label: '35min55s (REMOVIDO)', value: 2155, isDefault: true }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleDelayChange(preset.value)}
                      disabled={true}
                      className={`p-3 text-sm rounded-lg border transition-colors ${
                        contentDelay === preset.value
                          ? preset.isDefault 
                            ? 'bg-red-500 text-white border-red-600'
                            : 'bg-red-600 text-white border-red-600'
                          : preset.isDefault
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                      } cursor-not-allowed`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
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
                      disabled={true}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <button
                      onClick={resetToDefault}
                      disabled={true}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium cursor-not-allowed opacity-50"
                    >
                      Removido
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ Sistema de Delay Removido:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• <strong>Todos os botões e seções</strong> agora aparecem imediatamente</li>
                    <li>• <strong>Não há mais delay</strong> - o conteúdo é sempre visível</li>
                    <li>• <strong>Esta configuração</strong> foi mantida apenas para referência</li>
                    <li>• <strong>Para reativar o delay</strong> seria necessário modificar o código</li>
                    <li>• <strong>Conversões podem aumentar</strong> com acesso imediato aos botões</li>
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