import React, { useState } from 'react';
import { Ticket, TicketPriority, AuthUser } from '../types/ticket';
import { X, AlertTriangle, AlertOctagon, HelpCircle, HardHat } from 'lucide-react';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: Omit<Ticket, 'id'>) => Promise<void>;
  user: AuthUser;
}

const COMMON_EQUIPMENTS = [
  'Prensa Hidráulica 20T',
  'Torno CNC Mazak 03',
  'Centro de Usinagem Romi',
  'Injetora Plástica 180T',
  'Esteira Transportadora L2',
  'Compressor de Ar Schulz 40HP',
  'Dobradeira CNC 80T',
  'Ponte Rolante 5T',
];

const COMMON_SECTORS = [
  'Usinagem de Precisão',
  'Estamparia Pesada',
  'Linha de Montagem',
  'Injeção Plástica',
  'Caldeiraria e Solda',
  'Logística e Expedição',
  'Pintura Industrial',
  'Utilidades / Central',
];

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const [equipment, setEquipment] = useState('');
  const [sector, setSector] = useState(COMMON_SECTORS[0]);
  const [priority, setPriority] = useState<TicketPriority>('alta');
  const [machineStopped, setMachineStopped] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [operatorName, setOperatorName] = useState(user.name || 'Operador');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!equipment.trim()) {
      setErrorMsg('Informe o equipamento ou máquina com defeito.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Informe o título resumido do chamado.');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setErrorMsg('Por favor, detalhe as informações descritivas da falha (mínimo 15 caracteres).');
      return;
    }

    setIsSubmitting(true);
    try {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const code = `OS-${new Date().getFullYear()}-${randomSuffix}`;

      await onSubmit({
        code,
        title: title.trim(),
        equipment: equipment.trim(),
        sector,
        priority,
        machine_stopped: machineStopped,
        description: description.trim(),
        status: 'aberto',
        created_by_role: 'operador',
        created_by_name: operatorName.trim() || 'Operador Fábrica',
        created_at: new Date().toISOString(),
        started_at: null,
        closed_at: null,
        mechanic_name: null,
        resolution_details: null,
        parts_replaced: null,
        repair_time_minutes: null,
        preventive_notes: null,
      });

      // Reset form
      setEquipment('');
      setTitle('');
      setDescription('');
      setMachineStopped(false);
      setPriority('alta');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar chamado.');
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
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Abertura de Chamado de Manutenção
              </h2>
              <p className="text-xs text-neutral-500">
                Preencha os dados e descreva detalhadamente a falha para a equipe mecânica
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Machine & Sector Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Equipamento / Máquina *
              </label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="Ex: Torno CNC 02, Prensa 15T..."
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                required
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {COMMON_EQUIPMENTS.slice(0, 3).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setEquipment(item)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded transition-colors"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Setor / Linha de Produção *
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-white"
              >
                {COMMON_SECTORS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Machine Stopped Warning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nível de Gravidade / Prioridade *
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPriority('baixa')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    priority === 'baixa'
                      ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Baixa
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('media')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    priority === 'media'
                      ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Média
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('alta')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    priority === 'alta'
                      ? 'bg-amber-600 text-white shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Alta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPriority('critica');
                    setMachineStopped(true);
                  }}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    priority === 'critica'
                      ? 'bg-red-600 text-white shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Crítica
                </button>
              </div>
            </div>

            {/* Machine Stopped Checkbox with High Contrast Alert */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Situação Operacional
              </label>
              <label
                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  machineStopped
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={machineStopped}
                  onChange={(e) => setMachineStopped(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-neutral-300"
                />
                <div className="text-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    {machineStopped && <AlertOctagon className="w-3.5 h-3.5 text-red-600" />}
                    <span>A máquina está parada?</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block">
                    {machineStopped
                      ? 'Parada de linha ativada (atenção imediata)'
                      : 'Operando normalmente ou com restrição parcial'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Ticket Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Título Resumido do Chamado *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Vazamento de fluido no cilindro de elevação"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
              required
            />
          </div>

          {/* Descriptive Information (Crucial user requirement: "O operador deve abrir o chamado e colocar as informações descritivas") */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700">
                Informações Descritivas da Falha *
              </label>
              <span className="text-[11px] text-neutral-500">
                Descreva sintomas, ruídos, cheiro, mensagens do painel ou causas visíveis
              </span>
            </div>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Durante a operação no turno da tarde, o operador notou vibração excessiva no carro móvel e queda súbita de pressão no manômetro de 180 bar para 120 bar. Há vazamento visível de óleo próximo aos retentores frontais..."
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 leading-relaxed font-sans"
              required
            />
          </div>

          {/* Operator Name */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Operador Solicitante
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-white"
            />
          </div>

          {/* Action buttons */}
          <div className="border-t border-neutral-200 pt-4 flex items-center justify-end gap-3">
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
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
            >
              {isSubmitting ? 'Registrando Chamado...' : 'Abrir Chamado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
