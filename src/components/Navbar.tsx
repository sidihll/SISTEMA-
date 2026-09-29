import React from 'react';
import { AuthUser } from '../types/ticket';
import { LogOut, Database, HardHat, Wrench, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface NavbarProps {
  user: AuthUser;
  onLogout: () => void;
  onNewTicket: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConfigured: boolean;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  pendingCount: number;
  stoppedMachinesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onNewTicket,
  onOpenSupabaseModal,
  isSupabaseConfigured,
  activeFilter,
  onFilterChange,
  pendingCount,
  stoppedMachinesCount,
}) => {
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark in single text element */}
          <div className="flex items-center gap-3">
            <a href="/" className="text-lg font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-neutral-900 text-amber-400 flex items-center justify-center font-mono text-sm font-black">
                OS
              </span>
              <span>OrdemOS</span>
            </a>
            <span className="hidden sm:inline-block text-xs text-neutral-400 font-medium border-l border-neutral-200 pl-3">
              Gestão de Manutenção
            </span>
          </div>

          {/* Zone 2: Navigation Links / Fast Filters */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <button
              type="button"
              onClick={() => onFilterChange('todos')}
              className={`hover:text-neutral-900 transition-colors ${
                activeFilter === 'todos' ? 'text-neutral-900 font-semibold underline underline-offset-8 decoration-neutral-900' : ''
              }`}
            >
              Todos Chamados
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('abertos')}
              className={`hover:text-neutral-900 transition-colors flex items-center gap-1.5 ${
                activeFilter === 'abertos' ? 'text-neutral-900 font-semibold underline underline-offset-8 decoration-neutral-900' : ''
              }`}
            >
              <span>Abertos</span>
              {pendingCount > 0 && (
                <span className="font-mono text-xs text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-semibold tabular-nums">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('em_atendimento')}
              className={`hover:text-neutral-900 transition-colors ${
                activeFilter === 'em_atendimento' ? 'text-neutral-900 font-semibold underline underline-offset-8 decoration-neutral-900' : ''
              }`}
            >
              Em Atendimento
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('encerrados')}
              className={`hover:text-neutral-900 transition-colors ${
                activeFilter === 'encerrados' ? 'text-neutral-900 font-semibold underline underline-offset-8 decoration-neutral-900' : ''
              }`}
            >
              Histórico Encerrados
            </button>
            {stoppedMachinesCount > 0 && (
              <button
                type="button"
                onClick={() => onFilterChange('paradas')}
                className={`text-red-700 hover:text-red-800 transition-colors font-medium flex items-center gap-1 ${
                  activeFilter === 'paradas' ? 'underline underline-offset-8 decoration-red-600 font-bold' : ''
                }`}
              >
                <span>Máquinas Paradas ({stoppedMachinesCount})</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions and User State */}
          <div className="flex items-center gap-3">
            {/* Supabase connection indicator button */}
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              title="Configuração do Supabase"
              className={`text-xs px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                isSupabaseConfigured
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70'
                  : 'border-amber-200 bg-amber-50/70 text-amber-800 hover:bg-amber-100/70'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isSupabaseConfigured ? 'Supabase Conectado' : 'Conectar Supabase'}
              </span>
            </button>

            {/* Operator primary action */}
            {user.role === 'operador' && (
              <button
                type="button"
                onClick={onNewTicket}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Abrir Chamado</span>
              </button>
            )}

            {/* User role profile badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <div className="flex items-center gap-1.5 text-xs">
                {user.role === 'operador' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100/80 text-amber-800 font-semibold">
                    <HardHat className="w-3 h-3" />
                    Operador
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100/80 text-blue-800 font-semibold">
                    <Wrench className="w-3 h-3" />
                    Mecânico
                  </span>
                )}
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={onLogout}
                title="Sair do sistema"
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
