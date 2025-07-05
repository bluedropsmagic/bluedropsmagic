import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { RefreshCw, Calendar, TrendingUp } from 'lucide-react';

interface SalesData {
  hour: number;
  '6-bottle': number;
  '3-bottle': number;
  '1-bottle': number;
}

interface SalesChartProps {
  className?: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({ className = '' }) => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  // ✅ FIXED: Always use current date
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [totalSales, setTotalSales] = useState({
    '6-bottle': 0,
    '3-bottle': 0,
    '1-bottle': 0,
    total: 0
  });

  const fetchSalesData = async (date: string) => {
    setLoading(true);
    try {
      // ✅ FIXED: Only count real offer clicks (not upsells) and exclude Brazilian IPs
      const { data: offerClicks, error } = await supabase
        .from('vsl_analytics')
        .select('event_data, created_at')
        .eq('event_type', 'offer_click')
        .neq('country_code', 'BR')
        .neq('country_name', 'Brazil')
        .gte('created_at', `${date}T00:00:00.000Z`)
        .lt('created_at', `${date}T23:59:59.999Z`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Initialize data structure for all 24 hours
      const hourlyData: { [hour: number]: SalesData } = {};
      for (let hour = 0; hour < 24; hour++) {
        hourlyData[hour] = {
          hour,
          '6-bottle': 0,
          '3-bottle': 0,
          '1-bottle': 0,
        };
      }

      // Count sales by hour and product type
      let totalCounts = {
        '6-bottle': 0,
        '3-bottle': 0,
        '1-bottle': 0,
        total: 0
      };

      if (offerClicks) {
        offerClicks.forEach(click => {
          const hour = new Date(click.created_at).getHours();
          const offerType = click.event_data?.offer_type;
          
          // ✅ FIXED: Only count real offer clicks (not upsells)
          if (offerType && hourlyData[hour] && ['1-bottle', '3-bottle', '6-bottle'].includes(offerType)) {
            hourlyData[hour][offerType as '1-bottle' | '3-bottle' | '6-bottle']++;
            totalCounts[offerType as '1-bottle' | '3-bottle' | '6-bottle']++;
            totalCounts.total++;
          }
        });
      }

      // Convert to array format for chart
      const chartData = Object.values(hourlyData).sort((a, b) => a.hour - b.hour);
      
      setSalesData(chartData);
      setTotalSales(totalCounts);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(selectedDate);
  }, [selectedDate]);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSalesData(selectedDate);
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  // ✅ FIXED: Update date when changed
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatTooltipLabel = (hour: number) => {
    return `${formatHour(hour)} - ${formatHour(hour + 1)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">
            {formatTooltipLabel(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value} vendas
            </p>
          ))}
          <p className="text-sm font-semibold text-gray-700 mt-2 pt-2 border-t border-gray-100">
            Total: {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)} vendas
          </p>
        </div>
      );
    }
    return null;
  };

  const getProductIcon = (product: string) => {
    switch (product) {
      case '6-bottle': return '🟢';
      case '3-bottle': return '🟡';
      case '1-bottle': return '🔴';
      default: return '⚪';
    }
  };

  const getProductName = (product: string) => {
    switch (product) {
      case '6-bottle': return 'Pacote com 6 frascos';
      case '3-bottle': return 'Pacote com 3 frascos';
      case '1-bottle': return 'Pacote com 1 frasco';
      default: return product;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Vendas por Hora - Por Produto
          </h3>
          <button
            onClick={() => fetchSalesData(selectedDate)}
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
            <label htmlFor="date-select" className="text-sm font-medium text-gray-700">
              Selecionar Data:
            </label>
          </div>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🟢</span>
              <span className="text-xs font-medium text-green-700">6 Frascos</span>
            </div>
            <p className="text-xl font-bold text-green-800">{totalSales['6-bottle']}</p>
            <p className="text-xs text-green-600">vendas</p>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🟡</span>
              <span className="text-xs font-medium text-yellow-700">3 Frascos</span>
            </div>
            <p className="text-xl font-bold text-yellow-800">{totalSales['3-bottle']}</p>
            <p className="text-xs text-yellow-600">vendas</p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔴</span>
              <span className="text-xs font-medium text-red-700">1 Frasco</span>
            </div>
            <p className="text-xl font-bold text-red-800">{totalSales['1-bottle']}</p>
            <p className="text-xs text-red-600">vendas</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📊</span>
              <span className="text-xs font-medium text-gray-700">Total</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{totalSales.total}</p>
            <p className="text-xs text-gray-600">vendas</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando dados de vendas...</p>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
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
                  tickFormatter={formatHour}
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
                    <span className="text-sm font-medium">
                      {getProductIcon(value)} {getProductName(value)}
                    </span>
                  )}
                />
                
                {/* 6 Bottle Line - Green */}
                <Line
                  type="monotone"
                  dataKey="6-bottle"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  name="6-bottle"
                />
                
                {/* 3 Bottle Line - Yellow */}
                <Line
                  type="monotone"
                  dataKey="3-bottle"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                  name="3-bottle"
                />
                
                {/* 1 Bottle Line - Red */}
                <Line
                  type="monotone"
                  dataKey="1-bottle"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                  name="1-bottle"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              📅 Dados de: {new Date(selectedDate).toLocaleDateString('pt-BR')}
            </span>
            <span>
              🔄 Atualização automática a cada 1 minuto
            </span>
          </div>
          
          {totalSales.total === 0 && !loading && (
            <div className="text-center mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-700 font-medium">
                📊 Nenhuma venda registrada para esta data
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Selecione uma data diferente ou aguarde novas vendas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};