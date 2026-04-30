'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScanFace, Lock, ShieldCheck, CheckCircle2, Camera, RefreshCw } from 'lucide-react';
import { verificarSenhaAdmin, cadastrarBio } from '@/lib/agenda-store';
import { cn } from '@/lib/utils';

interface ModalCadastroBioProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

type Passo = 'senha' | 'camera' | 'sucesso';

export function ModalCadastroBio({ aberto, onFechar, onSucesso }: ModalCadastroBioProps) {
  const [passo, setPasso] = useState<Passo>('senha');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [statusScan, setStatusScan] = useState<'ocioso' | 'escaneando'>('ocioso');

  const handleValidarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificarSenhaAdmin(senha)) {
      setPasso('camera');
    } else {
      setErro('Senha administrativa inválida');
    }
  };

  const handleIniciarScan = () => {
    setStatusScan('escaneando');
    // Simula o escaneamento por 3 segundos
    setTimeout(() => {
      cadastrarBio();
      setPasso('sucesso');
    }, 3000);
  };

  const handleReset = () => {
    setPasso('senha');
    setSenha('');
    setErro('');
    setStatusScan('ocioso');
    onFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={handleReset}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ScanFace className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            {passo === 'senha' && 'Autenticação Necessária'}
            {passo === 'camera' && 'Cadastrar Biometria'}
            {passo === 'sucesso' && 'Cadastro Concluído!'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {passo === 'senha' && 'Insira a senha admin para liberar o cadastro de face.'}
            {passo === 'camera' && 'Posicione seu rosto em frente à câmera.'}
            {passo === 'sucesso' && 'Sua leitura facial foi registrada com sucesso.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {passo === 'senha' && (
            <form onSubmit={handleValidarSenha} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pass-admin" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-red-600" />
                  Senha Admin
                </Label>
                <Input
                  id="pass-admin"
                  type="password"
                  placeholder="admin2026"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setErro('');
                  }}
                  className={cn("text-center text-lg tracking-widest", erro && "border-red-500")}
                  autoFocus
                />
                {erro && <p className="text-sm text-red-600 text-center font-medium">{erro}</p>}
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                Verificar Senha
              </Button>
            </form>
          )}

          {passo === 'camera' && (
            <div className="flex flex-col items-center space-y-6">
              <div className="relative h-48 w-48 rounded-full border-4 border-dashed border-red-200 flex items-center justify-center bg-muted/30 overflow-hidden">
                {statusScan === 'ocioso' ? (
                  <Camera className="h-16 w-16 text-muted-foreground animate-pulse" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-red-600/10 animate-pulse" />
                    <ScanFace className="h-20 w-20 text-red-600 z-10" />
                    <div className="absolute inset-0 border-t-4 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-[scan_2s_linear_infinite]" />
                  </>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  {statusScan === 'ocioso' ? 'Clique para iniciar' : 'Mapeando pontos faciais...'}
                </p>
                {statusScan === 'escaneando' && (
                  <div className="flex gap-1 justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-bounce" />
                  </div>
                )}
              </div>

              {statusScan === 'ocioso' && (
                <Button 
                  onClick={handleIniciarScan}
                  className="bg-red-600 hover:bg-red-700 gap-2 px-8 py-6 rounded-xl text-lg shadow-lg shadow-red-200"
                >
                  <ShieldCheck className="h-5 w-5" />
                  Iniciar Captura
                </Button>
              )}
            </div>
          )}

          {passo === 'sucesso' && (
            <div className="flex flex-col items-center py-6 space-y-4">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-green-800">Pronto, Dani!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Agora você pode excluir agendamentos usando apenas seu rosto.
                </p>
              </div>
              <Button onClick={handleReset} className="mt-4 bg-green-600 hover:bg-green-700 w-full">
                Finalizar Cadastro
              </Button>
            </div>
          )}
        </div>

        {passo !== 'sucesso' && (
          <DialogFooter>
            <Button variant="ghost" onClick={handleReset} className="w-full text-muted-foreground">
              Cancelar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(100px); }
        }
      `}</style>
    </Dialog>
  );
}
