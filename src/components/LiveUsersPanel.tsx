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
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Live Users</h3>
              <p className="text-sm text-gray-500">Users active in the last 2 minutes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="auto-refresh" className="text-sm text-gray-600">
                Auto-refresh
              </label>
            </div>
            
            <button
              onClick={fetchLiveUsers}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-600">Countries</p>
                <p className="text-2xl font-bold text-green-900">{Object.keys(stats.byCountry).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-purple-600">Active Pages</p>
                <p className="text-2xl font-bold text-purple-900">{Object.keys(stats.byPage).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-orange-600">Avg. Time</p>
                <p className="text-2xl font-bold text-orange-900">{formatTimeOnSite(Math.floor(stats.averageTimeOnSite))}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Users List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Active Users</h4>
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          
          {loading && stats.total === 0 ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
              <span className="text-gray-500">Loading live users...</span>
            </div>
          ) : stats.total === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users currently active</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {liveUsers.map((user) => (
                <div key={user.session_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCountryFlag(user.country_code)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.city}, {user.country_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getPageName(user.current_page)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeOnSite(user.time_on_site)}</span>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Country and Page Breakdown */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Top Countries */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Top Countries</h5>
              <div className="space-y-2">
                {Object.entries(stats.byCountry)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{country}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Top Pages */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Active Pages</h5>
              <div className="space-y-2">
                {Object.entries(stats.byPage)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([page, count]) => (
                    <div key={page} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate">{page}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

@@ .. @@
            {activeTab === 'live-users' && supabaseStatus === 'connected' && (
              <LiveUsersPanel />
            )}

@@ .. @@
            {/* Show configuration message for analytics tabs when Supabase is not connected */}
            {['live-users', 'funnel', 'sales', 'heatmap', 'sessions', 'manel'].includes(activeTab) && supabaseStatus !== 'connected' && (
              <div>Configuration message</div>
            )}