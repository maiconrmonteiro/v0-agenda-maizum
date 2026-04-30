'use client';

import Image from 'next/image';
import { LogOut, ScanFace } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fazerLogout } from '@/lib/agenda-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ModalCadastroBio } from './modal-cadastro-bio';
import { toast } from 'sonner';

export function Header() {
  const router = useRouter();
  const [modalBioAberto, setModalBioAberto] = useState(false);

  const handleLogout = () => {
    fazerLogout();
    router.push('/');
  };

  const handleSucessoBio = () => {
    setModalBioAberto(false);
    toast.success('Face ID cadastrado com sucesso!');
  };

  return (
    <header className="sticky top-0 z-50 bg-red-700 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-32">
            <Image
              src="/logo-maizum.png"
              alt="Maizum Alimentos Congelados"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setModalBioAberto(true)}
            className="text-white hover:bg-red-600 hover:text-white"
            title="Configurar Face ID"
          >
            <ScanFace className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-white hover:bg-red-600 hover:text-white"
            aria-label="Sair"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ModalCadastroBio 
        aberto={modalBioAberto} 
        onFechar={() => setModalBioAberto(false)} 
        onSucesso={handleSucessoBio}
      />
    </header>
  );
}
