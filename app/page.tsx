'use client';

import { useState, useEffect } from 'react';
import { TelaLogin } from '@/components/tela-login';
import { DashboardAgenda } from '@/components/dashboard-agenda';
import { estaAutenticado } from '@/lib/agenda-store';

export default function Home() {
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setAutenticado(estaAutenticado());
    setCarregando(false);
  }, []);

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-amber-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-200 border-t-red-600" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return <TelaLogin onLoginSucesso={() => setAutenticado(true)} />;
  }

  return <DashboardAgenda />;
}
