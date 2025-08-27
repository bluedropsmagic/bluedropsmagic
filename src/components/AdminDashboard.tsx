import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured, safeSupabaseOperation } from '../lib/supabase';
import { SalesChart } from './SalesChart';
import { ConversionFunnel } from './ConversionFunnel';
import { ConversionHeatmap } from './ConversionHeatmap';
import { TrackingTestPanel } from './TrackingTestPanel';
import { ManelChart } from './ManelChart';
import { UpsellDownsellSessions } from './UpsellDownsellSessions';
import { RedTrackTestPanel } from './RedTrackTestPanel';
import { BoltNavigation } from './BoltNavigation';
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
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle
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
  longestSessions: Array<{
    sessionId: string;
    country: string;
    countryCode: string;
    city: string;
    ip: string;
    totalTimeOnPage: number;
    isLive: boolean;
    lastActivity: Date;
    progress: string;
    events: number;
  }>;
}

interface LiveSession {
  sessionId: string;
  country: string;
  countryCode: string;
  city: string;
  ip: string;
  lastActivity: Date;
  isActive: boolean;
  currentPage: string;
  timeOnSite: number;
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
    longestSessions: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'tracking' | 'redtrack' | 'testing' | 'settings'>('analytics');
  const [contentDelay, setContentDelay] = useState(2155); // Default to 35:55 (2155 seconds)
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');

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

  // Delay management functions
  const handleDelayChange = (newDelay: number) => {
    setContentDelay(newDelay);
    localStorage.setItem('content_delay', newDelay.toString());
    
    // Dispatch custom event to notify main app
    window.dispatchEvent(new CustomEvent('delayChanged', { detail: { delay: newDelay } }));
    
    console.log('🕐 Admin changed delay to:', newDelay, 'seconds');
  };

  const resetToDefault = () => {
    handleDelayChange(2155); // Default to 35:55
  };

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

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase not configured, using empty analytics data');
        setAnalytics({
          totalSessions: 0,
          videoPlayRate: 0,
          pitchReachRate: 0,
          leadReachRate: 0,
          offerClickRates: { '1-bottle': 0, '3-bottle': 0, '6-bottle': 0 },
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
        setLoading(false);
        return;
      }

      // Get all analytics data with new geolocation fields
      const allEvents = await safeSupabaseOperation(async () => {
        if (!supabase) throw new Error('Supabase client not available');
        
        const { data, error } = await supabase
          .from('vsl_analytics')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      });

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
        // Determine current page from event data
        let currentPage = 'Home';
        const eventData = sessionEvent.event_data || {};
        const path = eventData.current_path || eventData.page || '';
        
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

        // Calculate time on site
        const createdAt = new Date(sessionEvent.created_at);
        const lastPing = new Date(sessionEvent.last_ping || sessionEvent.created_at);
        const timeOnSite = Math.floor((lastPing.getTime() - createdAt.getTime()) / 1000);

        return {
          sessionId: sessionEvent.session_id,
          country: sessionEvent.country_name || 'Unknown',
          countryCode: sessionEvent.country_code || 'XX',
          city: sessionEvent.city || 'Unknown',
          ip: sessionEvent.ip || 'Unknown',
          lastActivity: new Date(sessionEvent.last_ping || sessionEvent.created_at),
          isActive: true,
          currentPage,
          timeOnSite
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

      // ✅ NEW: Calculate longest sessions (users who stayed the longest)
      const longestSessionsData = sessions
        .map(session => {
          const pageEnter = session.find(e => e.event_type === 'page_enter');
          const pageExit = session.find(e => e.event_type === 'page_exit');
          const sessionEvent = session[0];
          
          // Calculate total time on page
          let totalTimeOnPage = 0;
          if (pageExit?.event_data?.total_time_on_page_ms) {
            totalTimeOnPage = Math.round(pageExit.event_data.total_time_on_page_ms / 1000);
          } else if (pageExit?.event_data?.time_on_page_ms) {
            totalTimeOnPage = Math.round(pageExit.event_data.time_on_page_ms / 1000);
          } else if (pageEnter) {
            // For active sessions, calculate from page enter to last ping
            const enterTime = new Date(pageEnter.created_at).getTime();
            const lastPing = sessionEvent.last_ping ? new Date(sessionEvent.last_ping).getTime() : Date.now();
            totalTimeOnPage = Math.round((lastPing - enterTime) / 1000);
          }
          
          // Determine progress based on time on page
          let progress = '👀 Início';
          if (totalTimeOnPage >= 2155) progress = '🎯 Pitch Reached (35:55)';
          else if (totalTimeOnPage >= 465) progress = '📈 Lead Reached (7:45)';
          else if (totalTimeOnPage >= 300) progress = '⏰ Engajado (5min+)';
          else if (totalTimeOnPage >= 60) progress = '▶️ Navegando';
          
          // Check if session is still live
          const isLive = liveSessionsData.some(liveSession => 
            liveSession.sessionId === sessionEvent.session_id
          );
          
          return {
            sessionId: sessionEvent.session_id,
            country: sessionEvent.country_name || 'Unknown',
            countryCode: sessionEvent.country_code || 'XX',
            city: sessionEvent.city || 'Unknown',
            ip: sessionEvent.ip || 'Unknown',
            totalTimeOnPage,
            isLive,
            lastActivity: new Date(sessionEvent.last_ping || sessionEvent.created_at),
            progress,
            events: session.length
          };
        })
        .filter(session => session.totalTimeOnPage > 30) // Only sessions longer than 30 seconds
        .sort((a, b) => b.totalTimeOnPage - a.totalTimeOnPage) // Sort by longest time first
        .slice(0, 20); // Top 20 longest sessions

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

      // Calculate video play rate (VTurb loaded successfully)
      const sessionsWithVideoPlay = sessions.filter(session =>
        session.some(event => 
          event.event_type === 'video_play' && 
          event.event_data?.vturb_loaded === true
        )
      ).length;
      const videoPlayRate = totalSessions > 0 ? (sessionsWithVideoPlay / totalSessions) * 100 : 0;

      // Calculate pitch reach rate (user on page for 35:55 = 2155 seconds)
      const sessionsWithPitchReached = sessions.filter(session =>
        session.some(event => 
          event.event_type === 'pitch_reached' || 
          (event.event_type === 'video_progress' && 
           (event.event_data?.total_time_on_page >= 2155 || event.event_data?.milestone === 'pitch_reached'))
        )
      ).length;
      const pitchReachRate = totalSessions > 0 ? (sessionsWithPitchReached / totalSessions) * 100 : 0;

      // Calculate lead reach rate (user on page for 7:45 = 465 seconds)
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
          const parts = offerType.split('-');
          const packageType = parts[1]; // Extract package type
          const action = parts[2]; // Extract action
          
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

      // Count purchases (users who accepted upsells)
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

      // Calculate average time on page using total_time_on_page_ms
      const pageExitEvents = filteredEvents.filter(event => 
        event.event_type === 'page_exit' && 
        (event.event_data?.total_time_on_page_ms || event.event_data?.time_on_page_ms)
      );
      const totalTimeOnPage = pageExitEvents.reduce((sum, event) => 
        sum + (event.event_data.total_time_on_page_ms || event.event_data.time_on_page_ms || 0), 0
      );
      const averageTimeOnPage = pageExitEvents.length > 0 ? 
        totalTimeOnPage / pageExitEvents.length / 1000 : 0; // Convert to seconds

      // Get recent sessions with total time on page
      const recentSessions = sessions.slice(0, 20).map(session => {
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
        
        // Calculate total time on page from page_exit event or current time
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
          playedVideo: !!videoPlay,
          reachedLead: !!leadReached,
          reachedPitch: !!pitchReached,
          clickedOffer: offerClick?.event_data?.offer_type || null,
          timeOnPage: pageExit?.event_data?.time_on_page_ms ? 
            Math.round(pageExit.event_data.time_on_page_ms / 1000) : null,
          totalTimeOnPage: totalTimeOnPage,
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
        longestSessions: longestSessionsData,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && supabaseStatus === 'connected') {
      fetchAnalytics();
      
      // Auto-refresh every 30 seconds for live user count
      const interval = setInterval(fetchAnalytics, 30000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, supabaseStatus]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    if (minutes > 0) {
      return `${minutes}min${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    } else {
      return `${remainingSeconds}s`;
    }
  };
  
  // Function to format page time (not video time)
  const formatPageTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Function to show progress based on time on page
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

  const formatTimeOnSite = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format live country breakdown for display
  const formatLiveCountryBreakdown = () => {
    if (analytics.liveCountryBreakdown.length === 0) return '';
    
    return analytics.liveCountryBreakdown
      .slice(0, 3) // Show top 3 countries
      .map(item => `${item.flag} ${item.count} ${item.countryCode}`)
      .join(' • ');
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
            icon: <AlertTriangle className="w-5 h-5" />,
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

  // Main dashboard content (authenticated)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bolt Navigation */}
      <BoltNavigation />
      
      {/* Mobile-optimized layout */}
      <div className="p-2 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Supabase Status Banner */}
          <SupabaseStatusBanner />

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
          {activeTab === 'analytics' && supabaseStatus === 'connected' ? (
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

                {/* Video Play Rate (VTurb loaded) */}
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

              {/* Live Users Detailed Panel */}
              {analytics.liveUsers > 0 && (
                <div className="mb-4 sm:mb-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      👥 Usuários Online Agora ({analytics.liveUsers})
                    </h3>

                    {/* Live Users Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-600">Live Users</p>
                            <p className="text-2xl font-bold text-blue-900">{analytics.liveUsers}</p>
                            <p className="text-xs text-blue-500">últimos 2 minutos</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Globe className="w-5 h-5 text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-green-600">Países</p>
                            <p className="text-2xl font-bold text-green-900">{Object.keys(analytics.countryStats).length}</p>
                            <p className="text-xs text-green-500">países ativos</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-orange-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-orange-600">Tempo Médio</p>
                            <p className="text-lg font-bold text-orange-900">
                              {liveSessions.length > 0 ? formatTimeOnSite(
                                Math.floor(liveSessions.reduce((sum, session) => sum + session.timeOnSite, 0) / liveSessions.length)
                              ) : '0s'}
                            </p>
                            <p className="text-xs text-orange-500">no site</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Countries Breakdown */}
                    {analytics.liveCountryBreakdown.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Por País:
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {analytics.liveCountryBreakdown.map((item, index) => (
                            <div key={index} className="bg-white p-3 rounded border border-gray-200">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{item.flag}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{item.country}</p>
                                  <p className="text-xs text-gray-500">{item.count} usuário{item.count > 1 ? 's' : ''}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Individual Live Users List */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="p-4 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Lista Individual de Usuários:
                        </h4>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {liveSessions.map((user, index) => (
                          <div key={user.sessionId} className={`p-4 ${index !== liveSessions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{getCountryFlag(user.countryCode)}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      {user.city}, {user.country}
                                    </span>
                                    <span className="text-lg">{getPageIcon(user.currentPage)}</span>
                                    <span className="text-xs text-gray-500">{user.currentPage}</span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Sessão: {user.sessionId.substring(0, 8)}... • IP: {maskIP(user.ip)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {formatTimeOnSite(user.timeOnSite)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.lastActivity.toLocaleTimeString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Manel Chart - Only shows with 5+ sales */}
              <div className="mb-4 sm:mb-8">
                <ManelChart />
              </div>

              {/* Upsell & Downsell Sessions */}
              <div className="mb-4 sm:mb-8">
                <UpsellDownsellSessions />
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

              {/* Active Sessions with Most Page Time */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-600" />
                        🔴 Sessões Ativas com Mais Tempo
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Usuários online ordenados por tempo na página (últimos 2 minutos)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600">
                          {analytics.liveUsers} online agora
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Atualização automática a cada 10s
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  {liveSessions.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            País/Cidade
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tempo Online
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progresso
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Última Atividade
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sessão
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {liveSessions
                          .sort((a, b) => {
                            // Calculate time online for each session
                            const timeA = Date.now() - a.lastActivity.getTime();
                            const timeB = Date.now() - b.lastActivity.getTime();
                            return timeA - timeB; // Sort by longest time online (oldest activity first)
                          })
                          .map((session, index) => {
                            // Calculate how long they've been online
                            const timeOnline = Math.floor((Date.now() - session.lastActivity.getTime()) / 1000);
                            const minutesOnline = Math.floor(timeOnline / 60);
                            const secondsOnline = timeOnline % 60;
                            
                            // Get progress based on session data from analytics
                            const sessionData = analytics.recentSessions.find(s => s.sessionId === session.sessionId);
                            
                            return (
                              <tr key={session.sessionId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ring-2 ring-green-200 bg-green-50/30`}>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-bold text-green-600">
                                      ONLINE
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span>{getCountryFlag(session.countryCode, session.country)}</span>
                                      <span className="text-sm font-medium text-gray-900 truncate max-w-20 sm:max-w-32">
                                        {session.country}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500 truncate max-w-20 sm:max-w-32">
                                      {session.city}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-green-700">
                                      {minutesOnline}:{secondsOnline.toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-xs text-green-600">
                                      online agora
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                  {sessionData ? (
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      sessionData.totalTimeOnPage >= 2155 ? 'bg-purple-100 text-purple-800' :
                                      sessionData.totalTimeOnPage >= 465 ? 'bg-yellow-100 text-yellow-800' :
                                      sessionData.totalTimeOnPage >= 300 ? 'bg-blue-100 text-blue-800' :
                                      sessionData.totalTimeOnPage >= 60 ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {getPageProgress(sessionData.totalTimeOnPage)}
                                    </span>
                                  ) : (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                      🔴 Ativo
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-xs text-gray-500">
                                    {session.lastActivity.toLocaleTimeString('pt-BR')}
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                  <div className="text-xs text-gray-500 font-mono">
                                    {session.sessionId.substring(0, 8)}...
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium text-lg mb-2">
                        📊 Nenhum usuário ativo no momento
                      </p>
                      <p className="text-gray-500 text-sm">
                        Aguarde visitantes acessarem o site
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Sessions Table with new column */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Sessões Mais Duradouras (Top 20)
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Usuários que ficaram mais tempo no site (mínimo 30 segundos)
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ranking
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          País/Cidade
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tempo Total
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progresso
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Eventos
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Última Atividade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.longestSessions.map((session, index) => (
                        <tr key={session.sessionId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${session.isLive ? 'ring-2 ring-green-200' : ''}`}>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <span className="text-lg">🏆</span>
                              )}
                              {index === 1 && (
                                <span className="text-lg">🥈</span>
                              )}
                              {index === 2 && (
                                <span className="text-lg">🥉</span>
                              )}
                              <span className="text-sm font-bold text-gray-900">
                                #{index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${session.isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                              <span className={`text-xs font-medium ${session.isLive ? 'text-green-600' : 'text-gray-500'}`}>
                                {session.isLive ? 'LIVE' : 'OFF'}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <span>{getCountryFlag(session.countryCode, session.country)}</span>
                                <span className="font-medium">{session.country}</span>
                              </div>
                              <span className="text-xs text-gray-500">{session.city}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-lg font-bold text-blue-600">
                                {formatPageTime(session.totalTimeOnPage)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {Math.floor(session.totalTimeOnPage / 60)}min {session.totalTimeOnPage % 60}s
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              session.progress.includes('Pitch') ? 'bg-purple-100 text-purple-800' :
                              session.progress.includes('Lead') ? 'bg-yellow-100 text-yellow-800' :
                              session.progress.includes('Engajado') ? 'bg-blue-100 text-blue-800' :
                              session.progress.includes('Navegando') ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {session.progress}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-medium">{session.events}</span>
                            <span className="text-xs text-gray-500 ml-1">eventos</span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                            {session.lastActivity.toLocaleTimeString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Sessions Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Últimas 10 Sessões
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Atividade mais recente no site
                  </p>
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
                      {analytics.recentSessions.slice(0, 20).map((session, index) => (
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
          ) : activeTab === 'analytics' && supabaseStatus !== 'connected' ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
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
          ) : activeTab === 'tracking' ? (
            <TrackingTestPanel />
          ) : activeTab === 'redtrack' ? (
            <RedTrackTestPanel />
          ) : activeTab === 'testing' ? (
            <AdminTestingEnvironment />
          ) : (
            // Settings Tab - Delay Controller
            <div className="space-y-6">
              {/* Delay Controller */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Configuração de Delay de Conteúdo</h3>
                </div>

                <p className="text-sm text-blue-600 mb-6 font-semibold">
                  ⏰ SISTEMA DE DELAY ATIVO: O conteúdo completo aparece após o tempo configurado (padrão: 35min55s).
                </p>

                {/* Current Status */}
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

                {/* Preset Buttons */}
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <button
                      onClick={resetToDefault}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Padrão (35:55)
                    </button>
                  </div>
                </div>

                {/* Info */}
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