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
  const getGeolocationData = async (): Promise<GeolocationData> => {
    return withCircuitBreaker(
      geolocationCircuitBreaker,
      async (): Promise<GeolocationData> => {
    // Check if we already have the data in sessionStorage
    const cachedData = sessionStorage.getItem('geolocation_data');
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Skip geolocation in development/preview environments
    if (window.location.hostname.includes("local") || 
        window.location.hostname.includes("preview") ||
        window.location.hostname.includes("localhost") || 
        window.location.hostname.includes("127.0.0.1") ||
        window.location.hostname.includes("stackblitz") ||
        window.location.hostname.includes("bolt.new")) {
      const devData: GeolocationData = {
        ip: "127.0.0.1",
        country_code: "US", // ✅ CHANGED: Use US for dev to test analytics
        country_name: "United States",
        city: "Development",
        region: "Dev Environment"
      };
      sessionStorage.setItem('geolocation_data', JSON.stringify(devData));
      return devData;
    }

    let apiAttempts = 0;
    // Default fallback data
    const defaultData: GeolocationData = {
      ip: 'Unknown',
      country_code: 'XX',
      country_name: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };

    // Multiple stable geolocation services with proper data mapping
    const services = shuffle([
      {
        url: 'https://api.ipdata.co/?api-key=c6d4a3e2f5a8b7d1e9c2f5a8b7d1e9c2',
        mapper: (data: any) => ({
          ip: data.ip || 'Unknown',
          country_code: data.country_code || data.country?.code || 'XX',
          country_name: data.country_name || data.country?.name || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown'
        })
      },
      {
        url: 'https://api.ipgeolocation.io/ipgeo?apiKey=d1e9c2f5a8b7d1e9c2f5a8b7',
        mapper: (data: any) => ({
          ip: data.ip || 'Unknown',
          country_code: data.country_code2 || data.country_code || 'XX',
          country_name: data.country_name || 'Unknown',
          city: data.city || 'Unknown',
          region: data.state_prov || data.region || 'Unknown'
        })
      },
      {
        url: 'https://ipwho.is/',
        mapper: (data: any) => ({
          ip: data.ip || 'Unknown',
          country_code: data.country_code || data.country?.code || 'XX',
          country_name: data.country || data.country?.name || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown'
        })
      }
    ]);
    
    // Add more reliable services
    services.push(
      {
        url: 'https://ipapi.co/json/',
        mapper: (data: any) => ({
          ip: data.ip || 'Unknown',
          country_code: data.country_code || data.country || 'XX',
          country_name: data.country_name || data.country || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || data.region_name || 'Unknown'
        })
      },
      {
        url: 'https://ipinfo.io/json',
        mapper: (data: any) => ({
          ip: data.ip || 'Unknown',
          country_code: data.country || 'XX',
          country_name: getCountryNameFromCode(data.country) || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown'
        })
      }
    );

    for (const service of services) {
      try {
        apiAttempts++;
        console.log(`Trying geolocation service: ${service.url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(service.url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; VSL-Analytics/1.0)'
          }
        });
        
        clearTimeout(timeoutId);
        
        // Check for HTTP errors but don't throw for 403 (common with geo APIs)
        if (!response.ok && response.status !== 403) {
          console.warn(`Service ${service.url} returned status ${response.status}`);
          continue;
        }
        
        let data;
        try {
          data = await response.json();
        } catch (error) {
          console.warn(`Error parsing JSON from ${service.url}:`, error);
          continue;
        }
        
        console.log(`Geolocation API response from ${service.url}:`, data);
        
        const geolocation = service.mapper(data);
        
        // Validate that we got meaningful data
        if (geolocation.ip && geolocation.ip !== 'Unknown' && 
            geolocation.country_code && geolocation.country_code !== 'XX') {
          
          // ✅ NEW: Check if the IP is from Brazil and set flag
          if (geolocation.country_code === 'BR' || geolocation.country_name === 'Brazil') {
            isBrazilianIP.current = true;
            console.log('🇧🇷 Brazilian IP detected - analytics tracking will be skipped');
            
            // Store the geolocation data with Brazilian flag
            const geoWithFlag = {
              ...geolocation,
              is_brazilian_ip: true,
              api_attempts: apiAttempts
            };
            sessionStorage.setItem('geolocation_data', JSON.stringify(geoWithFlag));
            return geoWithFlag;
          }
          
          // Cache the data in sessionStorage
          sessionStorage.setItem('geolocation_data', JSON.stringify(geolocation));
          console.log('Successfully obtained geolocation data:', geolocation);
          
          return geolocation;
        } 
        
        // If we got a response but it's incomplete, log and continue
        if (data && Object.keys(data).length > 0) {
          console.warn(`Service ${service.url} returned incomplete data, but continuing:`, geolocation);
        }
        else {
          console.warn(`Service ${service.url} returned incomplete data:`, geolocation);
          continue; // Try next service
        }
        
      } catch (error) {
        console.warn(`Error with geolocation service ${service.url}:`, error);
        continue; // Try next service
      }
    }

    // If all services fail, try to get basic browser info
    try {
      const browserLang = navigator.language || 'en-US';
      const countryFromLang = browserLang.split('-')[1]?.toUpperCase() || 'XX';
      
      // Get browser timezone for better country detection
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      let countryFromTimezone = 'XX';
      
      // Extract country from timezone if possible
      if (timezone.includes('/')) {
        const parts = timezone.split('/');
        if (parts.length > 1) {
          // Convert continent/city to potential country code
          const city = parts[parts.length - 1].replace('_', ' ');
          
          // Map common cities to country codes
          const cityToCountry: Record<string, string> = {
            'New_York': 'US', 'Los_Angeles': 'US', 'Chicago': 'US',
            'London': 'GB', 'Paris': 'FR', 'Berlin': 'DE',
            'Tokyo': 'JP', 'Sydney': 'AU', 'Auckland': 'NZ',
            'Sao_Paulo': 'BR', 'Rio_Janeiro': 'BR', 'Brasilia': 'BR',
            'Mexico_City': 'MX', 'Toronto': 'CA', 'Vancouver': 'CA'
          };
          
          countryFromTimezone = cityToCountry[city] || 'XX';
        }
      }
      
      // Use the most reliable country code
      const detectedCountryCode = countryFromTimezone !== 'XX' ? countryFromTimezone : countryFromLang;
      
      const browserData = {
        ...defaultData,
        ip: `Browser-${Date.now()}`,
        country_code: detectedCountryCode,
        country_name: getCountryNameFromCode(detectedCountryCode),
        city: 'Browser Detected',
        region: timezone || 'Unknown',
        is_browser_location: true,
        api_attempts: apiAttempts,
        browser_info: {
          language: navigator.language,
          userAgent: navigator.userAgent,
          timezone: timezone,
          platform: navigator.platform
        }
      };
      
      // ✅ NEW: Check if browser-detected country is Brazil
      if (browserData.country_code === 'BR' || browserData.country_name === 'Brazil') {
        isBrazilianIP.current = true;
        browserData.is_brazilian_ip = true;
        console.log('🇧🇷 Brazilian IP detected via browser - analytics tracking will be skipped');
      }
      
      sessionStorage.setItem('geolocation_data', JSON.stringify(browserData));
      console.log('Using browser-detected location:', browserData);
      return browserData;
    } catch (error) {
      console.warn('Error getting browser location info:', error);
    }

    // Final fallback
    const finalFallback = {
      ...defaultData,
      is_browser_location: true,
      api_attempts: apiAttempts,
      error_log: {
        message: 'All geolocation services failed',
        timestamp: new Date().toISOString()
      }
    };
    console.log('Using final fallback data:', finalFallback);
    sessionStorage.setItem('geolocation_data', JSON.stringify(finalFallback));
    return finalFallback;
      },
      async () => {
        // Fallback: return cached data or default
        const cachedData = sessionStorage.getItem('geolocation_data');
        if (cachedData) {
          return JSON.parse(cachedData);
        }
        
        // Create a fallback with browser info
        const browserLang = navigator.language || 'en-US';
        const countryFromLang = browserLang.split('-')[1]?.toUpperCase() || 'XX';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        
        const circuitBreakerFallback = {
          ip: 'Circuit-Breaker-Fallback',
          country_code: countryFromLang,
          country_name: getCountryNameFromCode(countryFromLang),
          city: 'Circuit Breaker Fallback',
          region: timezone || 'Unknown',
          is_browser_location: true,
          circuit_breaker_active: true,
          browser_info: {
            language: navigator.language,
            userAgent: navigator.userAgent,
            timezone: timezone,
            platform: navigator.platform
          }
        };
        
        // Store in session storage for future use
        sessionStorage.setItem('geolocation_data', JSON.stringify(circuitBreakerFallback));
        return circuitBreakerFallback;
      }
    );
  };
  
  // Helper function to shuffle array (for randomizing API order)
  function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Helper function to get country name from country code
  const getCountryNameFromCode = (code: string): string => {
    const countryMap: { [key: string]: string } = {
      'US': 'United States',
      'BR': 'Brazil',
      'CA': 'Canada',
      'GB': 'United Kingdom',
      'DE': 'Germany',
      'FR': 'France',
      'ES': 'Spain',
      'IT': 'Italy',
      'JP': 'Japan',
      'CN': 'China',
      'IN': 'India', 
      'AU': 'Australia',
      'RU': 'Russia',
      'KR': 'South Korea', 
      'NL': 'Netherlands',
      'XX': 'Unknown'
    };
    return countryMap[code?.toUpperCase() || 'XX'] || 'Unknown';
  };

  // Function to update last_ping for live user tracking
  const updatePing = async () => {
    if (!sessionRecordId.current) return;
    
    try {
      await supabase
        .from('vsl_analytics')
        .update({ 
          last_ping: new Date().toISOString(),
          is_counted: true,
          dashboard_category: 'session'
        })
        .eq('id', sessionRecordId.current);
      
      console.log('Updated ping for session:', sessionId.current);
    } catch (error) {
      console.error('Error updating ping:', error);
    }
  };

        const sessionData = {
          session_id: sessionId.current,
          timestamp: new Date().toISOString(),
          event_type: 'session_start',
          ip: geolocationData.current?.ip || null,
          country_code: geolocationData.current?.country_code || null,
          country_name: geolocationData.current?.country_name || null,
          city: geolocationData.current?.city || 'Unknown',
          region: geolocationData.current?.region || 'Unknown',
          last_ping: new Date().toISOString(),
          is_brazilian_ip: isBrazilianIP.current,
          is_browser_location: geolocationData.current?.is_browser_location || false,
          browser_info: geolocationData.current?.browser_info || null,
          api_attempts: geolocationData.current?.api_attempts || 0,
          is_counted: true,
          dashboard_category: 'session'
        };

        const newSessionData = {
          session_id: sessionId.current,
          timestamp: new Date().toISOString(),
          event_type: 'session_start',
          ip: geolocationData.current?.ip || null,
          country_code: geolocationData.current?.country_code || null,
          country_name: geolocationData.current?.country_name || null,
          city: geolocationData.current?.city || 'Unknown',
          region: geolocationData.current?.region || 'Unknown',
          last_ping: new Date().toISOString(),
          is_brazilian_ip: isBrazilianIP.current,
          is_browser_location: geolocationData.current?.is_browser_location || false,
          browser_info: geolocationData.current?.browser_info || null,
          api_attempts: geolocationData.current?.api_attempts || 0,
          is_counted: true,
          dashboard_category: 'session'
        };
        
        // Mark as tracked to prevent duplicates
};