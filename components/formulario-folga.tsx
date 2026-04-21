'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Palmtree } from 'lucide-react';

interface FormularioFolgaProps {
  aberto: boolean;
  dataPreSelecionada?: string | null;
  onFechar: () => void;
  onSalvar: (data: string, motivo?: string) => void;
}

export function FormularioFolga({ aberto, dataPreSelecionada, onFechar, onSalvar }: FormularioFolgaProps) {
  const [data, setData] = useState('');
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (aberto) {
      setData(dataPreSelecionada || new Date().toISOString().split('T')[0]);
      setMotivo('');
    }
  }, [aberto, dataPreSelecionada]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data) return;

    onSalvar(data, motivo || undefined);
    onFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-teal-700">
            <Palmtree className="h-5 w-5" />
            Registrar Folga
          </DialogTitle>
          <DialogDescription>
            Informe a data da folga da promotora. Ela aparecerá na lista de eventos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="data-folga" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600" />
              Data da Folga *
            </Label>
            <Input
              id="data-folga"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              className="text-base"
            />
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo-folga" className="flex items-center gap-2">
              <Palmtree className="h-4 w-4 text-teal-600" />
              Motivo (opcional)
            </Label>
            <Textarea
              id="motivo-folga"
              placeholder="Ex: Folga semanal, feriado, atestado médico..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              className="text-base"
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onFechar} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full bg-teal-600 text-white hover:bg-teal-700 sm:w-auto"
              disabled={!data}
            >
              Registrar Folga
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
