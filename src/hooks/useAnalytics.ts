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
  // ... rest of the component code ...
};