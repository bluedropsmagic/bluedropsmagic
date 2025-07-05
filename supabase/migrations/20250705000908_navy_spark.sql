/*
  # Configuração completa do VSL Analytics para novo projeto Supabase

  1. Nova Tabela
    - `vsl_analytics` com todos os campos necessários
    - Campos de geolocalização (IP, país, cidade, região)
    - Campo de ping para usuários ativos
    - Campo para tracking do VTurb

  2. Segurança
    - Habilitar RLS na tabela `vsl_analytics`
    - Política para inserção pública (tracking)
    - Política para leitura pública (dashboard admin)

  3. Índices
    - Índices em todos os campos importantes para performance
    - Índices para consultas de tempo real

  4. Constraints
    - Validação dos tipos de eventos
    - Valores padrão apropriados
*/

-- Criar tabela principal de analytics
CREATE TABLE IF NOT EXISTS vsl_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  ip text,
  country_code text,
  country_name text,
  city text,
  region text,
  last_ping timestamptz DEFAULT now(),
  vturb_loaded boolean DEFAULT false
);

-- Adicionar constraint para tipos de eventos válidos
ALTER TABLE vsl_analytics 
ADD CONSTRAINT vsl_analytics_event_type_check 
CHECK (event_type = ANY (ARRAY[
  'page_enter'::text, 
  'video_play'::text, 
  'video_progress'::text, 
  'pitch_reached'::text, 
  'offer_click'::text, 
  'page_exit'::text
]));

-- Habilitar Row Level Security
ALTER TABLE vsl_analytics ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (para tracking)
CREATE POLICY "Allow public insert for analytics"
  ON vsl_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Política para permitir leitura pública (para dashboard admin)
CREATE POLICY "Allow public read for analytics"
  ON vsl_analytics
  FOR SELECT
  TO public
  USING (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_session_id ON vsl_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_event_type ON vsl_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_timestamp ON vsl_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_created_at ON vsl_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_country_code ON vsl_analytics(country_code);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_ip ON vsl_analytics(ip);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_last_ping ON vsl_analytics(last_ping);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_vturb_loaded ON vsl_analytics(vturb_loaded);