'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from './header';
import { SeletorMes } from './seletor-mes';
import { FiltrosAgendaComponent } from './filtros-agenda';
import { AgendamentoCard } from './agendamento-card';
import { FormularioAgendamento } from './formulario-agendamento';
import { ModalExclusao } from './modal-exclusao';
import { EstadoVazio } from './estado-vazio';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Plus } from 'lucide-react';
import { Agendamento, FiltrosAgenda } from '@/lib/types';
import { filtrarAgendamentos } from '@/lib/agenda-store';
import {
  buscarAgendamentosPorMes,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento,
} from '@/lib/db/agendamentos';

export function DashboardAgenda() {
  const hoje = new Date();
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosAgenda>({
    mes: hoje.getMonth(),
    ano: hoje.getFullYear(),
  });
  
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState<Agendamento | null>(null);
  
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [agendamentoExcluindo, setAgendamentoExcluindo] = useState<Agendamento | null>(null);

  // Carregar dados do banco
  const carregarDados = useCallback(async () => {
    setCarregando(true);
    const dados = await buscarAgendamentosPorMes(filtros.ano, filtros.mes);
    setAgendamentos(dados);
    setCarregando(false);
  }, [filtros.ano, filtros.mes]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Agendamentos filtrados
  const agendamentosFiltrados = filtrarAgendamentos(agendamentos, filtros);

  // Agrupar por data
  const agendamentosPorData = agendamentosFiltrados.reduce((acc, agendamento) => {
    const data = agendamento.data;
    if (!acc[data]) acc[data] = [];
    acc[data].push(agendamento);
    return acc;
  }, {} as Record<string, Agendamento[]>);

  const datasOrdenadas = Object.keys(agendamentosPorData).sort();

  // Handlers
  const [dataPreSelecionada, setDataPreSelecionada] = useState<string | null>(null);

  const handleNovoAgendamento = (data?: string) => {
    setAgendamentoEditando(null);
    setDataPreSelecionada(data || null);
    setFormularioAberto(true);
  };

  const handleEditar = (agendamento: Agendamento) => {
    setAgendamentoEditando(agendamento);
    setFormularioAberto(true);
  };

  const handleExcluir = (agendamento: Agendamento) => {
    setAgendamentoExcluindo(agendamento);
    setModalExclusaoAberto(true);
  };

  const handleSalvar = useCallback(async (dados: Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    if (agendamentoEditando) {
      await atualizarAgendamento(agendamentoEditando.id, dados);
    } else {
      await criarAgendamento(dados);
    }
    await carregarDados();
    setFormularioAberto(false);
    setAgendamentoEditando(null);
  }, [agendamentoEditando, carregarDados]);

  const handleConfirmarExclusao = useCallback(async () => {
    if (agendamentoExcluindo) {
      await excluirAgendamento(agendamentoExcluindo.id);
      await carregarDados();
    }
    setModalExclusaoAberto(false);
    setAgendamentoExcluindo(null);
  }, [agendamentoExcluindo, carregarDados]);

  const handleMesChange = (mes: number, ano: number) => {
    setFiltros({ ...filtros, mes, ano });
  };

  const formatarDataGrupo = (dataStr: string) => {
    const data = new Date(dataStr + 'T12:00:00');
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  };

  const temFiltrosAtivos = filtros.cliente || filtros.vendedor || filtros.status || filtros.busca;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Título */}
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">
              Agenda Mensal da Promotora
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os agendamentos de visitas e degustações
            </p>
          </div>

          {/* Seletor de Mês */}
          <SeletorMes
            mes={filtros.mes}
            ano={filtros.ano}
            onChange={handleMesChange}
          />

          {/* Botão Adicionar */}
          <Button
            onClick={handleNovoAgendamento}
            className="w-full bg-red-600 py-6 text-base font-semibold text-white hover:bg-red-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            Novo Agendamento
          </Button>

          {/* Filtros */}
          <FiltrosAgendaComponent
            filtros={filtros}
            onFiltrosChange={setFiltros}
          />

          {/* Contador */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {agendamentosFiltrados.length} agendamento{agendamentosFiltrados.length !== 1 ? 's' : ''}
            </span>
            {temFiltrosAtivos && (
              <span className="text-amber-600">Filtros ativos</span>
            )}
          </div>

          {/* Lista de Agendamentos */}
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="h-8 w-8 text-red-600" />
              <p className="mt-3 text-sm text-muted-foreground">Carregando agendamentos...</p>
            </div>
          ) : agendamentosFiltrados.length === 0 ? (
            <EstadoVazio tipo={temFiltrosAtivos ? 'sem-resultados' : 'sem-registros'} />
          ) : (
            <div className="space-y-6">
              {datasOrdenadas.map((data) => (
                <div key={data} className="space-y-3">
                  <h3 className="sticky top-[72px] z-10 -mx-4 bg-background px-4 py-2 text-sm font-semibold capitalize text-red-700">
                    {formatarDataGrupo(data)}
                  </h3>
                  <div className="space-y-3">
                    {agendamentosPorData[data].map((agendamento) => (
                      <AgendamentoCard
                        key={agendamento.id}
                        agendamento={agendamento}
                        onEditar={handleEditar}
                        onExcluir={handleExcluir}
                      />
                    ))}
                    {agendamentosPorData[data].length < 2 && (
                      <Button
                        variant="outline"
                        onClick={() => handleNovoAgendamento(data)}
                        className="w-full border-dashed border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar agendamento neste dia
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Formulário de Agendamento */}
      <FormularioAgendamento
        aberto={formularioAberto}
        agendamento={agendamentoEditando}
        todosAgendamentos={agendamentos}
        dataPreSelecionada={dataPreSelecionada}
        onFechar={() => {
          setFormularioAberto(false);
          setAgendamentoEditando(null);
          setDataPreSelecionada(null);
        }}
        onSalvar={handleSalvar}
      />

      {/* Modal de Exclusão */}
      <ModalExclusao
        aberto={modalExclusaoAberto}
        nomeItem={agendamentoExcluindo?.cliente || ''}
        onFechar={() => {
          setModalExclusaoAberto(false);
          setAgendamentoExcluindo(null);
        }}
        onConfirmar={handleConfirmarExclusao}
      />
    </div>
  );
}
