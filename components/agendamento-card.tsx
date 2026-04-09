'use client';

import { Agendamento, PERIODO_CONFIG } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Pencil, Trash2, MessageSquare } from 'lucide-react';

interface AgendamentoCardProps {
  agendamento: Agendamento;
  onEditar: (agendamento: Agendamento) => void;
  onExcluir: (agendamento: Agendamento) => void;
}

export function AgendamentoCard({ agendamento, onEditar, onExcluir }: AgendamentoCardProps) {
  const dataFormatada = new Date(agendamento.data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return (
    <Card className="overflow-hidden border-l-4 border-l-red-600 transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground">
                {agendamento.cliente}
              </h3>
              <StatusBadge status={agendamento.status} />
            </div>
            
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-red-600" />
                <span className="capitalize">{dataFormatada}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0 text-amber-600" />
                <span>{agendamento.vendedor}</span>
              </div>
              
              {agendamento.periodo && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>{PERIODO_CONFIG[agendamento.periodo].label}</span>
                </div>
              )}
              
              {agendamento.observacoes && (
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                  <span className="line-clamp-2 text-gray-600">{agendamento.observacoes}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex shrink-0 flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditar(agendamento)}
              className="h-9 w-9 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              aria-label="Editar agendamento"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onExcluir(agendamento)}
              className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label="Excluir agendamento"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
