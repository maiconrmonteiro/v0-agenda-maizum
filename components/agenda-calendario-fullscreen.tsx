'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, Calendar as CalendarIcon, Palmtree } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { contarAgendamentosPorDia, obterPeriodosOcupadosDia } from '@/lib/agenda-store'
import type { Agendamento, Periodo } from '@/lib/types'
import type { Folga } from '@/lib/db/folgas'

function formatarPtBR(dataISO: string) {
  return format(parseISO(dataISO), "EEEE, dd 'de' MMMM", { locale: ptBR })
}

function textoPeriodos(periodos: Periodo[]) {
  if (periodos.includes('dia_todo')) return 'o dia todo'
  const parts = periodos.map((p) => (p === 'manha' ? 'a manhã' : 'a tarde'))
  if (parts.length === 1) return parts[0]
  return `${parts[0]} e ${parts[1]}`
}

export function AgendaCalendarioFullscreen({
  mes,
  ano,
  agendamentos,
  folgas,
  onSelecionarData,
}: {
  mes: number
  ano: number
  agendamentos: Agendamento[]
  folgas: Folga[]
  onSelecionarData: (dataISO: string) => void
}) {
  const isMobile = useIsMobile()

  const [aberto, setAberto] = React.useState(false)
  const [dataSelecionada, setDataSelecionada] = React.useState<string>(() => {
    const hoje = new Date().toISOString().split('T')[0]
    return hoje
  })

  React.useEffect(() => {
    // Sempre que abrir, começa no mês atual dos filtros
    const hoje = new Date()
    const ehMesAtual = hoje.getFullYear() === ano && hoje.getMonth() === mes
    const base = ehMesAtual ? hoje : new Date(ano, mes, 1)
    setDataSelecionada(format(base, 'yyyy-MM-dd'))
  }, [aberto, ano, mes])

  const agendamentoDates = React.useMemo(
    () => Array.from(new Set(agendamentos.map((a) => a.data))).map((d) => parseISO(d)),
    [agendamentos],
  )
  const folgaDates = React.useMemo(
    () => Array.from(new Set(folgas.map((f) => f.data))).map((d) => parseISO(d)),
    [folgas],
  )

  const agendamentosNoDia = React.useMemo(
    () => contarAgendamentosPorDia(agendamentos, dataSelecionada),
    [agendamentos, dataSelecionada],
  )
  const periodosOcupadosNoDia = React.useMemo(
    () => obterPeriodosOcupadosDia(agendamentos, dataSelecionada),
    [agendamentos, dataSelecionada],
  )
  const folgaNoDia = React.useMemo(
    () => folgas.find((f) => f.data === dataSelecionada) ?? null,
    [folgas, dataSelecionada],
  )

  const AlertBox = (
    <div className="border-t bg-background px-4 py-3">
      {folgaNoDia ? (
        <div className="flex items-start gap-3 rounded-lg border-2 border-teal-400 bg-teal-50 p-4">
          <Palmtree className="mt-0.5 h-6 w-6 shrink-0 text-teal-600" />
          <div className="text-sm">
            <p className="font-semibold text-teal-800">🚫 Data bloqueada — Dia de Folga</p>
            <p className="mt-1 text-teal-700">
              {formatarPtBR(dataSelecionada)}.
            </p>
            {folgaNoDia.motivo && (
              <p className="mt-1 text-teal-600 italic">Motivo: {folgaNoDia.motivo}</p>
            )}
          </div>
        </div>
      ) : periodosOcupadosNoDia.length > 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">Atenção: Dia com compromissos</p>
            <p className="text-amber-700">
              {periodosOcupadosNoDia.includes('dia_todo')
                ? 'Já existe um compromisso para o dia todo nesta data.'
                : `Já existe compromisso agendado para ${textoPeriodos(periodosOcupadosNoDia)} desta data.`}
            </p>
            {agendamentosNoDia > 0 && (
              <p className="mt-1 text-amber-700">
                Total: {agendamentosNoDia} agendamento{agendamentosNoDia > 1 ? 's' : ''} nesta data.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          {formatarPtBR(dataSelecionada)} — sem compromissos.
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button
          className="flex-1 bg-red-600 text-white hover:bg-red-700"
          onClick={() => {
            onSelecionarData(dataSelecionada)
            setAberto(false)
          }}
        >
          Ir para este dia
        </Button>
        <DrawerClose asChild>
          <Button variant="outline" className="w-28" onClick={() => setAberto(false)}>
            Fechar
          </Button>
        </DrawerClose>
      </div>
    </div>
  )

  // Mobile-first: sempre fullscreen (drawer). Desktop também pode usar drawer, mas com tamanho menor.
  return (
    <Drawer open={aberto} onOpenChange={setAberto}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Calendário
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          'p-0',
          // força ocupar praticamente toda a tela no celular
          isMobile && 'max-h-[100dvh] mt-0 rounded-none border-t-0',
        )}
      >
        <DrawerHeader className={cn(isMobile && 'text-left')}>
          <DrawerTitle>Agenda do mês</DrawerTitle>
          <p className="text-sm text-muted-foreground">
            Toque em um dia para ver os alertas e ir direto na lista.
          </p>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className={cn('px-2', isMobile ? 'flex-1 overflow-auto' : '')}>
            <Calendar
              mode="single"
              selected={parseISO(dataSelecionada)}
              onSelect={(d) => {
                if (!d) return
                setDataSelecionada(format(d, 'yyyy-MM-dd'))
              }}
              modifiers={{
                hasAgendamento: agendamentoDates,
                hasFolga: folgaDates,
              }}
              className="w-full"
              initialFocus
            />
          </div>

          {AlertBox}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

