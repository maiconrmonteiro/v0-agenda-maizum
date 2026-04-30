'use client';

import { Calendar, Clock, MapPin, User, FileText } from 'lucide-react';
import { Agendamento, PERIODO_CONFIG, STATUS_CONFIG } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CompromissoHojeProps {
  agendamentos: Agendamento[];
  onEditar: (agendamento: Agendamento) => void;
}

export function CompromissoHoje({ agendamentos, onEditar }: CompromissoHojeProps) {
  const agora = new Date();
  const hoje = agora.toISOString().split('T')[0];
  const compromissosHoje = agendamentos.filter((a) => a.data === hoje);

  const hora = agora.getHours();
  let saudacao = 'Boa noite';
  if (hora >= 5 && hora < 12) saudacao = 'Bom dia';
  else if (hora >= 12 && hora < 18) saudacao = 'Boa tarde';

  const handleCardClick = (data: string) => {
    const element = document.getElementById(`data-${data}`);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col gap-1.5 px-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {saudacao}, <span className="text-red-700">Promotora</span>!
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-100 px-2 py-0.5 text-xs font-semibold">
            {agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Badge>
          <p className="text-sm text-muted-foreground font-medium">
            {compromissosHoje.length === 0 
              ? 'Você não tem visitas para hoje.' 
              : `Hoje você tem ${compromissosHoje.length} ${compromissosHoje.length === 1 ? 'visita agendada' : 'visitas agendadas'}.`}
          </p>
        </div>
      </div>

      {compromissosHoje.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1">
        {compromissosHoje.map((compromisso) => {
          const status = STATUS_CONFIG[compromisso.status];
          const periodo = compromisso.periodo ? PERIODO_CONFIG[compromisso.periodo] : null;

          return (
            <Card 
              key={compromisso.id} 
              className="group relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
              onClick={() => handleCardClick(compromisso.data)}
            >
              <div className="absolute inset-y-0 left-0 w-1.5 bg-red-600 transition-all group-hover:w-2" />
              <CardContent className="p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-full bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-red-700 transition-colors">
                          {compromisso.cliente}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pl-10 font-medium">
                        <User className="h-4 w-4" />
                        <span>Vendedor: {compromisso.vendedor}</span>
                      </div>
                    </div>
                    <Badge className={cn("px-3 py-1 text-xs font-bold uppercase tracking-wider", status.bgColor, status.color)}>
                      {status.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm pt-4 border-t border-muted/30 ml-10">
                    {periodo && (
                      <div className="flex items-center gap-2 font-bold text-foreground bg-muted/30 px-3 py-1 rounded-full">
                        <span className="text-xl leading-none">{periodo.icon}</span>
                        <span>{periodo.label}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                      <Clock className="h-4 w-4" />
                      <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  {compromisso.observacoes && (
                    <div className="bg-amber-50/70 p-3 rounded-lg text-sm text-amber-900 border border-amber-100/50 shadow-sm ml-10">
                      <p className="font-semibold text-xs uppercase text-amber-700 mb-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Observações
                      </p>
                      &quot;{compromisso.observacoes}&quot;
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    )}
</div>
  );
}
