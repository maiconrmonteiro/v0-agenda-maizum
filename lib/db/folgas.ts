import { createClient } from '@/lib/supabase/client';

export interface Folga {
  id: string;
  data: string;
  motivo?: string;
  criadoEm: string;
}

interface FolgaDB {
  id: string;
  data: string;
  motivo: string | null;
  criado_em: string;
}

function mapFromDB(row: FolgaDB): Folga {
  return {
    id: row.id,
    data: row.data,
    motivo: row.motivo || undefined,
    criadoEm: row.criado_em,
  };
}

export async function buscarFolgasPorMes(ano: number, mes: number): Promise<Folga[]> {
  const supabase = createClient();
  
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  
  const dataInicio = primeiroDia.toISOString().split('T')[0];
  const dataFim = ultimoDia.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('folgas')
    .select('*')
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: true });

  if (error) {
    console.error('Erro ao buscar folgas:', error);
    return [];
  }

  return (data || []).map(mapFromDB);
}

export async function criarFolga(data: string, motivo?: string): Promise<Folga | null> {
  const supabase = createClient();
  
  const { data: folga, error } = await supabase
    .from('folgas')
    .insert({
      data,
      motivo: motivo || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar folga:', error);
    return null;
  }

  return mapFromDB(folga);
}

export async function excluirFolga(id: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('folgas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir folga:', error);
    return false;
  }

  return true;
}

export async function verificarFolga(data: string): Promise<Folga | null> {
  const supabase = createClient();
  
  const { data: folga, error } = await supabase
    .from('folgas')
    .select('*')
    .eq('data', data)
    .single();

  if (error) {
    return null;
  }

  return mapFromDB(folga);
}
