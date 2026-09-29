export type UserRole = 'operador' | 'mecanico';

export type TicketPriority = 'baixa' | 'media' | 'alta' | 'critica';

export type TicketStatus = 'aberto' | 'em_atendimento' | 'encerrado' | 'cancelado';

export interface Ticket {
  id: string;
  code: string;
  title: string;
  equipment: string;
  sector: string;
  priority: TicketPriority;
  machine_stopped: boolean;
  description: string;
  status: TicketStatus;
  created_by_role: UserRole;
  created_by_name: string;
  created_at: string;
  started_at?: string | null;
  closed_at?: string | null;
  mechanic_name?: string | null;
  resolution_details?: string | null;
  parts_replaced?: string | null;
  repair_time_minutes?: number | null;
  preventive_notes?: string | null;
}

export interface AuthUser {
  username: string;
  name: string;
  role: UserRole;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
