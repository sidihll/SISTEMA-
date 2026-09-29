import React from 'react';
import { Ticket, AuthUser } from '../types/ticket';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  Play,
  Check,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  user: AuthUser;
  onSelect: (ticket: Ticket) => void;
  onStartAttendance: (ticketId: string) => void;
  onOpenCloseModal: (ticket: Ticket) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  user,
  onSelect,
  onStartAttendance,
  onOpenCloseModal,
}) => {
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return 'Agora mesmo';
      if (diffMinutes < 60) return `há ${diffMinutes} min`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `há ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      return `há ${diffDays} dias`;
    } catch {
      return dateStr;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critica':
        return 'text-red-700 bg-red-100/90 font-bold';
      case 'alta':
        return 'text-amber-800 bg-amber-100/90 font-semibold';
      case 'media':
        return 'text-blue-800 bg-blue-100/90 font-medium';
      default:
        return 'text-neutral-700 bg-neutral-100 font-medium';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critica':
        return 'Crítica';
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Média';
      default:
        return 'Baixa';
    }
  };

  return (
    <div
      className={`bg-white border rounded-xl transition-all duration-150 p-5 ${
        ticket.machine_stopped && ticket.status !== 'encerrado'
          ? 'border-red-300 shadow-xs ring-1 ring-red-200'
          : ticket.status === 'em_atendimento'
          ? 'border-blue-200 hover:border-blue-300'
          : ticket.status === 'encerrado'
          ? 'border-neutral-200 opacity-90 hover:opacity-100'
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
            {ticket.code}
          </span>
          <span className="text-xs font-semibold text-neutral-900 truncate max-w-[200px] sm:max-w-xs">
            {ticket.equipment}
          </span>
        </div>

        {/* Priority & Machine Stopped Indicators */}
        <div className="flex items-center gap-1.5 shrink-0">
          {ticket.machine_stopped && ticket.status !== 'encerrado' && (
            <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" />
              Parada
            </span>
          )}
          <span className={`text-[11px] px-2 py-0.5 rounded ${getPriorityStyle(ticket.priority)}`}>
            {getPriorityLabel(ticket.priority)}
          </span>
        </div>
      </div>

      {/* Ticket Title */}
      <h3
        onClick={() => onSelect(ticket)}
        className="text-sm font-bold text-neutral-900 hover:text-amber-700 cursor-pointer transition-colors mb-1.5 line-clamp-1"
      >
        {ticket.title}
      </h3>

      {/* Description Snippet (Operator's descriptive information) */}
      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-3">
        {ticket.description}
      </p>

      {/* Mechanic's resolution snippet if closed */}
      {ticket.status === 'encerrado' && ticket.resolution_details && (
        <div className="mb-3 p-2.5 rounded bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
          <div className="flex items-center gap-1 font-semibold text-[11px] text-emerald-800 mb-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Serviço executado por {ticket.mechanic_name || 'Mecânico'}:</span>
          </div>
          <p className="line-clamp-2 text-neutral-700 font-sans">
            {ticket.resolution_details}
          </p>
        </div>
      )}

      {/* Metadata strip with typographic dots (Anti-slop zero-pill discipline) */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span>{ticket.sector}</span>
          <span aria-hidden="true">·</span>
          <span>{ticket.created_by_name}</span>
          <span aria-hidden="true">·</span>
          <span>{formatTimeAgo(ticket.created_at)}</span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {ticket.status === 'aberto' && (
            <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Aberto
            </span>
          )}
          {ticket.status === 'em_atendimento' && (
            <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 animate-pulse" /> Em Atendimento
            </span>
          )}
          {ticket.status === 'encerrado' && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Encerrado
            </span>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onSelect(ticket)}
          className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
        >
          Ver Detalhes
        </button>

        {/* Mechanic Interactivity */}
        {user.role === 'mecanico' && ticket.status === 'aberto' && (
          <button
            type="button"
            onClick={() => onStartAttendance(ticket.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
          >
            <Play className="w-3 h-3" />
            <span>Iniciar Atendimento</span>
          </button>
        )}

        {user.role === 'mecanico' && ticket.status === 'em_atendimento' && (
          <button
            type="button"
            onClick={() => onOpenCloseModal(ticket)}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Encerrar Chamado</span>
          </button>
        )}
      </div>
    </div>
  );
};
