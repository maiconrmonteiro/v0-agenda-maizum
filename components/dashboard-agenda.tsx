'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from './header';
import { SeletorMes } from './seletor-mes';
import { FiltrosAgendaComponent } from './filtros-agenda';
import { AgendamentoCard } from './agendamento-card';
import { FolgaCard } from './folga-card';
import { FormularioAgendamento } from './formulario-agendamento';
import { FormularioFolga } from './formulario-folga';
import { ModalExclusao } from './modal-exclusao';
import { EstadoVazio } from './estado-vazio';
import { CompromissoHoje } from './compromisso-hoje';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Plus, Palmtree } from 'lucide-react';
import { Agendamento, FiltrosAgenda, TipoRecorrencia } from '@/lib/types';
import { filtrarAgendamentos } from '@/lib/agenda-store';
import {
  buscarAgendamentosPorMes,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento,
} from '@/lib/db/agendamentos';
import {
  buscarFolgasPorMes,
  criarFolga,
  excluirFolga,
  Folga,
} from '@/lib/db/folgas';

// Tipo unificado para exibição na lista
type EventoLista = 
  | { tipo: 'agendamento'; dados: Agendamento }
  | { tipo: 'folga'; dados: Folga };

const hoje = new Date();

export function DashboardAgenda() {
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [compromissosHoje, setCompromissosHoje] = useState<Agendamento[]>([]);
  const [folgas, setFolgas] = useState<Folga[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosAgenda>({
    mes: hoje.getMonth(),
    ano: hoje.getFullYear(),
  });
  
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState<Agendamento | null>(null);
  
  const [formularioFolgaAberto, setFormularioFolgaAberto] = useState(false);
  
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [agendamentoExcluindo, setAgendamentoExcluindo] = useState<Agendamento | null>(null);
  
  const [modalExclusaoFolgaAberto, setModalExclusaoFolgaAberto] = useState(false);
  const [folgaExcluindo, setFolgaExcluindo] = useState<Folga | null>(null);

  // Carregar dados do banco
  const carregarDados = useCallback(async () => {
    setCarregando(true);
    const [dadosAgendamentos, dadosFolgas] = await Promise.all([
      buscarAgendamentosPorMes(filtros.ano, filtros.mes),
      buscarFolgasPorMes(filtros.ano, filtros.mes),
    ]);
    setAgendamentos(dadosAgendamentos);
    setFolgas(dadosFolgas);
    
    // Se o mês selecionado é o mês atual, os compromissos de hoje já estão em dadosAgendamentos
    // Mas para garantir que sempre temos os compromissos de hoje mesmo mudando de mês:
    const hojeStr = hoje.toISOString().split('T')[0];
    const hojeAno = hoje.getFullYear();
    const hojeMes = hoje.getMonth();
    
    if (filtros.ano === hojeAno && filtros.mes === hojeMes) {
      setCompromissosHoje(dadosAgendamentos.filter(a => a.data === hojeStr));
    } else {
      const dadosHoje = await buscarAgendamentosPorMes(hojeAno, hojeMes);
      setCompromissosHoje(dadosHoje.filter(a => a.data === hojeStr));
    }
    
    setCarregando(false);
  }, [filtros.ano, filtros.mes, hoje]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Agendamentos filtrados
  const agendamentosFiltrados = filtrarAgendamentos(agendamentos, filtros);

  // Agrupar eventos por data (agendamentos + folgas)
  const eventosPorData: Record<string, EventoLista[]> = {};

  // Adicionar agendamentos filtrados
  agendamentosFiltrados.forEach((agendamento) => {
    const data = agendamento.data;
    if (!eventosPorData[data]) eventosPorData[data] = [];
    eventosPorData[data].push({ tipo: 'agendamento', dados: agendamento });
  });

  // Adicionar folgas (apenas se não há filtros de cliente/vendedor/status ativos, 
  // pois folgas não têm esses campos)
  const temFiltrosEspecificos = filtros.cliente || filtros.vendedor || filtros.status;
  if (!temFiltrosEspecificos) {
    folgas.forEach((folga) => {
      // Se há busca ativa, verificar se a folga corresponde
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        const match = 'folga'.includes(busca) || folga.motivo?.toLowerCase().includes(busca);
        if (!match) return;
      }
      const data = folga.data;
      if (!eventosPorData[data]) eventosPorData[data] = [];
      eventosPorData[data].push({ tipo: 'folga', dados: folga });
    });
  }

  const datasOrdenadas = Object.keys(eventosPorData).sort();
  
  // Contagem total de eventos visíveis
  const totalEventos = datasOrdenadas.reduce((acc, data) => acc + eventosPorData[data].length, 0);

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

  const handleExcluirFolga = (folga: Folga) => {
    setFolgaExcluindo(folga);
    setModalExclusaoFolgaAberto(true);
  };

  const handleSalvar = useCallback(async (dados: Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm'>, recorrencia?: TipoRecorrencia) => {
    if (agendamentoEditando) {
      await atualizarAgendamento(agendamentoEditando.id, dados);
    } else {
      await criarAgendamento(dados, recorrencia);
    }
    await carregarDados();
    setFormularioAberto(false);
    setAgendamentoEditando(null);
  }, [agendamentoEditando, carregarDados]);

  const handleSalvarFolga = useCallback(async (data: string, motivo?: string) => {
    await criarFolga(data, motivo);
    await carregarDados();
    setFormularioFolgaAberto(false);
  }, [carregarDados]);

  const handleConfirmarExclusao = useCallback(async () => {
    if (agendamentoExcluindo) {
      await excluirAgendamento(agendamentoExcluindo.id);
      await carregarDados();
    }
    setModalExclusaoAberto(false);
    setAgendamentoExcluindo(null);
  }, [agendamentoExcluindo, carregarDados]);

  const handleConfirmarExclusaoFolga = useCallback(async () => {
    if (folgaExcluindo) {
      await excluirFolga(folgaExcluindo.id);
      await carregarDados();
    }
    setModalExclusaoFolgaAberto(false);
    setFolgaExcluindo(null);
  }, [folgaExcluindo, carregarDados]);

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
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Compromisso do Dia */}
          <CompromissoHoje 
            agendamentos={compromissosHoje} 
            onEditar={handleEditar} 
          />

          <hr className="border-muted/50" />

          {/* Seletor de Mês */}
          <SeletorMes
            mes={filtros.mes}
            ano={filtros.ano}
            onChange={handleMesChange}
          />

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleNovoAgendamento()}
              className="flex-1 bg-red-600 py-6 text-base font-semibold text-white hover:bg-red-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Novo Agendamento
            </Button>
            <Button
              onClick={() => setFormularioFolgaAberto(true)}
              className="bg-teal-600 py-6 text-base font-semibold text-white hover:bg-teal-700"
            >
              <Palmtree className="mr-2 h-5 w-5" />
              Folga
            </Button>
          </div>

          {/* Filtros */}
          <FiltrosAgendaComponent
            filtros={filtros}
            onFiltrosChange={setFiltros}
          />

          {/* Contador */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {totalEventos} evento{totalEventos !== 1 ? 's' : ''}
              {folgas.length > 0 && !temFiltrosEspecificos && (
                <span className="ml-1 text-teal-600">
                  ({folgas.length} folga{folgas.length !== 1 ? 's' : ''})
                </span>
              )}
            </span>
            {temFiltrosAtivos && (
              <span className="text-amber-600">Filtros ativos</span>
            )}
          </div>

          {/* Lista de Eventos */}
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="h-8 w-8 text-red-600" />
              <p className="mt-3 text-sm text-muted-foreground">Carregando agendamentos...</p>
            </div>
          ) : totalEventos === 0 ? (
            <EstadoVazio tipo={temFiltrosAtivos ? 'sem-resultados' : 'sem-registros'} />
          ) : (
            <div className="space-y-6">
              {datasOrdenadas.map((data) => (
                <div key={data} id={`data-${data}`} className="space-y-3">
                  <h3 className="sticky top-[72px] z-10 -mx-4 bg-background px-4 py-2 text-sm font-semibold capitalize text-red-700">
                    {formatarDataGrupo(data)}
                  </h3>
                  <div className="space-y-3">
                    {eventosPorData[data].map((evento) => {
                      if (evento.tipo === 'folga') {
                        return (
                          <FolgaCard
                            key={`folga-${evento.dados.id}`}
                            folga={evento.dados}
                            onExcluir={handleExcluirFolga}
                          />
                        );
                      }
                      return (
                        <AgendamentoCard
                          key={evento.dados.id}
                          agendamento={evento.dados}
                          onEditar={handleEditar}
                          onExcluir={handleExcluir}
                        />
                      );
                    })}
                    {eventosPorData[data].filter(e => e.tipo === 'agendamento').length < 2 && (
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
        folgas={folgas}
        dataPreSelecionada={dataPreSelecionada}
        onFechar={() => {
          setFormularioAberto(false);
          setAgendamentoEditando(null);
          setDataPreSelecionada(null);
        }}
        onSalvar={handleSalvar}
      />

      {/* Formulário de Folga */}
      <FormularioFolga
        aberto={formularioFolgaAberto}
        onFechar={() => setFormularioFolgaAberto(false)}
        onSalvar={handleSalvarFolga}
      />

      {/* Modal de Exclusão de Agendamento */}
      <ModalExclusao
        aberto={modalExclusaoAberto}
        nomeItem={agendamentoExcluindo?.cliente || ''}
        onFechar={() => {
          setModalExclusaoAberto(false);
          setAgendamentoExcluindo(null);
        }}
        onConfirmar={handleConfirmarExclusao}
      />

      {/* Modal de Exclusão de Folga */}
      <ModalExclusao
        aberto={modalExclusaoFolgaAberto}
        nomeItem={folgaExcluindo ? `folga do dia ${new Date(folgaExcluindo.data + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}
        onFechar={() => {
          setModalExclusaoFolgaAberto(false);
          setFolgaExcluindo(null);
        }}
        onConfirmar={handleConfirmarExclusaoFolga}
      />
    </div>
  );
}
