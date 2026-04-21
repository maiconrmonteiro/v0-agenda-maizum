'use client';

import { Folga } from '@/lib/db/folgas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palmtree, Calendar, MessageSquare, Trash2 } from 'lucide-react';

interface FolgaCardProps {
  folga: Folga;
  onExcluir: (folga: Folga) => void;
}

export function FolgaCard({ folga, onExcluir }: FolgaCardProps) {
  const dataFormatada = new Date(folga.data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return (
    <Card className="overflow-hidden border-l-4 border-l-teal-500 bg-teal-50/50 transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="flex items-center gap-1.5 text-base font-semibold text-teal-800">
                <Palmtree className="h-4 w-4" />
                Folga
              </h3>
              <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                🏖️ Dia de Folga
              </span>
            </div>

            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-teal-600" />
                <span className="capitalize">{dataFormatada}</span>
              </div>

              {folga.motivo && (
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                  <span className="line-clamp-2 text-teal-700">{folga.motivo}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onExcluir(folga)}
              className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label="Excluir folga"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
