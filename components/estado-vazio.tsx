import { Calendar, Search } from 'lucide-react';

interface EstadoVazioProps {
  tipo: 'sem-registros' | 'sem-resultados';
}

export function EstadoVazio({ tipo }: EstadoVazioProps) {
  if (tipo === 'sem-resultados') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-amber-100 p-4">
          <Search className="h-8 w-8 text-amber-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Nenhum resultado encontrado
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tente ajustar os filtros ou buscar por outro termo para encontrar agendamentos.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4">
        <Calendar className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        Nenhum agendamento neste mês
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Comece adicionando um novo agendamento para a promotora usando o botão acima.
      </p>
    </div>
  );
}
