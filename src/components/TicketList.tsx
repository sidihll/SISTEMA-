import React, { useState, useMemo } from 'react';
import { Ticket, AuthUser } from '../types/ticket';
import { TicketCard } from './TicketCard';
import { Search, Filter, Plus, Wrench, AlertOctagon, CheckCircle2, RotateCcw } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  user: AuthUser;
  onSelectTicket: (ticket: Ticket) => void;
  onStartAttendance: (ticketId: string) => void;
  onOpenCloseModal: (ticket: Ticket) => void;
  onNewTicket: () => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  user,
  onSelectTicket,
  onStartAttendance,
  onOpenCloseModal,
  onNewTicket,
  activeFilter,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('todos');

  // Extract unique sectors
  const sectors = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.sector) set.add(t.sector);
    });
    return Array.from(set);
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Status / state filter
      if (activeFilter === 'abertos' && t.status !== 'aberto') return false;
      if (activeFilter === 'em_atendimento' && t.status !== 'em_atendimento') return false;
      if (activeFilter === 'encerrados' && t.status !== 'encerrado') return false;
      if (activeFilter === 'paradas' && (!t.machine_stopped || t.status === 'encerrado')) return false;

      // Sector filter
      if (sectorFilter !== 'todos' && t.sector !== sectorFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchCode = t.code.toLowerCase().includes(query);
        const matchEquip = t.equipment.toLowerCase().includes(query);
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchDesc = t.description.toLowerCase().includes(query);
        const matchSector = t.sector.toLowerCase().includes(query);
        const matchMech = (t.mechanic_name || '').toLowerCase().includes(query);
        const matchOp = t.created_by_name.toLowerCase().includes(query);

        if (!matchCode && !matchEquip && !matchTitle && !matchDesc && !matchSector && !matchMech && !matchOp) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, activeFilter, sectorFilter, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código (OS-001), máquina, setor, falha..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-neutral-50/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-neutral-400 hover:text-neutral-600"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Sector Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="text-xs py-2 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
          >
            <option value="todos">Todos os Setores</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Quick Operator Add Button on mobile or if needed */}
          {user.role === 'operador' && (
            <button
              type="button"
              onClick={onNewTicket}
              className="md:hidden inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Abrir</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Filter Bar */}
      <div className="flex items-center justify-between overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-200/60 rounded-lg">
          <button
            type="button"
            onClick={() => onFilterChange('todos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeFilter === 'todos'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Todos ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('abertos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeFilter === 'abertos'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Abertos ({tickets.filter((t) => t.status === 'aberto').length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('em_atendimento')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeFilter === 'em_atendimento'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Em Atendimento ({tickets.filter((t) => t.status === 'em_atendimento').length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('encerrados')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeFilter === 'encerrados'
                ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Encerrados ({tickets.filter((t) => t.status === 'encerrado').length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('paradas')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeFilter === 'paradas'
                ? 'bg-red-600 text-white shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Máquinas Paradas ({tickets.filter((t) => t.machine_stopped && t.status !== 'encerrado').length})
          </button>
        </div>

        <span className="text-xs text-neutral-500 font-mono hidden sm:inline-block">
          Exibindo {filteredTickets.length} de {tickets.length}
        </span>
      </div>

      {/* Ticket Grid / List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 mb-1">
            Nenhum chamado encontrado
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
            {searchTerm || sectorFilter !== 'todos' || activeFilter !== 'todos'
              ? 'Tente ajustar os filtros ou o termo de busca para visualizar os registros.'
              : 'Não há ordens de serviço cadastradas no momento.'}
          </p>
          {user.role === 'operador' && (
            <button
              type="button"
              onClick={onNewTicket}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir Novo Chamado</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              user={user}
              onSelect={onSelectTicket}
              onStartAttendance={onStartAttendance}
              onOpenCloseModal={onOpenCloseModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};
