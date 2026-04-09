-- Tabela de agendamentos para a agenda da promotora Maizum
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  cliente TEXT NOT NULL,
  periodo TEXT CHECK (periodo IN ('manha', 'tarde')),
  vendedor TEXT NOT NULL,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'realizado', 'cancelado', 'reagendado')),
  resultado_visita TEXT,
  retorno_combinado TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por data
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);

-- Índice para busca por vendedor
CREATE INDEX IF NOT EXISTS idx_agendamentos_vendedor ON agendamentos(vendedor);

-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
