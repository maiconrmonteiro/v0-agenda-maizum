-- Tabela de agendamentos para a agenda da promotora Maizum
CREATE TABLE IF NOT EXISTS public.agendamentos (
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

-- Habilitar RLS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (app simples sem autenticação de usuários)
CREATE POLICY "Permitir leitura" ON public.agendamentos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção" ON public.agendamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização" ON public.agendamentos FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão" ON public.agendamentos FOR DELETE USING (true);

-- Índice para busca por data
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON public.agendamentos(data);

-- Índice para busca por vendedor
CREATE INDEX IF NOT EXISTS idx_agendamentos_vendedor ON public.agendamentos(vendedor);

-- Função para atualizar o campo atualizado_em
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualização automática
DROP TRIGGER IF EXISTS trigger_update_atualizado_em ON public.agendamentos;
CREATE TRIGGER trigger_update_atualizado_em
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();
