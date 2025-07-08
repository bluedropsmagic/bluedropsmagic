import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { RefreshCw, Calendar, TrendingUp, Clock, MapPin } from 'lucide-react';

interface HeatmapData {
  [dayOfWeek: number]: {
    [hour: number]: number;
  };
}

interface WeekStats {
  totalPurchases: number;
  bestSlot: {
    day: number;
    hour: number;
    count: number;
  } | null;
  averagePerHour: number;
  peakDay: {
    day: number;
    total: number;
  } | null;
}

interface ConversionHeatmapProps {
  className?: string;
}

interface ChartData {
  hour: string;
  domingo: number;
  segunda: number;
  terca: number;
  quarta: number;
  quinta: number;
  sexta: number;
  sabado: number;
}

export const ConversionHeatmap: React.FC<ConversionHeatmapProps> = ({ className = '' }) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData>({});
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [weekStats, setWeekStats] = useState<WeekStats>({
    totalPurchases: 0,
    bestSlot: null,
    averagePerHour: 0,
    peakDay: null,
  });
  
  // ✅ FIXED: Always use current date for start/end
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // Get Monday of current week
    return monday.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay() + 7); // Get Sunday of current week
    return sunday.toISOString().split('T')[0];
  });
  
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Day names in Portuguese
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dayNamesFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const fetchHeatmapData = async (start: string, end: string) => {
    setLoading(true);
    try {
      // Query offer_click events (using as proxy for purchases) within date range
      // ✅ FIXED: Exclude Brazilian IPs
      const { data: offerClicks, error } = await supabase
        .from('vsl_analytics')
        .select('created_at, event_data, country_code, country_name')
        .eq('event_type', 'offer_click')
        .neq('country_code', 'BR')
        .neq('country_name', 'Brazil')
        .gte('created_at', `${start}T00:00:00.000Z`)
        .lte('created_at', `${end}T23:59:59.999Z`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Initialize heatmap data structure
      const heatmap: HeatmapData = {};
      for (let day = 0; day < 7; day++) {
        heatmap[day] = {};
        for (let hour = 0; hour < 24; hour++) {
          heatmap[day][hour] = 0;
        }
      }

      let totalPurchases = 0;
      const dayTotals: { [day: number]: number } = {};

      // Initialize day totals
      for (let day = 0; day < 7; day++) {
        dayTotals[day] = 0;
      }

      // Process the data
      if (offerClicks) {
        offerClicks.forEach(click => {
          const date = new Date(click.created_at);
          const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const hour = date.getHours();
          
          heatmap[dayOfWeek][hour]++;
          dayTotals[dayOfWeek]++;
          totalPurchases++;
        });
      }

      // Find best time slot
      let bestSlot: WeekStats['bestSlot'] = null;
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          if (!bestSlot || heatmap[day][hour] > bestSlot.count) {
            bestSlot = {
              day,
              hour,
              count: heatmap[day][hour]
            };
          }
        }
      }

      // Find peak day
      let peakDay: WeekStats['peakDay'] = null;
      for (let day = 0; day < 7; day++) {
        if (!peakDay || dayTotals[day] > peakDay.total) {
          peakDay = {
            day,
            total: dayTotals[day]
          };
        }
      }

      const averagePerHour = totalPurchases / (7 * 24);

      // Convert to chart data format
      const chartDataArray: ChartData[] = [];
      for (let hour = 0; hour < 24; hour++) {
        chartDataArray.push({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          domingo: heatmap[0][hour],
          segunda: heatmap[1][hour],
          terca: heatmap[2][hour],
          quarta: heatmap[3][hour],
          quinta: heatmap[4][hour],
          sexta: heatmap[5][hour],
          sabado: heatmap[6][hour],
        });
      }

      setHeatmapData(heatmap);
      setChartData(chartDataArray);
      setWeekStats({
        totalPurchases,
        bestSlot,
        averagePerHour,
        peakDay,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData(startDate, endDate);
  }, [startDate, endDate]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHeatmapData(startDate, endDate);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const formatDateRange = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
  };

  const setCurrentWeek = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay() + 7);
    
    setStartDate(monday.toISOString().split('T')[0]);
    setEndDate(sunday.toISOString().split('T')[0]);
  };

  const setLastWeek = () => {
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - today.getDay() - 6);
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());
    
    setStartDate(lastMonday.toISOString().split('T')[0]);
    setEndDate(lastSunday.toISOString().split('T')[0]);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium capitalize">{entry.dataKey}:</span> {entry.value} vendas
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Heatmap de Conversões - Horários de Pico
          </h3>
          <button
            onClick={() => fetchHeatmapData(startDate, endDate)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Período:</label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <span className="text-gray-500">até</span>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={setCurrentWeek}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Esta Semana
            </button>
            <button
              onClick={setLastWeek}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Semana Passada
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total de Vendas</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">{weekStats.totalPurchases}</p>
            <p className="text-xs text-blue-600">no período selecionado</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Melhor Horário</span>
            </div>
            {weekStats.bestSlot ? (
              <>
                <p className="text-lg font-bold text-green-800">
                  {dayNames[weekStats.bestSlot.day]} às {weekStats.bestSlot.hour.toString().padStart(2, '0')}h
                </p>
                <p className="text-xs text-green-600">{weekStats.bestSlot.count} vendas</p>
              </>
            ) : (
              <p className="text-sm text-green-600">Sem dados</p>
            )}
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Média por Hora</span>
            </div>
            <p className="text-lg font-bold text-purple-800">
              {weekStats.averagePerHour.toFixed(1)}
            </p>
            <p className="text-xs text-purple-600">vendas/hora</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Melhor Dia</span>
            </div>
            {weekStats.peakDay ? (
              <>
                <p className="text-lg font-bold text-orange-800">
                  {dayNamesFull[weekStats.peakDay.day]}
                </p>
                <p className="text-xs text-orange-600">{weekStats.peakDay.total} vendas</p>
              </>
            ) : (
              <p className="text-sm text-orange-600">Sem dados</p>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando heatmap...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Period Info */}
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                📅 Período: {formatDateRange(startDate, endDate)}
              </p>
              <p className="text-xs text-gray-500">
                🔄 Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
              </p>
            </div>

            {/* Line Chart */}
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#6b7280"
                    fontSize={12}
                    interval={1}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value) => (
                      <span className="text-sm font-medium capitalize">
                        {value}
                      </span>
                    )}
                  />
                  
                  {/* Lines for each day */}
                  <Line
                    type="monotone"
                    dataKey="domingo"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2 }}
                    name="domingo"
                  />
                  <Line
                    type="monotone"
                    dataKey="segunda"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
                    name="segunda"
                  />
                  <Line
                    type="monotone"
                    dataKey="terca"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
                    name="terça"
                  />
                  <Line
                    type="monotone"
                    dataKey="quarta"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2 }}
                    name="quarta"
                  />
                  <Line
                    type="monotone"
                    dataKey="quinta"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2 }}
                    name="quinta"
                  />
                  <Line
                    type="monotone"
                    dataKey="sexta"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#06b6d4', strokeWidth: 2 }}
                    name="sexta"
                  />
                  <Line
                    type="monotone"
                    dataKey="sabado"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ fill: '#ec4899', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#ec4899', strokeWidth: 2 }}
                    name="sábado"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* No Data Message */}
            {weekStats.totalPurchases === 0 && !loading && (
              <div className="text-center mt-8 p-8 bg-blue-50 rounded-lg border border-blue-200">
                <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-blue-700 font-medium text-lg mb-2">
                  📊 Nenhuma venda registrada no período selecionado
                </p>
                <p className="text-blue-600 text-sm">
                  Selecione um período diferente ou aguarde novas vendas
                </p>
              </div>
            )}

            {/* Insights */}
            {weekStats.totalPurchases > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">💡 Insights do Período</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p>
                      <strong>Horário mais produtivo:</strong>{' '}
                      {weekStats.bestSlot && (
                        <span className="text-green-600 font-medium">
                          {dayNamesFull[weekStats.bestSlot.day]} às {weekStats.bestSlot.hour.toString().padStart(2, '0')}h 
                          ({weekStats.bestSlot.count} vendas)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Dia com mais vendas:</strong>{' '}
                      {weekStats.peakDay && (
                        <span className="text-orange-600 font-medium">
                          {dayNamesFull[weekStats.peakDay.day]} ({weekStats.peakDay.total} vendas)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};