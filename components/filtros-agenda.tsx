'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiltrosAgenda, StatusVisita, STATUS_CONFIG, VENDEDORES } from '@/lib/types';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FiltrosAgendaProps {
  filtros: FiltrosAgenda;
  onFiltrosChange: (filtros: FiltrosAgenda) => void;
}

export function FiltrosAgendaComponent({ filtros, onFiltrosChange }: FiltrosAgendaProps) {
  const [expandido, setExpandido] = useState(false);

  const temFiltrosAtivos = filtros.cliente || filtros.vendedor || filtros.status || filtros.busca;

  const limparFiltros = () => {
    onFiltrosChange({
      ...filtros,
      cliente: undefined,
      vendedor: undefined,
      status: undefined,
      busca: undefined,
    });
  };

  return (
    <div className="space-y-3">
      {/* Busca rápida */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente, vendedor..."
          value={filtros.busca || ''}
          onChange={(e) => onFiltrosChange({ ...filtros, busca: e.target.value || undefined })}
          className="pl-10 text-base"
        />
      </div>

      {/* Toggle filtros avançados */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandido(!expandido)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {expandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {temFiltrosAtivos && (
          <Button
            variant="ghost"
            size="sm"
            onClick={limparFiltros}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filtros expandidos */}
      {expandido && (
        <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2">
          {/* Filtro por Vendedor */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Vendedor</label>
            <Select
              value={filtros.vendedor || 'todos'}
              onValueChange={(val) => onFiltrosChange({ ...filtros, vendedor: val === 'todos' ? undefined : val })}
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {VENDEDORES.map((vendedor) => (
                  <SelectItem key={vendedor} value={vendedor}>
                    {vendedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Select
              value={filtros.status || 'todos'}
              onValueChange={(val) => onFiltrosChange({ ...filtros, status: val === 'todos' ? undefined : val as StatusVisita })}
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
