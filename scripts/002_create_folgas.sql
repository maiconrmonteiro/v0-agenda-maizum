-- Tabela de folgas para a agenda da promotora Maizum
CREATE TABLE IF NOT EXISTS public.folgas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  motivo TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.folgas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Permitir leitura folgas" ON public.folgas FOR SELECT USING (true);
CREATE POLICY "Permitir inserção folgas" ON public.folgas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir exclusão folgas" ON public.folgas FOR DELETE USING (true);

-- Índice para busca por data
CREATE INDEX IF NOT EXISTS idx_folgas_data ON public.folgas(data);
