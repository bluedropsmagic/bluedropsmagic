/*
  # Reset Analytics Data - Zerar Dashboard

  1. Operações
    - Limpar todos os dados da tabela vsl_analytics
    - Resetar contadores para começar do zero
    - Manter estrutura da tabela intacta

  2. Motivo
    - Começar a contar a partir de agora
    - Dados anteriores eram de teste
    - Dashboard zerada para produção
*/

-- ✅ LIMPAR todos os dados da tabela de analytics
DELETE FROM vsl_analytics;

-- ✅ RESETAR sequence se existir (para IDs começarem do 1 novamente)
-- Nota: Supabase usa UUIDs por padrão, então não há sequence para resetar

-- ✅ Verificar se a tabela está vazia
-- SELECT COUNT(*) FROM vsl_analytics; -- Deve retornar 0