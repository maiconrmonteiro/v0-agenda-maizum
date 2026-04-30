'use client';

import { Agendamento, FiltrosAgenda } from './types';

const AUTH_KEY = 'maizum_auth';

// Senhas do sistema
export const SENHA_ACESSO = 'maizum2026';
export const SENHA_ADMIN = 'admin2026';

// Funções de autenticação
export function verificarSenhaAcesso(senha: string): boolean {
  return senha === SENHA_ACESSO;
}

export function verificarSenhaAdmin(senha: string): boolean {
  return senha === SENHA_ADMIN;
}

export function estaAutenticado(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function fazerLogin(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, 'true');
}

export function fazerLogout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

// Função utilitária para contar agendamentos por dia
export function contarAgendamentosPorDia(agendamentos: Agendamento[], data: string, idExcluir?: string): number {
  if (!agendamentos || !Array.isArray(agendamentos)) return 0;
  return agendamentos.filter(a => a.data === data && a.id !== idExcluir).length;
}

// Função utilitária para obter os períodos ocupados em um dia
export function obterPeriodosOcupadosDia(agendamentos: Agendamento[], data: string, idExcluir?: string): string[] {
  if (!agendamentos || !Array.isArray(agendamentos)) return [];
  
  const agendamentosDoDia = agendamentos.filter(a => a.data === data && a.id !== idExcluir);
  
  const periodosOcupados = new Set<string>();
  
  agendamentosDoDia.forEach(a => {
    if (a.periodo) {
      periodosOcupados.add(a.periodo);
    }
  });
  
  return Array.from(periodosOcupados);
}

// Função de filtragem local (usado após buscar do banco)
export function filtrarAgendamentos(agendamentos: Agendamento[], filtros: FiltrosAgenda): Agendamento[] {
  return agendamentos.filter(agendamento => {
    const dataAgendamento = new Date(agendamento.data + 'T12:00:00');
    
    // Filtro por mês e ano
    if (dataAgendamento.getMonth() !== filtros.mes || dataAgendamento.getFullYear() !== filtros.ano) {
      return false;
    }
    
    // Filtro por cliente
    if (filtros.cliente && agendamento.cliente !== filtros.cliente) {
      return false;
    }
    
    // Filtro por vendedor
    if (filtros.vendedor && agendamento.vendedor !== filtros.vendedor) {
      return false;
    }
    
    // Filtro por status
    if (filtros.status && agendamento.status !== filtros.status) {
      return false;
    }
    
    // Filtro por busca
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      const encontrado = 
        agendamento.cliente.toLowerCase().includes(busca) ||
        agendamento.vendedor.toLowerCase().includes(busca) ||
        agendamento.observacoes?.toLowerCase().includes(busca);
      if (!encontrado) return false;
    }
    
    return true;
  });
}
