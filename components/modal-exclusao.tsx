'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Eye, EyeOff, Lock } from 'lucide-react';
import { verificarSenhaAdmin } from '@/lib/agenda-store';

interface ModalExclusaoProps {
  aberto: boolean;
  nomeItem: string;
  onFechar: () => void;
  onConfirmar: () => void;
}

export function ModalExclusao({ aberto, nomeItem, onFechar, onConfirmar }: ModalExclusaoProps) {
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleConfirmar = () => {
    if (!verificarSenhaAdmin(senha)) {
      setErro('Senha administrativa incorreta');
      return;
    }
    
    setCarregando(true);
    setTimeout(() => {
      onConfirmar();
      handleFechar();
    }, 300);
  };

  const handleFechar = () => {
    setSenha('');
    setMostrarSenha(false);
    setErro('');
    setCarregando(false);
    onFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Confirmar Exclusão</DialogTitle>
          <DialogDescription className="text-center">
            Você está prestes a excluir o agendamento de{' '}
            <span className="font-semibold text-foreground">{nomeItem}</span>.
            <br />
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="senha-admin" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Senha Administrativa
            </Label>
            <div className="relative">
              <Input
                id="senha-admin"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Digite a senha administrativa"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErro('');
                }}
                className={`pr-10 ${erro ? 'border-red-500' : ''}`}
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {erro && <p className="text-sm text-red-600">{erro}</p>}
          </div>
        </div>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleFechar} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmar}
            disabled={!senha || carregando}
            className="w-full sm:w-auto"
          >
            {carregando ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
