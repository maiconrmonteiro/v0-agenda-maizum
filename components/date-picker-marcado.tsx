'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, Calendar as CalendarIcon, Palmtree } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/use-mobile'
import { contarAgendamentosPorDia, obterPeriodosOcupadosDia } from '@/lib/agenda-store'
import type { Folga } from '@/lib/db/folgas'
import type { Agendamento, Periodo } from '@/lib/types'
import { cn } from '@/lib/utils'

type Marcacoes = {
  agendamentos?: string[]
  folgas?: string[]
}

function toDateList(dates: string[] | undefined) {
  if (!dates?.length) return []
  return Array.from(new Set(dates)).map((d) => parseISO(d))
}

export function DatePickerMarcado({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  marcacoes,
  agendamentosDetalhados,
  folgasDetalhadas,
  className,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  marcacoes?: Marcacoes
  agendamentosDetalhados?: Agendamento[]
  folgasDetalhadas?: Folga[]
  className?: string
  disabled?: boolean
}) {
  const selected = value ? parseISO(value) : undefined
  const isMobile = useIsMobile()

  const agendamentoDates = React.useMemo(
    () => toDateList(marcacoes?.agendamentos),
    [marcacoes?.agendamentos],
  )
  const folgaDates = React.useMemo(
    () => toDateList(marcacoes?.folgas),
    [marcacoes?.folgas],
  )

  const TriggerButton = (
    <Button
      variant="outline"
      className={cn(
        'w-full justify-start text-left font-normal',
        !value && 'text-muted-foreground',
        className,
      )}
      disabled={disabled}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {selected ? format(selected, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}
    </Button>
  )

  const Legend = (agendamentoDates.length > 0 || folgaDates.length > 0) && (
    <div className="border-t px-2 py-2 text-xs text-muted-foreground">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {agendamentoDates.length > 0 && (
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            Dia com compromisso
          </span>
        )}
        {folgaDates.length > 0 && (
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            Dia de folga
          </span>
        )}
      </div>
    </div>
  )

  const CalendarDesktop = (
    <>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={(d) => {
          if (!d) return
          onChange(format(d, 'yyyy-MM-dd'))
        }}
        modifiers={{
          hasAgendamento: agendamentoDates,
          hasFolga: folgaDates,
        }}
        className={cn(isMobile && 'w-full')}
        initialFocus
      />
      {Legend}
    </>
  )

  const periodosOcupadosNoDia = React.useMemo(() => {
    if (!agendamentosDetalhados?.length) return []
    if (!value) return []
    return obterPeriodosOcupadosDia(agendamentosDetalhados, value)
  }, [agendamentosDetalhados, value])

  const agendamentosNoDia = React.useMemo(() => {
    if (!agendamentosDetalhados?.length) return 0
    if (!value) return 0
    return contarAgendamentosPorDia(agendamentosDetalhados, value)
  }, [agendamentosDetalhados, value])

  const folgaNoDia = React.useMemo(() => {
    if (!folgasDetalhadas?.length) return null
    if (!value) return null
    return folgasDetalhadas.find((f) => f.data === value) ?? null
  }, [folgasDetalhadas, value])

  const textoPeriodos = (periodos: Periodo[]) => {
    if (periodos.includes('dia_todo')) return 'o dia todo'
    const parts = periodos.map((p) => (p === 'manha' ? 'a manhã' : 'a tarde'))
    if (parts.length === 1) return parts[0]
    return `${parts[0]} e ${parts[1]}`
  }

  const alertPanelMobile =
    value && (agendamentosDetalhados || folgasDetalhadas) ? (
      folgaNoDia ? (
        <div className="flex items-start gap-2 rounded-lg border-2 border-teal-400 bg-teal-50 p-3">
          <Palmtree className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-teal-800">🚫 Data bloqueada — Dia de Folga</p>
            <p className="mt-1 text-teal-700">
              Esta data está registrada como folga da promotora. Não é possível agendar visitas neste
              dia.
            </p>
            {folgaNoDia.motivo && (
              <p className="mt-1 text-teal-600 italic">Motivo: {folgaNoDia.motivo}</p>
            )}
          </div>
        </div>
      ) : periodosOcupadosNoDia.length > 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="min-w-0 text-sm">
            <p className="font-medium text-amber-800">Atenção: Dia com compromissos</p>
            <p className="text-amber-700">
              {periodosOcupadosNoDia.includes('dia_todo')
                ? 'Já existe um compromisso para o dia todo nesta data.'
                : `Já existe compromisso agendado para ${textoPeriodos(periodosOcupadosNoDia as Periodo[])} desta data.`}
            </p>
            {agendamentosNoDia > 0 && (
              <p className="mt-1 text-amber-700">
                Total: {agendamentosNoDia} agendamento{agendamentosNoDia > 1 ? 's' : ''} nesta data.
              </p>
            )}
          </div>
        </div>
      ) : agendamentosNoDia > 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="min-w-0 text-sm">
            <p className="font-medium text-amber-800">Atenção: Dia com compromissos</p>
            <p className="text-amber-700">Já existe agendamento nesta data.</p>
            <p className="mt-1 text-amber-700">
              Total: {agendamentosNoDia} agendamento{agendamentosNoDia > 1 ? 's' : ''} nesta data.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
          {format(parseISO(value), "EEEE, dd 'de' MMMM", { locale: ptBR })} — sem compromissos.
        </div>
      )
    ) : null

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
        <DrawerContent
          className={cn(
            'flex h-[100dvh] max-h-[100dvh] flex-col px-0',
            'mt-0 rounded-none border-t-0',
          )}
        >
          <DrawerHeader className="shrink-0 space-y-1 px-4 pb-2 pt-2 text-left">
            <DrawerTitle className="text-lg">Selecione a data</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              Toque em um dia. O aviso aparece abaixo do calendário.
            </p>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-1">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(d) => {
                if (!d) return
                onChange(format(d, 'yyyy-MM-dd'))
              }}
              modifiers={{
                hasAgendamento: agendamentoDates,
                hasFolga: folgaDates,
              }}
              className="w-full max-w-full [--cell-size:min(3.35rem,calc((100vw-1rem)/7))] p-2"
              initialFocus
            />
            {Legend}
          </div>

          <div className="shrink-0 border-t bg-background shadow-[0_-6px_16px_rgba(0,0,0,0.06)]">
            {alertPanelMobile && (
              <div className="max-h-[min(40vh,280px)] overflow-y-auto px-3 pt-3">
                {alertPanelMobile}
              </div>
            )}
            <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Fechar
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {CalendarDesktop}
      </PopoverContent>
    </Popover>
  )
}
