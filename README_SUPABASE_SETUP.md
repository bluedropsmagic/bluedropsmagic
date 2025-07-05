# 🚀 Configuração do Novo Supabase

## 📋 Passos para Configurar o Novo Supabase

### 1. Conectar ao Supabase
1. Clique no botão **"Connect to Supabase"** no canto superior direito do Bolt
2. Faça login na sua conta Supabase
3. Crie um novo projeto ou selecione um existente
4. As variáveis de ambiente serão configuradas automaticamente

### 2. Executar Migração
Após conectar ao Supabase, execute a migração para criar a estrutura do banco:

```sql
-- Execute este SQL no SQL Editor do Supabase
-- Ou a migração será aplicada automaticamente
```

### 3. Verificar Configuração
- ✅ Tabela `vsl_analytics` criada
- ✅ Políticas RLS configuradas
- ✅ Índices criados para performance
- ✅ Constraints de validação aplicadas

## 🔐 Credenciais de Admin

### Login do Dashboard Admin
- **URL**: `/admin`
- **Email**: `admin@magicbluedrops.com`
- **Senha**: `gotinhaazul`

### Funcionalidades do Admin
- 📊 Analytics em tempo real
- 👥 Usuários ativos (live users)
- 📈 Gráficos de conversão
- 🎯 Funil de vendas
- 🌍 Dados geográficos
- ⚙️ Testes de tracking
- 🕐 Configuração de delay de conteúdo

## 📊 Estrutura da Tabela Analytics

```sql
vsl_analytics:
- id (uuid) - Chave primária
- session_id (text) - ID único da sessão
- event_type (text) - Tipo do evento
- event_data (jsonb) - Dados adicionais do evento
- timestamp (timestamptz) - Quando o evento ocorreu
- created_at (timestamptz) - Quando foi criado
- ip (text) - IP do visitante
- country_code (text) - Código do país (BR, US, etc)
- country_name (text) - Nome do país
- city (text) - Cidade do visitante
- region (text) - Estado/região
- last_ping (timestamptz) - Último ping (usuários ativos)
- vturb_loaded (boolean) - Se o VTurb carregou
```

## 🎯 Eventos Trackados

1. **page_enter** - Usuário entra na página
2. **video_play** - VTurb carrega com sucesso
3. **video_progress** - Progresso no tempo de página
4. **pitch_reached** - Usuário atinge 35min55s na página
5. **offer_click** - Clique em ofertas de produto
6. **page_exit** - Usuário sai da página

## 🌍 Filtros Geográficos

- ❌ **IPs brasileiros são EXCLUÍDOS** automaticamente
- ✅ Apenas tráfego internacional é contabilizado
- 🔄 Detecção automática via múltiplas APIs de geolocalização

## 🔧 Funcionalidades Especiais

### Live Users
- Atualização a cada 30 segundos
- Usuários ativos nos últimos 2 minutos
- Breakdown por país em tempo real

### Delay Controller
- Configuração de delay para botões de compra
- Padrão: 35min55s (momento do pitch)
- Admin pode ajustar via dashboard

### Circuit Breakers
- Proteção contra falhas em cascata
- Fallbacks automáticos para APIs
- Monitoramento de saúde dos serviços

## 🚨 Troubleshooting

### Se o tracking não funcionar:
1. Verifique as variáveis de ambiente no `.env`
2. Teste a conexão no painel de Tracking
3. Verifique o console do navegador para erros
4. Confirme que as políticas RLS estão ativas

### Se o admin não conseguir logar:
1. Confirme as credenciais: `admin@magicbluedrops.com` / `gotinhaazul`
2. Limpe o sessionStorage do navegador
3. Tente em uma aba anônima

### Se os dados não aparecerem:
1. Verifique se a migração foi executada
2. Confirme que a tabela `vsl_analytics` existe
3. Teste inserção manual via SQL Editor
4. Verifique filtros de país (Brasil é excluído)

## 📞 Suporte

Se houver problemas na configuração:
1. Verifique os logs do console
2. Teste cada componente individualmente
3. Use o painel de Tracking Test no admin
4. Confirme que todas as migrações foram aplicadas

---

**✅ Após seguir estes passos, todo o sistema de analytics estará funcionando no novo Supabase!**