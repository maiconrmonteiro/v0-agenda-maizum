'use client';

import { Agendamento, FiltrosAgenda } from './types';
import { gerarAgendamentosMock } from './mock-data';

const STORAGE_KEY = 'maizum_agendamentos';
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

// Funções de gerenciamento de agendamentos
export function carregarAgendamentos(): Agendamento[] {
  if (typeof window === 'undefined') return [];
  
  const dados = localStorage.getItem(STORAGE_KEY);
  if (dados) {
    try {
      return JSON.parse(dados);
    } catch {
      return inicializarDadosMock();
    }
  }
  return inicializarDadosMock();
}

function inicializarDadosMock(): Agendamento[] {
  const agendamentos = gerarAgendamentosMock();
  salvarAgendamentos(agendamentos);
  return agendamentos;
}

export function salvarAgendamentos(agendamentos: Agendamento[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agendamentos));
}

export function adicionarAgendamento(agendamento: Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm'>): Agendamento {
  const agendamentos = carregarAgendamentos();
  const novoAgendamento: Agendamento = {
    ...agendamento,
    id: Math.random().toString(36).substring(2, 15),
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
  agendamentos.push(novoAgendamento);
  salvarAgendamentos(agendamentos);
  return novoAgendamento;
}

export function atualizarAgendamento(id: string, dados: Partial<Agendamento>): Agendamento | null {
  const agendamentos = carregarAgendamentos();
  const index = agendamentos.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  agendamentos[index] = {
    ...agendamentos[index],
    ...dados,
    atualizadoEm: new Date().toISOString(),
  };
  salvarAgendamentos(agendamentos);
  return agendamentos[index];
}

export function excluirAgendamento(id: string): boolean {
  const agendamentos = carregarAgendamentos();
  const index = agendamentos.findIndex(a => a.id === id);
  if (index === -1) return false;
  
  agendamentos.splice(index, 1);
  salvarAgendamentos(agendamentos);
  return true;
}

export function contarAgendamentosPorDia(agendamentos: Agendamento[], data: string, idExcluir?: string): number {
  if (!agendamentos || !Array.isArray(agendamentos)) return 0;
  return agendamentos.filter(a => a.data === data && a.id !== idExcluir).length;
}

export function filtrarAgendamentos(agendamentos: Agendamento[], filtros: FiltrosAgenda): Agendamento[] {
  return agendamentos.filter(agendamento => {
    const dataAgendamento = new Date(agendamento.data);
    
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
