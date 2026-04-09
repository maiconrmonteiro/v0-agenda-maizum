'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SeletorMesProps {
  mes: number;
  ano: number;
  onChange: (mes: number, ano: number) => void;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function SeletorMes({ mes, ano, onChange }: SeletorMesProps) {
  const irParaMesAnterior = () => {
    if (mes === 0) {
      onChange(11, ano - 1);
    } else {
      onChange(mes - 1, ano);
    }
  };

  const irParaMesSeguinte = () => {
    if (mes === 11) {
      onChange(0, ano + 1);
    } else {
      onChange(mes + 1, ano);
    }
  };

  const irParaHoje = () => {
    const hoje = new Date();
    onChange(hoje.getMonth(), hoje.getFullYear());
  };

  const mesAtual = new Date();
  const ehMesAtual = mes === mesAtual.getMonth() && ano === mesAtual.getFullYear();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={irParaMesAnterior}
          className="h-10 w-10"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="min-w-[180px] text-center">
          <h2 className="text-xl font-bold text-red-700">
            {MESES[mes]}
          </h2>
          <p className="text-sm text-muted-foreground">{ano}</p>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={irParaMesSeguinte}
          className="h-10 w-10"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {!ehMesAtual && (
        <Button
          variant="ghost"
          size="sm"
          onClick={irParaHoje}
          className="text-red-600 hover:text-red-700"
        >
          Ir para mês atual
        </Button>
      )}
    </div>
  );
}
