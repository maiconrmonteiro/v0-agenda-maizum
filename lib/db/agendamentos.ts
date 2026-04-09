import { createClient } from '@/lib/supabase/client';
import { Agendamento, Periodo, StatusVisita, TipoRecorrencia } from '@/lib/types';

interface AgendamentoDB {
  id: string;
  data: string;
  cliente: string;
  periodo: string | null;
  vendedor: string;
  observacoes: string | null;
  status: string;
  resultado_visita: string | null;
  retorno_combinado: string | null;
  criado_em: string;
  atualizado_em: string;
}

function mapFromDB(row: AgendamentoDB): Agendamento {
  return {
    id: row.id,
    data: row.data,
    cliente: row.cliente,
    periodo: row.periodo as Periodo | undefined,
    vendedor: row.vendedor,
    observacoes: row.observacoes || undefined,
    status: row.status as StatusVisita,
    resultadoVisita: row.resultado_visita || undefined,
    retornoCombinado: row.retorno_combinado || undefined,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

export async function buscarAgendamentos(): Promise<Agendamento[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*')
    .order('data', { ascending: true });

  if (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return [];
  }

  return (data || []).map(mapFromDB);
}

export async function buscarAgendamentosPorMes(ano: number, mes: number): Promise<Agendamento[]> {
  const supabase = createClient();
  
  const primeiroDia = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
  const ultimoDia = new Date(ano, mes + 1, 0).toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*')
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)
    .order('data', { ascending: true });

  if (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return [];
  }

  return (data || []).map(mapFromDB);
}

function gerarDatasRecorrentes(dataInicial: string, tipo: TipoRecorrencia): string[] {
  const datas: string[] = [dataInicial];
  const data = new Date(dataInicial);
  
  if (tipo === 'semanal') {
    // Próximas 4 semanas
    for (let i = 1; i <= 4; i++) {
      const novaData = new Date(data);
      novaData.setDate(novaData.getDate() + (7 * i));
      datas.push(novaData.toISOString().split('T')[0]);
    }
  } else if (tipo === 'mensal') {
    // Próximos 3 meses
    for (let i = 1; i <= 3; i++) {
      const novaData = new Date(data);
      novaData.setMonth(novaData.getMonth() + i);
      datas.push(novaData.toISOString().split('T')[0]);
    }
  }
  
  return datas;
}

export async function criarAgendamento(
  dados: Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm'>,
  recorrencia?: TipoRecorrencia
): Promise<Agendamento | null> {
  const supabase = createClient();
  
  // Gerar datas recorrentes se necessário
  const datas = recorrencia && recorrencia !== 'nenhuma' 
    ? gerarDatasRecorrentes(dados.data, recorrencia)
    : [dados.data];
  
  // Criar registros para todas as datas
  const registros = datas.map(data => ({
    data: data,
    cliente: dados.cliente,
    periodo: dados.periodo || null,
    vendedor: dados.vendedor,
    observacoes: dados.observacoes || null,
    status: dados.status,
    resultado_visita: dados.resultadoVisita || null,
    retorno_combinado: dados.retornoCombinado || null,
  }));
  
  const { data, error } = await supabase
    .from('agendamentos')
    .insert(registros)
    .select();

  if (error) {
    console.error('Erro ao criar agendamento:', error);
    return null;
  }

  // Retorna o primeiro agendamento criado
  return data && data.length > 0 ? mapFromDB(data[0]) : null;
}

export async function atualizarAgendamento(
  id: string,
  dados: Partial<Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm'>>
): Promise<Agendamento | null> {
  const supabase = createClient();
  
  const updateData: Record<string, unknown> = {};
  if (dados.data !== undefined) updateData.data = dados.data;
  if (dados.cliente !== undefined) updateData.cliente = dados.cliente;
  if (dados.periodo !== undefined) updateData.periodo = dados.periodo || null;
  if (dados.vendedor !== undefined) updateData.vendedor = dados.vendedor;
  if (dados.observacoes !== undefined) updateData.observacoes = dados.observacoes || null;
  if (dados.status !== undefined) updateData.status = dados.status;
  if (dados.resultadoVisita !== undefined) updateData.resultado_visita = dados.resultadoVisita || null;
  if (dados.retornoCombinado !== undefined) updateData.retorno_combinado = dados.retornoCombinado || null;
  
  const { data, error } = await supabase
    .from('agendamentos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return null;
  }

  return mapFromDB(data);
}

export async function excluirAgendamento(id: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('agendamentos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir agendamento:', error);
    return false;
  }

  return true;
}
