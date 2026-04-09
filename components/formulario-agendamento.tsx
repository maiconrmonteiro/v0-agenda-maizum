'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Agendamento, StatusVisita, STATUS_CONFIG, VENDEDORES } from '@/lib/types';
import { CLIENTES_LISTA, CIDADES_LISTA } from '@/lib/mock-data';
import { Calendar, User, MapPin, FileText, CheckCircle } from 'lucide-react';

interface FormularioAgendamentoProps {
  aberto: boolean;
  agendamento?: Agendamento | null;
  onFechar: () => void;
  onSalvar: (dados: Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
}

export function FormularioAgendamento({ aberto, agendamento, onFechar, onSalvar }: FormularioAgendamentoProps) {
  const [formData, setFormData] = useState({
    data: '',
    cliente: '',
    cidadeBairro: '',
    vendedor: '',
    observacoes: '',
    status: 'agendado' as StatusVisita,
    resultadoVisita: '',
    retornoCombinado: '',
  });

  const [clienteCustom, setClienteCustom] = useState('');
  const [usarClienteCustom, setUsarClienteCustom] = useState(false);

  useEffect(() => {
    if (agendamento) {
      setFormData({
        data: agendamento.data,
        cliente: agendamento.cliente,
        cidadeBairro: agendamento.cidadeBairro || '',
        vendedor: agendamento.vendedor,
        observacoes: agendamento.observacoes || '',
        status: agendamento.status,
        resultadoVisita: agendamento.resultadoVisita || '',
        retornoCombinado: agendamento.retornoCombinado || '',
      });
      const isCustom = !CLIENTES_LISTA.includes(agendamento.cliente);
      setUsarClienteCustom(isCustom);
      if (isCustom) setClienteCustom(agendamento.cliente);
    } else {
      setFormData({
        data: new Date().toISOString().split('T')[0],
        cliente: '',
        cidadeBairro: '',
        vendedor: '',
        observacoes: '',
        status: 'agendado',
        resultadoVisita: '',
        retornoCombinado: '',
      });
      setClienteCustom('');
      setUsarClienteCustom(false);
    }
  }, [agendamento, aberto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clienteFinal = usarClienteCustom ? clienteCustom : formData.cliente;
    
    if (!formData.data || !clienteFinal || !formData.vendedor) {
      return;
    }

    onSalvar({
      ...formData,
      cliente: clienteFinal,
      cidadeBairro: formData.cidadeBairro || undefined,
      observacoes: formData.observacoes || undefined,
      resultadoVisita: formData.resultadoVisita || undefined,
      retornoCombinado: formData.retornoCombinado || undefined,
    });
    onFechar();
  };

  const isEdicao = !!agendamento;

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <Calendar className="h-5 w-5" />
            {isEdicao ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <DialogDescription>
            {isEdicao ? 'Atualize os dados do agendamento abaixo.' : 'Preencha os dados para criar um novo agendamento.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="data" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-600" />
              Data *
            </Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
              className="text-base"
            />
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-red-600" />
              Cliente *
            </Label>
            <div className="space-y-2">
              <Select
                value={usarClienteCustom ? 'custom' : formData.cliente}
                onValueChange={(val) => {
                  if (val === 'custom') {
                    setUsarClienteCustom(true);
                    setFormData({ ...formData, cliente: '' });
                  } else {
                    setUsarClienteCustom(false);
                    setFormData({ ...formData, cliente: val });
                  }
                }}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENTES_LISTA.map((cliente) => (
                    <SelectItem key={cliente} value={cliente}>
                      {cliente}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Outro cliente</SelectItem>
                </SelectContent>
              </Select>
              {usarClienteCustom && (
                <Input
                  placeholder="Nome do cliente"
                  value={clienteCustom}
                  onChange={(e) => setClienteCustom(e.target.value)}
                  required
                  className="text-base"
                />
              )}
            </div>
          </div>

          {/* Vendedor */}
          <div className="space-y-2">
            <Label htmlFor="vendedor" className="flex items-center gap-2">
              <User className="h-4 w-4 text-amber-600" />
              Vendedor *
            </Label>
            <Select
              value={formData.vendedor}
              onValueChange={(val) => setFormData({ ...formData, vendedor: val })}
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Selecione o vendedor" />
              </SelectTrigger>
              <SelectContent>
                {VENDEDORES.map((vendedor) => (
                  <SelectItem key={vendedor} value={vendedor}>
                    {vendedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cidade/Bairro */}
          <div className="space-y-2">
            <Label htmlFor="cidadeBairro" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              Cidade / Bairro
            </Label>
            <Select
              value={formData.cidadeBairro || 'nenhum'}
              onValueChange={(val) => setFormData({ ...formData, cidadeBairro: val === 'nenhum' ? '' : val })}
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Não informado</SelectItem>
                {CIDADES_LISTA.map((cidade) => (
                  <SelectItem key={cidade} value={cidade}>
                    {cidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val as StatusVisita })}
            >
              <SelectTrigger className="text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600" />
              Observações
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Adicione observações sobre a visita..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              className="text-base"
            />
          </div>

          {/* Resultado da visita (condicional) */}
          {['realizado', 'sem_interesse', 'cancelado'].includes(formData.status) && (
            <div className="space-y-2">
              <Label htmlFor="resultadoVisita">Resultado da Visita</Label>
              <Textarea
                id="resultadoVisita"
                placeholder="Descreva o resultado..."
                value={formData.resultadoVisita}
                onChange={(e) => setFormData({ ...formData, resultadoVisita: e.target.value })}
                rows={2}
                className="text-base"
              />
            </div>
          )}

          {/* Retorno combinado (condicional) */}
          {['reagendar', 'confirmado', 'agendado'].includes(formData.status) && (
            <div className="space-y-2">
              <Label htmlFor="retornoCombinado">Retorno Combinado</Label>
              <Input
                id="retornoCombinado"
                placeholder="Ex: 7 dias, próxima semana..."
                value={formData.retornoCombinado}
                onChange={(e) => setFormData({ ...formData, retornoCombinado: e.target.value })}
                className="text-base"
              />
            </div>
          )}

          {/* Botões */}
          <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onFechar} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="w-full bg-red-600 text-white hover:bg-red-700 sm:w-auto"
              disabled={!formData.data || (!formData.cliente && !clienteCustom) || !formData.vendedor}
            >
              {isEdicao ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
