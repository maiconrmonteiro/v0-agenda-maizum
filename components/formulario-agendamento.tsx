'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Agendamento, StatusVisita, STATUS_CONFIG, VENDEDORES, Periodo, PERIODO_CONFIG } from '@/lib/types';
import { contarAgendamentosPorDia } from '@/lib/agenda-store';
import { Calendar, User, Clock, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface FormularioAgendamentoProps {
  aberto: boolean;
  agendamento?: Agendamento | null;
  todosAgendamentos: Agendamento[];
  dataPreSelecionada?: string | null;
  onFechar: () => void;
  onSalvar: (dados: Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
}

export function FormularioAgendamento({ aberto, agendamento, todosAgendamentos, dataPreSelecionada, onFechar, onSalvar }: FormularioAgendamentoProps) {
  const [formData, setFormData] = useState({
    data: '',
    cliente: '',
    periodo: '' as Periodo | '',
    vendedor: '',
    observacoes: '',
    status: 'agendado' as StatusVisita,
    resultadoVisita: '',
    retornoCombinado: '',
  });

  const agendamentosNoDia = formData.data 
    ? contarAgendamentosPorDia(todosAgendamentos, formData.data, agendamento?.id) 
    : 0;

  useEffect(() => {
    if (agendamento) {
      setFormData({
        data: agendamento.data,
        cliente: agendamento.cliente,
        periodo: agendamento.periodo || '',
        vendedor: agendamento.vendedor,
        observacoes: agendamento.observacoes || '',
        status: agendamento.status,
        resultadoVisita: agendamento.resultadoVisita || '',
        retornoCombinado: agendamento.retornoCombinado || '',
      });
    } else {
      setFormData({
        data: dataPreSelecionada || new Date().toISOString().split('T')[0],
        cliente: '',
        periodo: '',
        vendedor: '',
        observacoes: '',
        status: 'agendado',
        resultadoVisita: '',
        retornoCombinado: '',
      });
    }
  }, [agendamento, aberto, dataPreSelecionada ?? null]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.data || !formData.cliente || !formData.vendedor) {
      return;
    }

    onSalvar({
      ...formData,
      periodo: formData.periodo || undefined,
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
            <Label htmlFor="cliente" className="flex items-center gap-2">
              <User className="h-4 w-4 text-red-600" />
              Cliente *
            </Label>
            <Input
              id="cliente"
              placeholder="Nome do cliente"
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              required
              className="text-base"
            />
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

          {/* Período */}
          <div className="space-y-2">
            <Label htmlFor="periodo" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Período
            </Label>
            <Select
              value={formData.periodo || 'nenhum'}
              onValueChange={(val) => setFormData({ ...formData, periodo: val === 'nenhum' ? '' : val as Periodo })}
            >
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Não informado</SelectItem>
                {Object.entries(PERIODO_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alerta de agendamentos no dia */}
          {agendamentosNoDia >= 2 && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Atenção: Dia com muitos compromissos</p>
                <p className="text-amber-700">
                  Já existem {agendamentosNoDia} agendamento{agendamentosNoDia > 1 ? 's' : ''} para esta data.
                </p>
              </div>
            </div>
          )}

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
              disabled={!formData.data || !formData.cliente || !formData.vendedor}
            >
              {isEdicao ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
