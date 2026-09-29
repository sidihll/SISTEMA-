import React, { useState } from 'react';
import { Ticket, AuthUser } from '../types/ticket';
import { X, Wrench, CheckCircle2, Clock, Package, ShieldAlert, AlertTriangle } from 'lucide-react';

interface CloseTicketModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onConfirmClose: (
    ticketId: string,
    data: {
      resolution_details: string;
      parts_replaced: string;
      repair_time_minutes: number;
      preventive_notes: string;
      mechanic_name: string;
    }
  ) => Promise<void>;
  user: AuthUser;
}

export const CloseTicketModal: React.FC<CloseTicketModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onConfirmClose,
  user,
}) => {
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [repairTimeMinutes, setRepairTimeMinutes] = useState<number>(45);
  const [preventiveNotes, setPreventiveNotes] = useState('');
  const [mechanicName, setMechanicName] = useState(user.name || 'Mecânico');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!resolutionDetails.trim() || resolutionDetails.trim().length < 15) {
      setErrorMsg('Descreva detalhadamente o que foi feito na manutenção (mínimo 15 caracteres).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmClose(ticket.id, {
        resolution_details: resolutionDetails.trim(),
        parts_replaced: partsReplaced.trim(),
        repair_time_minutes: Number(repairTimeMinutes) || 0,
        preventive_notes: preventiveNotes.trim(),
        mechanic_name: mechanicName.trim() || 'Mecânico de Manutenção',
      });
      // reset
      setResolutionDetails('');
      setPartsReplaced('');
      setPreventiveNotes('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao encerrar chamado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-neutral-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-800">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Encerramento de Chamado Técnico
              </h2>
              <p className="text-xs text-neutral-500">
                Ordem de Serviço <span className="font-mono font-semibold">{ticket.code}</span> · {ticket.equipment}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Ticket Context Card */}
        <div className="bg-neutral-50/80 px-6 py-3.5 border-b border-neutral-200 text-xs text-neutral-600 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-900">{ticket.title}</span>
            <span className="font-mono text-[11px] text-neutral-500">{ticket.sector}</span>
          </div>
          <div className="bg-white p-2.5 rounded border border-neutral-200 text-neutral-700 leading-relaxed">
            <span className="font-semibold text-neutral-900 block text-[11px] mb-0.5">
              Relato original do Operador ({ticket.created_by_name}):
            </span>
            {ticket.description}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Resolution Description (Crucial user requirement: "O mecânico deve encerrar o chamado e descrever o que foi feito.") */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700">
                Descrição do que foi feito (Serviço Executado) *
              </label>
              <span className="text-[11px] text-neutral-500">
                Causa raiz identificada, reparo e testes
              </span>
            </div>
            <textarea
              rows={4}
              value={resolutionDetails}
              onChange={(e) => setResolutionDetails(e.target.value)}
              placeholder="Ex: Identificado desgaste prematuro no retentor do fuso devido à contaminação por limalha. Foi realizada a desmontagem do conjunto, limpeza com desengraxante, substituição do retentor NBR e lubrificação com graxa de lítio EP2. Executado teste de avanço rápido e ciclo de usinagem por 15 minutos sem ruído ou alarme."
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 leading-relaxed font-sans"
              required
            />
          </div>

          {/* Parts Replaced */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-neutral-500" />
              <span>Peças e Componentes Substituídos (se houver)</span>
            </label>
            <input
              type="text"
              value={partsReplaced}
              onChange={(e) => setPartsReplaced(e.target.value)}
              placeholder="Ex: 1x Retentor NBR 35x52x8, 2x Parafusos allen M8x35, 1L Óleo Hidráulico ISO VG 68"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            />
          </div>

          {/* Time & Mechanic Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>Tempo de Intervenção (minutos) *</span>
              </label>
              <input
                type="number"
                min={5}
                max={9999}
                value={repairTimeMinutes}
                onChange={(e) => setRepairTimeMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 font-mono tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Mecânico Responsável *
              </label>
              <input
                type="text"
                value={mechanicName}
                onChange={(e) => setMechanicName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-white"
                required
              />
            </div>
          </div>

          {/* Preventive Recommendations */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-neutral-500" />
              <span>Orientações Preventivas para a Operação / Futuro</span>
            </label>
            <textarea
              rows={2}
              value={preventiveNotes}
              onChange={(e) => setPreventiveNotes(e.target.value)}
              placeholder="Ex: Manter a proteção de cavacos sempre limpa e checar nível de lubrificação no início de cada turno."
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            />
          </div>

          {/* Footer action buttons */}
          <div className="border-t border-neutral-200 pt-4 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">
              O status da máquina retornará para liberada / normal.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Encerrando...' : 'Concluir e Encerrar Chamado'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
