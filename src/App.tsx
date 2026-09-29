import React, { useState, useEffect, useCallback } from 'react';
import { AuthUser, Ticket } from './types/ticket';
import {
  fetchTickets,
  createTicket,
  updateTicket,
  getStoredSupabaseConfig,
} from './lib/supabase';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { TicketList } from './components/TicketList';
import { NewTicketModal } from './components/NewTicketModal';
import { CloseTicketModal } from './components/CloseTicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { SupabaseModal } from './components/SupabaseModal';
import {
  AlertCircle,
  Database,
  CheckCircle2,
  HardHat,
  Wrench,
  X,
  Plus,
  ArrowRight,
} from 'lucide-react';

const AUTH_STORAGE_KEY = 'ordemos_current_user';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  const [supabaseMessage, setSupabaseMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('todos');

  // Modals state
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isCloseTicketOpen, setIsCloseTicketOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    const config = getStoredSupabaseConfig();
    const hasConfig = Boolean(config.url && config.anonKey);
    setIsSupabaseConfigured(hasConfig);

    const res = await fetchTickets();
    setTickets(res.tickets);
    setIsSupabaseConfigured(res.isUsingSupabase);
    if (res.error) {
      setSupabaseMessage(res.error);
    } else {
      setSupabaseMessage(null);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    showToast(`Bem-vindo, ${user.name}! Acesso como ${user.role}.`, 'info');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  const handleCreateTicket = async (ticketData: Omit<Ticket, 'id'>) => {
    const res = await createTicket(ticketData);
    if (res.success) {
      showToast(`Chamado ${res.ticket.code} aberto com sucesso!`, 'success');
      loadData();
    } else {
      showToast('Erro ao registrar chamado.', 'error');
    }
  };

  const handleStartAttendance = async (ticketId: string) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const res = await updateTicket(ticketId, {
      status: 'em_atendimento',
      started_at: now,
      mechanic_name: currentUser.name || 'Mecânico',
    });

    if (res.success) {
      showToast('Atendimento iniciado pelo mecânico!', 'info');
      loadData();
    } else {
      showToast('Falha ao atualizar status.', 'error');
    }
  };

  const handleConfirmClose = async (
    ticketId: string,
    data: {
      resolution_details: string;
      parts_replaced: string;
      repair_time_minutes: number;
      preventive_notes: string;
      mechanic_name: string;
    }
  ) => {
    const now = new Date().toISOString();
    const res = await updateTicket(ticketId, {
      status: 'encerrado',
      closed_at: now,
      machine_stopped: false,
      resolution_details: data.resolution_details,
      parts_replaced: data.parts_replaced,
      repair_time_minutes: data.repair_time_minutes,
      preventive_notes: data.preventive_notes,
      mechanic_name: data.mechanic_name,
    });

    if (res.success) {
      showToast('Ordem de serviço encerrada com sucesso!', 'success');
      loadData();
    } else {
      showToast('Falha ao encerrar chamado.', 'error');
    }
  };

  // If not logged in, show AuthScreen
  if (!currentUser) {
    return (
      <>
        <AuthScreen
          onLogin={handleLogin}
          isSupabaseConfigured={isSupabaseConfigured}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          onConfigUpdated={() => loadData()}
        />
      </>
    );
  }

  const pendingCount = tickets.filter((t) => t.status === 'aberto').length;
  const stoppedMachinesCount = tickets.filter((t) => t.machine_stopped && t.status !== 'encerrado').length;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onNewTicket={() => setIsNewTicketOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseConfigured={isSupabaseConfigured}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        pendingCount={pendingCount}
        stoppedMachinesCount={stoppedMachinesCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Supabase connection banner (if not yet configured) */}
        {!isSupabaseConfigured && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Modo Armazenamento Local Ativo:</strong> Conecte ao seu banco Supabase para salvar chamados em nuvem.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="font-bold underline hover:text-amber-950 whitespace-nowrap ml-2 flex items-center gap-1"
            >
              <span>Conectar Supabase</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Supabase Error notice (if any) */}
        {supabaseMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{supabaseMessage}</span>
              <button
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="block mt-1 font-semibold underline"
              >
                Abrir configurações e verificar script SQL
              </button>
            </div>
          </div>
        )}

        {/* Role contextual greeting & actions banner */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
                Painel do {currentUser.role === 'operador' ? 'Operador de Produção' : 'Mecânico de Manutenção'}
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-xs font-mono text-neutral-600 font-medium">
                {currentUser.name}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              {currentUser.role === 'operador'
                ? 'Central de Abertura de Chamados e O.S.'
                : 'Fila de Atendimento e Encerramento Técnico'}
            </h1>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
              {currentUser.role === 'operador'
                ? 'Relate anormalidades, vazamentos, paradas de linha ou falhas mecânicas com informações descritivas completas.'
                : 'Consulte chamados pendentes, inicie o reparo nas máquinas e descreva o laudo técnico para encerramento.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentUser.role === 'operador' ? (
              <button
                type="button"
                onClick={() => setIsNewTicketOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Abrir Novo Chamado</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
                  {pendingCount} chamado(s) aguardando atendimento
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard KPIs */}
        <DashboardStats
          tickets={tickets}
          onSelectFilter={setActiveFilter}
          activeFilter={activeFilter}
        />

        {/* Ticket List & Real-time Filter System */}
        <TicketList
          tickets={tickets}
          user={currentUser}
          onSelectTicket={(ticket) => {
            setSelectedTicket(ticket);
            setIsDetailOpen(true);
          }}
          onStartAttendance={handleStartAttendance}
          onOpenCloseModal={(ticket) => {
            setSelectedTicket(ticket);
            setIsCloseTicketOpen(true);
          }}
          onNewTicket={() => setIsNewTicketOpen(true)}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">OrdemOS</span>
            <span>·</span>
            <span>Controle de Manutenção Fabril</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-500">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hover:text-neutral-900 transition-colors"
            >
              Configuração Supabase
            </button>
            <span>·</span>
            <span>Usuário: {currentUser.username} ({currentUser.role})</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onSubmit={handleCreateTicket}
        user={currentUser}
      />

      <CloseTicketModal
        isOpen={isCloseTicketOpen}
        ticket={selectedTicket}
        onClose={() => {
          setIsCloseTicketOpen(false);
          setSelectedTicket(null);
        }}
        onConfirmClose={handleConfirmClose}
        user={currentUser}
      />

      <TicketDetailModal
        isOpen={isDetailOpen}
        ticket={selectedTicket}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTicket(null);
        }}
        user={currentUser}
        onStartAttendance={handleStartAttendance}
        onOpenCloseModal={(t) => {
          setSelectedTicket(t);
          setIsCloseTicketOpen(true);
        }}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={() => loadData()}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2.5 ${
              toastMessage.type === 'success'
                ? 'bg-neutral-900 text-white border-neutral-800'
                : toastMessage.type === 'error'
                ? 'bg-red-700 text-white border-red-800'
                : 'bg-neutral-800 text-white border-neutral-700'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-300" />}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
