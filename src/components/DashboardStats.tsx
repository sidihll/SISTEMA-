import React from 'react';
import { Ticket } from '../types/ticket';
import { Clock, CheckCircle2, AlertOctagon, Wrench, FileText } from 'lucide-react';

interface DashboardStatsProps {
  tickets: Ticket[];
  onSelectFilter: (filter: string) => void;
  activeFilter: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  tickets,
  onSelectFilter,
  activeFilter,
}) => {
  const total = tickets.length;
  const abertos = tickets.filter((t) => t.status === 'aberto').length;
  const emAtendimento = tickets.filter((t) => t.status === 'em_atendimento').length;
  const encerrados = tickets.filter((t) => t.status === 'encerrado').length;
  const paradas = tickets.filter((t) => t.machine_stopped && t.status !== 'encerrado').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* Total */}
      <button
        type="button"
        onClick={() => onSelectFilter('todos')}
        className={`p-4 rounded-xl border text-left transition-all ${
          activeFilter === 'todos'
            ? 'border-neutral-900 bg-white ring-1 ring-neutral-900 shadow-xs'
            : 'border-neutral-200 bg-white hover:border-neutral-300'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-neutral-500 font-medium mb-1">
          <span>Total de O.S.</span>
          <FileText className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
          {total}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">
          Ordens registradas
        </div>
      </button>

      {/* Abertos */}
      <button
        type="button"
        onClick={() => onSelectFilter('abertos')}
        className={`p-4 rounded-xl border text-left transition-all ${
          activeFilter === 'abertos'
            ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600 shadow-xs'
            : 'border-neutral-200 bg-white hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-amber-700 font-medium mb-1">
          <span>Aguardando Mecânico</span>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-amber-800">
          {abertos}
        </div>
        <div className="text-[11px] text-amber-700/80 mt-1">
          Sem atendimento iniciado
        </div>
      </button>

      {/* Em Atendimento */}
      <button
        type="button"
        onClick={() => onSelectFilter('em_atendimento')}
        className={`p-4 rounded-xl border text-left transition-all ${
          activeFilter === 'em_atendimento'
            ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-xs'
            : 'border-neutral-200 bg-white hover:border-blue-300'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-blue-700 font-medium mb-1">
          <span>Em Manutenção</span>
          <Wrench className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-blue-800">
          {emAtendimento}
        </div>
        <div className="text-[11px] text-blue-700/80 mt-1">
          Intervenção em andamento
        </div>
      </button>

      {/* Encerrados */}
      <button
        type="button"
        onClick={() => onSelectFilter('encerrados')}
        className={`p-4 rounded-xl border text-left transition-all ${
          activeFilter === 'encerrados'
            ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-xs'
            : 'border-neutral-200 bg-white hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-emerald-700 font-medium mb-1">
          <span>Encerrados</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-emerald-800">
          {encerrados}
        </div>
        <div className="text-[11px] text-emerald-700/80 mt-1">
          Reparos finalizados
        </div>
      </button>

      {/* Máquinas Paradas */}
      <button
        type="button"
        onClick={() => onSelectFilter('paradas')}
        className={`p-4 rounded-xl border text-left col-span-2 md:col-span-1 transition-all ${
          activeFilter === 'paradas'
            ? 'border-red-600 bg-red-50/60 ring-1 ring-red-600 shadow-xs'
            : paradas > 0
            ? 'border-red-200 bg-red-50/30 hover:border-red-300'
            : 'border-neutral-200 bg-white hover:border-neutral-300'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-red-700 font-semibold mb-1">
          <span>Máquinas Paradas</span>
          <AlertOctagon className="w-4 h-4 text-red-600" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-red-700">
          {paradas}
        </div>
        <div className="text-[11px] text-red-600/80 mt-1">
          Impacto crítico na fábrica
        </div>
      </button>
    </div>
  );
};
