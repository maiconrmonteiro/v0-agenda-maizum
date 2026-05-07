'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

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
  className,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  marcacoes?: Marcacoes
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

  const CalendarContent = (
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
      {(agendamentoDates.length > 0 || folgaDates.length > 0) && (
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-3">
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
      )}
    </>
  )

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
        <DrawerContent className="px-0">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Selecione a data</DrawerTitle>
          </DrawerHeader>
          <div className="px-2 pb-4">{CalendarContent}</div>
          <div className="border-t p-4">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Fechar
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {CalendarContent}
      </PopoverContent>
    </Popover>
  )
}

