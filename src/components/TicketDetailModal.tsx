import React from 'react';
import { Ticket, AuthUser } from '../types/ticket';
import {
  X,
  Printer,
  Wrench,
  HardHat,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  Package,
  ShieldCheck,
  Play,
} from 'lucide-react';

interface TicketDetailModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  user: AuthUser;
  onStartAttendance: (ticketId: string) => void;
  onOpenCloseModal: (ticket: Ticket) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  ticket,
  onClose,
  user,
  onStartAttendance,
  onOpenCloseModal,
}) => {
  if (!isOpen || !ticket) return null;

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'critica':
        return <span className="text-xs font-semibold text-red-700 bg-red-100/80 px-2 py-0.5 rounded">Crítica</span>;
      case 'alta':
        return <span className="text-xs font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">Alta</span>;
      case 'media':
        return <span className="text-xs font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">Média</span>;
      default:
        return <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">Baixa</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'aberto':
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">Aberto</span>;
      case 'em_atendimento':
        return <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">Em Atendimento</span>;
      case 'encerrado':
        return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">Encerrado</span>;
      default:
        return <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full">{s}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full border border-neutral-200 overflow-hidden my-6 printable-area">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-neutral-900 bg-white border border-neutral-300 px-2.5 py-1 rounded">
              {ticket.code}
            </span>
            <div>
              <h2 className="text-base font-bold text-neutral-900 leading-tight">
                {ticket.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                <span>{ticket.equipment}</span>
                <span>·</span>
                <span>{ticket.sector}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              title="Imprimir Ordem de Serviço"
              className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status & Priority Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Status da O.S.:</span>
              {getStatusBadge(ticket.status)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Prioridade:</span>
              {getPriorityBadge(ticket.priority)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500">Máquina Parada:</span>
              {ticket.machine_stopped ? (
                <span className="text-xs font-semibold text-red-700 flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5" /> Sim (Linha Parada)
                </span>
              ) : (
                <span className="text-xs text-neutral-700">Não (Operando)</span>
              )}
            </div>
          </div>

          {/* Section 1: Abertura e Informações Descritivas */}
          <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded text-amber-800">
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Abertura do Chamado (Operador)
                  </h3>
                  <div className="text-[11px] text-neutral-500">
                    Registrado por {ticket.created_by_name} em {formatDate(ticket.created_at)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-neutral-700 block mb-1">
                Informações Descritivas Relatadas:
              </span>
              <p className="text-sm text-neutral-800 bg-neutral-50 p-3 rounded border border-neutral-200/80 leading-relaxed font-sans whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Section 2: Encerramento e O que foi feito */}
          {ticket.status === 'encerrado' ? (
            <div className="border border-emerald-200 bg-emerald-50/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 rounded text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Encerramento da Ordem de Serviço (Mecânico)
                    </h3>
                    <div className="text-[11px] text-emerald-700/80">
                      Finalizado por {ticket.mechanic_name || 'Mecânico'} em {formatDate(ticket.closed_at)}
                    </div>
                  </div>
                </div>
                {ticket.repair_time_minutes && (
                  <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                    Tempo de intervenção: {ticket.repair_time_minutes} min
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-neutral-800 block mb-1">
                  O Que Foi Feito (Descrição Técnica da Manutenção):
                </span>
                <p className="text-sm text-neutral-800 bg-white p-3 rounded border border-emerald-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {ticket.resolution_details}
                </p>
              </div>

              {ticket.parts_replaced && (
                <div>
                  <span className="text-xs font-semibold text-neutral-800 block mb-1 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Peças e Componentes Substituídos:</span>
                  </span>
                  <p className="text-xs font-mono text-neutral-700 bg-white p-2.5 rounded border border-neutral-200">
                    {ticket.parts_replaced}
                  </p>
                </div>
              )}

              {ticket.preventive_notes && (
                <div>
                  <span className="text-xs font-semibold text-neutral-800 block mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Orientações Preventivas para a Operação:</span>
                  </span>
                  <p className="text-xs text-neutral-700 bg-white p-2.5 rounded border border-neutral-200">
                    {ticket.preventive_notes}
                  </p>
                </div>
              )}
            </div>
          ) : ticket.status === 'em_atendimento' ? (
            <div className="border border-blue-200 bg-blue-50/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded text-blue-800">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Atendimento em Andamento
                  </h3>
                  <div className="text-[11px] text-blue-700">
                    Iniciado por {ticket.mechanic_name || 'Mecânico'} em {formatDate(ticket.started_at)}
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-600 pl-8">
                O mecânico está atualmente intervindo na máquina. Ao término, a O.S. será encerrada com o laudo de serviço executado.
              </p>
            </div>
          ) : (
            <div className="border border-neutral-200 bg-neutral-50 rounded-lg p-4 text-xs text-neutral-500 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Chamado pendente de atribuição. Aguardando mecânico iniciar atendimento.</span>
            </div>
          )}
        </div>

        {/* Modal Footer with Role Contextual Actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between print:hidden">
          <div className="text-xs text-neutral-500 font-mono">
            {ticket.code} · OrdemOS
          </div>
          <div className="flex items-center gap-3">
            {/* Mechanic Actions */}
            {user.role === 'mecanico' && ticket.status === 'aberto' && (
              <button
                type="button"
                onClick={() => {
                  onStartAttendance(ticket.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Iniciar Atendimento</span>
              </button>
            )}

            {user.role === 'mecanico' && ticket.status === 'em_atendimento' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCloseModal(ticket);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Encerrar Chamado</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
