import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, Calendar, TrendingDown, Users, Target, ShoppingCart, CreditCard, ChevronDown } from 'lucide-react';

interface FunnelData {
  totalSessions: number;
  videoPlayed: number;
  leadReached: number;
  pitchReached: number;
  offerClicked: number;
  purchased: number;
}

interface ConversionFunnelProps {
  className?: string;
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ className = '' }) => {
  const [funnelData, setFunnelData] = useState<FunnelData>({
    totalSessions: 0,
    videoPlayed: 0,
    leadReached: 0,
    pitchReached: 0,
    offerClicked: 0,
    purchased: 0,
  });
  
  // ✅ FIXED: Always use current date
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchFunnelData = async (date: string) => {
    setLoading(true);
    try {
      // ✅ FIXED: Filter out Brazilian IPs from the start
      const { data: allEvents, error } = await supabase
        .from('vsl_analytics')
        .select('*')
        .neq('country_code', 'BR')
        .neq('country_name', 'Brazil')
        .gte('created_at', `${date}T00:00:00.000Z`)
        .lt('created_at', `${date}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!allEvents) {
        setFunnelData({
          totalSessions: 0,
          videoPlayed: 0,
          leadReached: 0,
          pitchReached: 0,
          offerClicked: 0,
          purchased: 0,
        });
        setLoading(false);
        return;
      }

      // Group events by session (already filtered, no Brazilian IPs)
      const sessionGroups = allEvents.reduce((acc, event) => {
        if (!acc[event.session_id]) {
          acc[event.session_id] = [];
        }
        acc[event.session_id].push(event);
        return acc;
      }, {} as Record<string, any[]>);

      const sessions = Object.values(sessionGroups);
      const totalSessions = sessions.length;

      // Calculate funnel metrics
      let videoPlayed = 0;
      let leadReached = 0;
      let pitchReached = 0;
      let offerClicked = 0;
      let purchased = 0;

      sessions.forEach(session => {
        // Check if video was played
        const hasVideoPlay = session.some(event => event.event_type === 'video_play');
        if (hasVideoPlay) videoPlayed++;

        // Check if lead was reached (7:45 = 465 seconds)
        const hasLeadReached = session.some(event => 
          event.event_type === 'video_progress' && 
          (event.event_data?.current_time >= 465 || event.event_data?.milestone === 'lead_reached')
        );
        if (hasLeadReached) leadReached++;

        // Check if pitch was reached (35:55 = 2155 seconds)
        const hasPitchReached = session.some(event => 
          event.event_type === 'video_progress' && 
          (event.event_data?.current_time >= 2155 || event.event_data?.milestone === 'pitch_reached')
        );
        if (hasPitchReached) pitchReached++;

        // ✅ FIXED: Only count real offer clicks (not upsells)
        const hasOfferClick = session.some(event => 
          event.event_type === 'offer_click' && 
          event.event_data?.offer_type &&
          ['1-bottle', '3-bottle', '6-bottle'].includes(event.event_data.offer_type)
        );
        if (hasOfferClick) {
          offerClicked++;
          
          // ✅ FIXED: Count purchases as upsell accepts only
          const hasPurchase = session.some(event => 
            event.event_type === 'offer_click' && 
            event.event_data?.offer_type &&
            event.event_data.offer_type.includes('upsell') &&
            event.event_data.offer_type.includes('accept')
          );
          if (hasPurchase) purchased++;
        }
      });

      setFunnelData({
        totalSessions,
        videoPlayed,
        leadReached,
        pitchReached,
        offerClicked,
        purchased,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData(selectedDate);
  }, [selectedDate]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFunnelData(selectedDate);
    }, 120000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  // ✅ FIXED: Update date when changed
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
  };

  const calculateConversionRate = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return (current / previous) * 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const funnelSteps = [
    {
      id: 'sessions',
      label: 'Sessões Iniciadas',
      value: funnelData.totalSessions,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      percentage: 100,
      conversionRate: null,
    },
    {
      id: 'video',
      label: 'Assistiram Vídeo',
      value: funnelData.videoPlayed,
      icon: Target,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-700',
      percentage: funnelData.totalSessions > 0 ? (funnelData.videoPlayed / funnelData.totalSessions) * 100 : 0,
      conversionRate: calculateConversionRate(funnelData.videoPlayed, funnelData.totalSessions),
    },
    {
      id: 'lead',
      label: 'Viraram Lead (7:45)',
      value: funnelData.leadReached,
      icon: Target,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      percentage: funnelData.videoPlayed > 0 ? (funnelData.leadReached / funnelData.videoPlayed) * 100 : 0,
      conversionRate: calculateConversionRate(funnelData.leadReached, funnelData.videoPlayed),
    },
    {
      id: 'pitch',
      label: 'Chegaram no Pitch (35:55)',
      value: funnelData.pitchReached,
      icon: Target,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      percentage: funnelData.leadReached > 0 ? (funnelData.pitchReached / funnelData.leadReached) * 100 : 0,
      conversionRate: calculateConversionRate(funnelData.pitchReached, funnelData.leadReached),
    },
    {
      id: 'offer',
      label: 'Clicaram na Oferta',
      value: funnelData.offerClicked,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      percentage: funnelData.pitchReached > 0 ? (funnelData.offerClicked / funnelData.pitchReached) * 100 : 0,
      conversionRate: calculateConversionRate(funnelData.offerClicked, funnelData.pitchReached),
    },
    {
      id: 'purchase',
      label: 'Compraram',
      value: funnelData.purchased,
      icon: CreditCard,
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: 'text-red-700',
      percentage: funnelData.offerClicked > 0 ? (funnelData.purchased / funnelData.offerClicked) * 100 : 0,
      conversionRate: calculateConversionRate(funnelData.purchased, funnelData.offerClicked),
    },
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Funil de Conversão
          </h3>
          <button
            onClick={() => fetchFunnelData(selectedDate)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label htmlFor="funnel-date-select" className="text-sm font-medium text-gray-700">
              Selecionar Data:
            </label>
          </div>
          <input
            id="funnel-date-select"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <span className="text-sm text-gray-500">
            Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
          </span>
        </div>

        {/* Overall Conversion Rate */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão Geral</p>
              <p className="text-2xl font-bold text-gray-900">
                {funnelData.totalSessions > 0 
                  ? ((funnelData.purchased / funnelData.totalSessions) * 100).toFixed(2)
                  : '0.00'
                }%
              </p>
              <p className="text-xs text-gray-500">
                {funnelData.purchased} compras de {funnelData.totalSessions} sessões
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Data Selecionada</p>
              <p className="text-lg font-bold text-blue-600">{formatDate(selectedDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando dados do funil...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {funnelSteps.map((step, index) => {
              const isLast = index === funnelSteps.length - 1;
              const IconComponent = step.icon;
              
              return (
                <div key={step.id} className="relative">
                  {/* Step Container */}
                  <div className={`${step.lightColor} border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md`}>
                    <div className="flex items-center justify-between">
                      {/* Left Side - Icon and Label */}
                      <div className="flex items-center gap-4">
                        <div className={`${step.color} p-3 rounded-lg text-white`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{step.label}</h4>
                          <p className="text-sm text-gray-600">
                            {step.conversionRate !== null && (
                              <span className="font-medium">
                                {step.conversionRate.toFixed(1)}% do estágio anterior
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right Side - Numbers */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{step.value.toLocaleString()}</p>
                        <p className={`text-sm font-medium ${step.textColor}`}>
                          {step.percentage.toFixed(1)}% do total
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${step.color} h-2 rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${step.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Down (except for last item) */}
                  {!isLast && (
                    <div className="flex justify-center my-2">
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-700 mb-2">Melhor Conversão</h5>
            <p className="text-lg font-bold text-green-600">
              {Math.max(...funnelSteps.filter(s => s.conversionRate !== null).map(s => s.conversionRate || 0)).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Entre estágios consecutivos</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-700 mb-2">Maior Perda</h5>
            <p className="text-lg font-bold text-red-600">
              {Math.min(...funnelSteps.filter(s => s.conversionRate !== null).map(s => s.conversionRate || 100)).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Entre estágios consecutivos</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-700 mb-2">Total de Etapas</h5>
            <p className="text-lg font-bold text-blue-600">{funnelSteps.length}</p>
            <p className="text-xs text-gray-500">No funil de conversão</p>
          </div>
        </div>

        {/* No Data Message */}
        {funnelData.totalSessions === 0 && !loading && (
          <div className="text-center mt-8 p-8 bg-blue-50 rounded-lg border border-blue-200">
            <TrendingDown className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <p className="text-blue-700 font-medium text-lg mb-2">
              📊 Nenhuma sessão registrada para esta data
            </p>
            <p className="text-blue-600 text-sm">
              Selecione uma data diferente ou aguarde novas sessões
            </p>
          </div>
        )}
      </div>
    </div>
  );
};