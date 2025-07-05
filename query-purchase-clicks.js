// Consulta para verificar cliques em botões de compra de IPs fora do Brasil
import { supabase } from './src/lib/supabase.js';

async function queryPurchaseClicks() {
  try {
    console.log('🔍 Consultando cliques em botões de compra de IPs fora do Brasil...');
    
    // Data de hoje
    const today = new Date().toISOString().split('T')[0];
    
    // Consulta para cliques em ofertas (botões de compra) excluindo Brasil
    const { data: offerClicks, error } = await supabase
      .from('vsl_analytics')
      .select('session_id, event_data, country_code, country_name, ip, created_at')
      .eq('event_type', 'offer_click')
      .neq('country_code', 'BR')
      .neq('country_name', 'Brazil')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro na consulta:', error);
      return;
    }

    // Análise dos dados
    const totalClicks = offerClicks?.length || 0;
    const uniqueSessions = new Set(offerClicks?.map(click => click.session_id) || []).size;
    
    // Breakdown por país
    const countryBreakdown = {};
    const packageBreakdown = {};
    
    offerClicks?.forEach(click => {
      const country = click.country_name || 'Unknown';
      const packageType = click.event_data?.offer_type || 'Unknown';
      
      countryBreakdown[country] = (countryBreakdown[country] || 0) + 1;
      packageBreakdown[packageType] = (packageBreakdown[packageType] || 0) + 1;
    });

    // Resultados
    console.log('\n📊 RESULTADOS - CLIQUES EM BOTÕES DE COMPRA (IPs fora do Brasil):');
    console.log('='.repeat(70));
    console.log(`📅 Data: ${today}`);
    console.log(`🖱️  Total de cliques: ${totalClicks}`);
    console.log(`👥 Sessões únicas: ${uniqueSessions}`);
    console.log(`🌍 Países representados: ${Object.keys(countryBreakdown).length}`);
    
    console.log('\n🌎 BREAKDOWN POR PAÍS:');
    Object.entries(countryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([country, count]) => {
        console.log(`  ${country}: ${count} cliques`);
      });
    
    console.log('\n📦 BREAKDOWN POR PACOTE:');
    Object.entries(packageBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([package, count]) => {
        console.log(`  ${package}: ${count} cliques`);
      });

    // Últimos 5 cliques para referência
    console.log('\n🕐 ÚLTIMOS 5 CLIQUES:');
    offerClicks?.slice(0, 5).forEach((click, index) => {
      const time = new Date(click.created_at).toLocaleTimeString('pt-BR');
      const country = click.country_name || 'Unknown';
      const package = click.event_data?.offer_type || 'Unknown';
      console.log(`  ${index + 1}. ${time} - ${country} - ${package}`);
    });

    return {
      totalClicks,
      uniqueSessions,
      countryBreakdown,
      packageBreakdown,
      rawData: offerClicks
    };

  } catch (error) {
    console.error('❌ Erro ao consultar dados:', error);
  }
}

// Executar a consulta
queryPurchaseClicks();