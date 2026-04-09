'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { verificarSenhaAcesso, fazerLogin } from '@/lib/agenda-store';

interface TelaLoginProps {
  onLoginSucesso: () => void;
}

export function TelaLogin({ onLoginSucesso }: TelaLoginProps) {
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    if (!verificarSenhaAcesso(senha)) {
      setErro('Senha incorreta');
      return;
    }
    
    setCarregando(true);
    fazerLogin();
    
    setTimeout(() => {
      onLoginSucesso();
    }, 500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-50 to-amber-50 p-4">
      <Card className="w-full max-w-sm border-0 shadow-xl">
        <CardContent className="p-6">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative h-20 w-52">
              <Image
                src="/logo-maizum.png"
                alt="Maizum Alimentos Congelados"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Título */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-red-700">
              Agenda da Promotora
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sistema de agendamentos comerciais
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-red-600" />
                Senha de Acesso
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Digite a senha"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setErro('');
                  }}
                  className={`pr-10 text-base ${erro ? 'border-red-500' : ''}`}
                  autoComplete="current-password"
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

            <Button
              type="submit"
              disabled={!senha || carregando}
              className="w-full bg-red-600 py-6 text-base font-semibold text-white hover:bg-red-700"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Rodapé */}
          <div className="mt-6 border-t pt-4">
            <p className="text-center text-xs text-muted-foreground">
              Acesso restrito à equipe comercial Maizum
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Marca d&apos;água */}
      <p className="mt-6 text-xs text-muted-foreground">
        Maizum Alimentos Congelados © {new Date().getFullYear()}
      </p>
    </div>
  );
}
