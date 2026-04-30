'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Lock, ScanFace, Check, X, ShieldCheck } from 'lucide-react';
import { verificarSenhaAdmin, estaBioCadastrada } from '@/lib/agenda-store';
import { cn } from '@/lib/utils';

interface ModalExclusaoProps {
  aberto: boolean;
  nomeItem: string;
  onFechar: () => void;
  onConfirmar: () => void;
}

type TipoAuth = 'senha' | 'biometria';

export function ModalExclusao({ aberto, nomeItem, onFechar, onConfirmar }: ModalExclusaoProps) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [metodo, setMetodo] = useState<TipoAuth>('biometria');
  const [statusBio, setStatusBio] = useState<'ocioso' | 'escaneando' | 'sucesso' | 'erro'>('ocioso');

  useEffect(() => {
    if (aberto) {
      const cadastrada = estaBioCadastrada();
      setMetodo(cadastrada ? 'biometria' : 'senha');
      setStatusBio('ocioso');
    }
  }, [aberto]);

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

  const handleIniciarBiometria = () => {
    setStatusBio('escaneando');
    
    // Simula a leitura facial/biometria
    setTimeout(() => {
      // 90% de chance de sucesso para a demo
      if (Math.random() > 0.1) {
        setStatusBio('sucesso');
        setTimeout(() => {
          onConfirmar();
          handleFechar();
        }, 1000);
      } else {
        setStatusBio('erro');
        setTimeout(() => setStatusBio('ocioso'), 2000);
      }
    }, 2000);
  };

  const handleFechar = () => {
    setSenha('');
    setErro('');
    setCarregando(false);
    setStatusBio('ocioso');
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
            Você está prestes a excluir <span className="font-semibold text-foreground">{nomeItem}</span>.
            Esta ação não pode ser desfeita e requer autorização.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Seletor de Método */}
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              onClick={() => setMetodo('biometria')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                metodo === 'biometria' ? "bg-white shadow-sm text-red-700" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ScanFace className="h-4 w-4" />
              Face ID
            </button>
            <button
              onClick={() => setMetodo('senha')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                metodo === 'senha' ? "bg-white shadow-sm text-red-700" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Lock className="h-4 w-4" />
              Senha
            </button>
          </div>

          {metodo === 'biometria' ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="relative">
                <div className={cn(
                  "h-24 w-24 rounded-2xl border-2 flex items-center justify-center transition-all duration-500",
                  statusBio === 'escaneando' ? "border-red-500 bg-red-50" : 
                  statusBio === 'sucesso' ? "border-green-500 bg-green-50" :
                  statusBio === 'erro' ? "border-amber-500 bg-amber-50" : "border-muted bg-muted/30"
                )}>
                  {statusBio === 'ocioso' && <ScanFace className="h-12 w-12 text-muted-foreground" />}
                  {statusBio === 'escaneando' && (
                    <div className="relative flex items-center justify-center">
                      <ScanFace className="h-12 w-12 text-red-600 animate-pulse" />
                      <div className="absolute inset-0 border-t-2 border-red-600 animate-[scan_2s_linear_infinite]" />
                    </div>
                  )}
                  {statusBio === 'sucesso' && <Check className="h-12 w-12 text-green-600 animate-in zoom-in" />}
                  {statusBio === 'erro' && <X className="h-12 w-12 text-amber-600 animate-in shake" />}
                </div>
                
                {statusBio === 'escaneando' && (
                  <div className="absolute -inset-4 border-2 border-red-500/20 rounded-full animate-ping" />
                )}
              </div>
              
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  {statusBio === 'ocioso' ? 'Pronto para escanear' : 
                   statusBio === 'escaneando' ? 'Escaneando Dani...' :
                   statusBio === 'sucesso' ? 'Identidade Confirmada!' : 'Falha na Leitura'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {statusBio === 'ocioso' ? 'Clique no botão abaixo para iniciar' : 
                   statusBio === 'escaneando' ? 'Mantenha-se em frente à câmera' :
                   statusBio === 'sucesso' ? 'Aguarde um instante' : 'Tente novamente ou use a senha'}
                </p>
              </div>

              {statusBio === 'ocioso' && (
                <div className="flex flex-col items-center gap-3 w-full">
                  {!estaBioCadastrada() ? (
                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100 w-full">
                      <p className="text-sm text-amber-800 font-medium">Face ID não cadastrado</p>
                      <p className="text-xs text-amber-700">Configure no topo da página para usar este recurso.</p>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleIniciarBiometria}
                      className="bg-red-600 hover:bg-red-700 text-white gap-2 px-8 w-full"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Autorizar com Face ID
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha-admin" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha Administrativa
                </Label>
                <Input
                  id="senha-admin"
                  type="password"
                  placeholder="Digite a senha administrativa"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setErro('');
                  }}
                  className={erro ? 'border-red-500' : ''}
                  autoFocus
                />
                {erro && <p className="text-sm text-red-600 font-medium">{erro}</p>}
              </div>
              <Button
                variant="destructive"
                onClick={handleConfirmar}
                disabled={!senha || carregando}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {carregando ? 'Excluindo...' : 'Confirmar com Senha'}
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={handleFechar} className="w-full sm:w-auto text-muted-foreground">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
      
      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-30px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(30px); opacity: 0; }
        }
      `}</style>
    </Dialog>
  );
}
