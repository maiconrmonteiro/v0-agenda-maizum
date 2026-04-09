import { Agendamento, StatusVisita } from './types';

const clientes = [
  'Mercado São Jorge',
  'Açougue Boi Gordo',
  'Bistrô La Maison',
  'Conveniência 24h',
  'Empório Sabores',
  'Casa de Carnes Premium',
  'Mercado Central',
  'Açougue do Zé',
  'Bistrô Sabor & Arte',
  'Conveniência Express',
  'Empório Gourmet',
  'Casa de Carnes Nobre',
  'Supermercado Economia',
  'Açougue Três Irmãos',
  'Restaurante Família',
];

const cidades = [
  'Centro',
  'Jardim América',
  'Vila Nova',
  'Bairro Industrial',
  'Centro Comercial',
  'Zona Sul',
  'Zona Norte',
  'Bairro Alto',
];

const observacoesExemplos = [
  'Cliente demonstrou interesse nos novos produtos',
  'Degustação confirmada para o horário combinado',
  'Gerente pediu acompanhamento na próxima semana',
  'Promotora não estava no local, reagendar',
  'Cliente pediu retorno com catálogo completo',
  'Sem interesse no momento, retornar em 30 dias',
  'Visita realizada com sucesso, pedido feito',
  'Aguardando aprovação do gerente',
  'Cliente solicitou amostras adicionais',
  'Boa receptividade, potencial de fechamento',
];

const resultadosExemplos = [
  'Pedido de 50 unidades realizado',
  'Cliente vai avaliar proposta',
  'Fechamento previsto para próxima semana',
  'Sem interesse, não retornar',
  'Aguardando orçamento',
  'Demonstração agendada',
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function gerarAgendamentosMock(): Agendamento[] {
  const agendamentos: Agendamento[] = [];
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0);
  
  const vendedores = ['Ana Carla', 'Hercules', 'Rogerio', 'Claudir'];
  const statusList: StatusVisita[] = ['agendado', 'confirmado', 'realizado', 'sem_interesse', 'reagendar', 'cancelado'];
  
  for (let i = 0; i < 25; i++) {
    const data = randomDate(inicioMes, fimMes);
    const status = randomItem(statusList);
    const temResultado = ['realizado', 'sem_interesse'].includes(status);
    const temRetorno = ['reagendar', 'confirmado'].includes(status);
    
    agendamentos.push({
      id: generateId(),
      data: data.toISOString().split('T')[0],
      cliente: randomItem(clientes),
      cidadeBairro: Math.random() > 0.3 ? randomItem(cidades) : undefined,
      vendedor: randomItem(vendedores),
      observacoes: Math.random() > 0.2 ? randomItem(observacoesExemplos) : undefined,
      status,
      resultadoVisita: temResultado ? randomItem(resultadosExemplos) : undefined,
      retornoCombinado: temRetorno ? `${Math.floor(Math.random() * 14) + 1} dias` : undefined,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    });
  }
  
  return agendamentos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
}

export const CLIENTES_LISTA = clientes;
export const CIDADES_LISTA = cidades;
