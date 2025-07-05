// Análise completa do tráfego de hoje
import { supabase } from './src/lib/supabase.js';

async function analyzeTodaysTraffic() {
  try {
    console.log('📊 ANÁLISE COMPLETA DO TRÁFEGO DE HOJE');
    console.log('='.repeat(60));
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    console.log(`📅 Data: ${today}`);
    console.log(`🕐 Horário atual: ${now.toLocaleTimeString('pt-BR')}`);
    console.log('');

    // 1. SESSÕES TOTAIS (excluindo Brasil)
    const { data: allSessions, error: sessionsError } = await supabase
      .from('vsl_analytics')
      .select('session_id, country_code, country_name, created_at')
      .eq('event_type', 'page_enter')
      .neq('country_code', 'BR')
      .neq('country_name', 'Brazil')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (sessionsError) throw sessionsError;

    const totalSessions = allSessions?.length || 0;
    const uniqueCountries = new Set(allSessions?.map(s => s.country_name) || []).size;

    console.log('🌍 SESSÕES INTERNACIONAIS (excluindo Brasil):');
    console.log(`  Total de sessões: ${totalSessions}`);
    console.log(`  Países únicos: ${uniqueCountries}`);
    console.log('');

    // 2. VÍDEO TRACKING
    const { data: videoPlays, error: videoError } = await supabase
      .from('vsl_analytics')
      .select('session_id, event_data')
      .eq('event_type', 'video_play')
      .neq('country_code', 'BR')
      .neq('country_name', 'Brazil')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (videoError) throw videoError;

    const videoPlayCount = videoPlays?.length || 0;
    const videoPlayRate = totalSessions > 0 ? ((videoPlayCount / totalSessions) * 100).toFixed(1) : '0.0';

    console.log('🎬 VÍDEO TRACKING:');
    console.log(`  VTurb carregou: ${videoPlayCount} vezes`);
    console.log(`  Taxa de carregamento: ${videoPlayRate}%`);
    console.log('');

    // 3. CLIQUES EM OFERTAS
    const { data: offerClicks, error: offersError } = await supabase
      .from('vsl_analytics')
      .select('session_id, event_data, country_name, created_at')
      .eq('event_type', 'offer_click')
      .neq('country_code', 'BR')
      .neq('country_name', 'Brazil')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (offersError) throw offersError;

    const totalOfferClicks = offerClicks?.length || 0;
    const uniqueClickSessions = new Set(offerClicks?.map(c => c.session_id) || []).size;
    const clickRate = totalSessions > 0 ? ((totalOfferClicks / totalSessions) * 100).toFixed(1) : '0.0';

    // Breakdown por pacote
    const packageBreakdown = {};
    offerClicks?.forEach(click => {
      const packageType = click.event_data?.offer_type || 'Unknown';
      packageBreakdown[packageType] = (packageBreakdown[packageType] || 0) + 1;
    });

    console.log('🛒 CLIQUES EM OFERTAS:');
    console.log(`  Total de cliques: ${totalOfferClicks}`);
    console.log(`  Sessões que clicaram: ${uniqueClickSessions}`);
    console.log(`  Taxa de clique: ${clickRate}%`);
    console.log('');

    console.log('📦 BREAKDOWN POR PACOTE:');
    Object.entries(packageBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([package, count]) => {
        const percentage = totalOfferClicks > 0 ? ((count / totalOfferClicks) * 100).toFixed(1) : '0.0';
        console.log(`  ${package}: ${count} cliques (${percentage}%)`);
      });
    console.log('');

    // 4. PAÍSES TOP
    const countryBreakdown = {};
    allSessions?.forEach(session => {
      const country = session.country_name || 'Unknown';
      countryBreakdown[country] = (countryBreakdown[country] || 0) + 1;
    });

    console.log('🌎 TOP 10 PAÍSES POR SESSÕES:');
    Object.entries(countryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([country, count], index) => {
        const percentage = totalSessions > 0 ? ((count / totalSessions) * 100).toFixed(1) : '0.0';
        console.log(`  ${index + 1}. ${country}: ${count} sessões (${percentage}%)`);
      });
    console.log('');

    // 5. USUÁRIOS ATIVOS (últimos 2 minutos)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const { data: liveUsers, error: liveError } = await supabase
      .from('vsl_analytics')
      .select('session_id, country_name, last_ping')
      .neq('country_code', 'BR')
      .neq('country_name', 'Brazil')
      .gte('last_ping', twoMinutesAgo.toISOString());

    if (liveError) throw liveError;

    const activeSessions = new Set(liveUsers?.map(u => u.session_id) || []).size;

    console.log('🔴 USUÁRIOS ATIVOS AGORA:');
    console.log(`  Usuários online: ${activeSessions}`);
    console.log(`  (últimos 2 minutos)`);
    console.log('');

    // 6. ANÁLISE TEMPORAL (por hora)
    const hourlyBreakdown = {};
    allSessions?.forEach(session => {
      const hour = new Date(session.created_at).getHours();
      hourlyBreakdown[hour] = (hourlyBreakdown[hour] || 0) + 1;
    });

    console.log('⏰ DISTRIBUIÇÃO POR HORA:');
    Object.entries(hourlyBreakdown)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([hour, count]) => {
        const hourFormatted = hour.toString().padStart(2, '0') + ':00';
        const bar = '█'.repeat(Math.ceil((count / Math.max(...Object.values(hourlyBreakdown))) * 20));
        console.log(`  ${hourFormatted}: ${count.toString().padStart(3)} ${bar}`);
      });
    console.log('');

    // 7. FUNIL DE CONVERSÃO
    const { data: pitchReached, error: pitchError } = await supabase
      .from('vsl_analytics')
      .select('session_id')
      .eq('event_type', 'pitch_reached')
      .neq('country_code', 'BR')
      .neq('country_name', 'Brazil')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (pitchError) throw pitchError;

    const pitchReachedCount = pitchReached?.length || 0;
    const pitchRate = totalSessions > 0 ? ((pitchReachedCount / totalSessions) * 100).toFixed(1) : '0.0';

    console.log('📈 FUNIL DE CONVERSÃO:');
    console.log(`  1. Sessões iniciadas: ${totalSessions} (100%)`);
    console.log(`  2. VTurb carregou: ${videoPlayCount} (${videoPlayRate}%)`);
    console.log(`  3. Chegaram no pitch: ${pitchReachedCount} (${pitchRate}%)`);
    console.log(`  4. Clicaram em ofertas: ${totalOfferClicks} (${clickRate}%)`);
    console.log('');

    // 8. RESUMO EXECUTIVO
    console.log('📋 RESUMO EXECUTIVO:');
    console.log('='.repeat(40));
    console.log(`🌍 Tráfego internacional: ${totalSessions} sessões de ${uniqueCountries} países`);
    console.log(`🎬 Performance do vídeo: ${videoPlayRate}% de carregamento`);
    console.log(`🛒 Interesse comercial: ${totalOfferClicks} cliques em ofertas`);
    console.log(`🔴 Atividade atual: ${activeSessions} usuários online`);
    
    if (totalSessions > 0) {
      const topCountry = Object.entries(countryBreakdown).sort(([,a], [,b]) => b - a)[0];
      const topPackage = Object.entries(packageBreakdown).sort(([,a], [,b]) => b - a)[0];
      
      console.log(`🏆 País líder: ${topCountry ? topCountry[0] : 'N/A'}`);
      console.log(`📦 Pacote preferido: ${topPackage ? topPackage[0] : 'N/A'}`);
    }

    // 9. ÚLTIMAS ATIVIDADES
    console.log('');
    console.log('🕐 ÚLTIMAS 5 ATIVIDADES:');
    const { data: recentActivity, error: recentError } = await supabase
      .from('vsl_analytics')
      .select('event_type, country_name, created_at, event_data')
      .neq('country_code', 'BR')
      .neq('country_name', 'Brazil')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!recentError && recentActivity) {
      recentActivity.forEach((activity, index) => {
        const time = new Date(activity.created_at).toLocaleTimeString('pt-BR');
        const country = activity.country_name || 'Unknown';
        const eventType = activity.event_type;
        const extra = activity.event_data?.offer_type ? ` (${activity.event_data.offer_type})` : '';
        console.log(`  ${index + 1}. ${time} - ${country} - ${eventType}${extra}`);
      });
    }

    console.log('');
    console.log('✅ Análise concluída!');
    console.log(`📊 Dados atualizados até: ${now.toLocaleString('pt-BR')}`);

  } catch (error) {
    console.error('❌ Erro na análise:', error);
  }
}

// Executar análise
analyzeTodaysTraffic();