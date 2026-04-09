export type StatusVisita = 
  | 'agendado'
  | 'confirmado'
  | 'realizado'
  | 'sem_interesse'
  | 'reagendar'
  | 'cancelado';

export type Periodo = 'manha' | 'tarde';

export type TipoRecorrencia = 'nenhuma' | 'semanal' | 'mensal';

export const RECORRENCIA_CONFIG: Record<TipoRecorrencia, { label: string; descricao: string }> = {
  nenhuma: { label: 'Não repetir', descricao: 'Apenas este agendamento' },
  semanal: { label: 'Toda semana', descricao: 'Repete no mesmo dia da semana' },
  mensal: { label: 'Uma vez por mês', descricao: 'Repete uma vez por mês' },
};

export interface Agendamento {
  id: string;
  data: string;
  cliente: string;
  periodo?: Periodo;
  vendedor: string;
  observacoes?: string;
  status: StatusVisita;
  resultadoVisita?: string;
  retornoCombinado?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export const PERIODO_CONFIG: Record<Periodo, { label: string; icon: string }> = {
  manha: { label: 'Manhã', icon: '☀️' },
  tarde: { label: 'Tarde', icon: '🌅' },
};

export interface FiltrosAgenda {
  mes: number;
  ano: number;
  cliente?: string;
  vendedor?: string;
  status?: StatusVisita;
  busca?: string;
}

export const STATUS_CONFIG: Record<StatusVisita, { label: string; color: string; bgColor: string }> = {
  agendado: { label: 'Agendado', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  confirmado: { label: 'Confirmado', color: 'text-green-700', bgColor: 'bg-green-100' },
  realizado: { label: 'Realizado', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  sem_interesse: { label: 'Sem Interesse', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  reagendar: { label: 'Reagendar', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  cancelado: { label: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export const VENDEDORES = [
  'Ana Carla',
  'Hercules',
  'Rogerio',
  'Claudir',
];
