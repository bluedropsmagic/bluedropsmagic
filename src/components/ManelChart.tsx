import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { RefreshCw, TrendingUp, Trophy, Target } from 'lucide-react';

interface ManelData {
  timestamp: string;
  percentage: number;
  totalSales: number;
  hour: string;
}

interface ManelChartProps {
  className?: string;
}

export const ManelChart: React.FC<ManelChartProps> = ({ className = '' }) => {
  const [manelData, setManelData] = useState<ManelData[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchManelData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // ✅ Buscar todas as vendas reais (upsell accepts) de hoje, excluindo Brasil
      const { data: sales, error } = await supabase
        .from('vsl_analytics')
        .select('created_at, event_data')
        .eq('event_type', 'offer_click')
        .neq('country_code', 'BR')
        .neq('country_name', 'Brazil')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // ✅ Filtrar apenas vendas reais (upsell accepts)
      const realSales = (sales || []).filter(sale => 
        sale.event_data?.offer_type &&
        sale.event_data.offer_type.includes('upsell') &&
        sale.event_data.offer_type.includes('accept')
      );

      const totalSalesCount = realSales.length;
      setTotalSales(totalSalesCount);

      // ✅ Se menos de 5 vendas, não mostrar o gráfico
      if (totalSalesCount < 5) {
        setManelData([]);
        setCurrentPercentage(0);
        setLoading(false);
        return;
      }

      // ✅ Calcular dados do gráfico - cada venda aumenta a porcentagem
      const chartData: ManelData[] = [];
      
      realSales.forEach((sale, index) => {
        const saleNumber = index + 1;
        const timestamp = new Date(sale.created_at);
        
        // ✅ Fórmula do Manel: cada venda aumenta a porcentagem
        // Começa em 50% na primeira venda e vai subindo
        const percentage = Math.min(50 + (saleNumber * 8.5), 100); // Máximo 100%
        
        chartData.push({
          timestamp: sale.created_at,
          percentage: Math.round(percentage * 100) / 100, // 2 casas decimais
          totalSales: saleNumber,
          hour: timestamp.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        });
      });

      setManelData(chartData);
      setCurrentPercentage(chartData[chartData.length - 1]?.percentage || 0);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching Manel data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManelData();
  }, []);

  // ✅ Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchManelData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">
            🕐 {data.hour}
          </p>
          <p className="text-sm text-blue-600">
            <span className="font-medium">Vendas:</span> {data.totalSales}
          </p>
          <p className="text-sm text-green-600">
            <span className="font-medium">Manel estava:</span> {data.percentage}% certo
          </p>
        </div>
      );
    }
    return null;
  };

  // ✅ Se menos de 5 vendas, não renderizar nada
  if (totalSales < 5) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* ✅ Header especial do Manel */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                🎯 PORCENTAGEM QUE MANEL TAVA CERTO
              </h3>
              <p className="text-sm text-gray-600">
                Métrica exclusiva - Só aparece com 5+ vendas
              </p>
            </div>
          </div>
          <button
            onClick={fetchManelData}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* ✅ Stats do Manel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Porcentagem Atual</span>
            </div>
            <p className="text-3xl font-bold text-yellow-800">{currentPercentage}%</p>
            <p className="text-xs text-yellow-600">que Manel tava certo</p>
          </div>
          
          <div className="bg-white/80 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Total de Vendas</span>
            </div>
            <p className="text-3xl font-bold text-green-800">{totalSales}</p>
            <p className="text-xs text-green-600">vendas hoje</p>
          </div>
          
          <div className="bg-white/80 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Status</span>
            </div>
            <p className="text-lg font-bold text-blue-800">
              {currentPercentage >= 90 ? '🏆 MANEL MASTER' : 
               currentPercentage >= 75 ? '🎯 MANEL PRO' : 
               currentPercentage >= 60 ? '📈 MANEL RISING' : '🚀 MANEL START'}
            </p>
            <p className="text-xs text-blue-600">nível atual</p>
          </div>
        </div>
      </div>

      {/* ✅ Gráfico */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
              <p className="text-gray-600">Calculando porcentagem do Manel...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={manelData}
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
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    domain={[40, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={() => (
                      <span className="text-sm font-medium text-yellow-700">
                        🎯 Porcentagem que Manel tava certo
                      </span>
                    )}
                  />
                  
                  {/* ✅ Linha do Manel - Amarela/Dourada */}
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#f59e0b"
                    strokeWidth={4}
                    dot={{ fill: '#f59e0b', strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 3, fill: '#fbbf24' }}
                    name="manel-percentage"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ✅ Informações adicionais */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-700 font-medium">
                    📊 Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
                  </span>
                </div>
                <span className="text-yellow-600">
                  🔄 Atualização automática a cada 30 segundos
                </span>
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-yellow-700 font-semibold text-sm">
                  🎯 <strong>Fórmula do Manel:</strong> Cada venda aumenta a porcentagem de acerto!
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                  Quanto mais vendas, mais certo o Manel estava sobre o produto
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};