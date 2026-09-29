import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Ticket, SupabaseConfig } from '../types/ticket';
import { INITIAL_TICKETS } from '../data/initialTickets';

const LOCAL_STORAGE_TICKETS_KEY = 'ordemos_tickets_data';
const LOCAL_STORAGE_SUPABASE_CONFIG_KEY = 'ordemos_supabase_config';

export const SUPABASE_SQL_SCHEMA = `-- Copie e cole este script no SQL Editor do seu projeto Supabase:

-- 1. Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criação da Tabela de Chamados
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  equipment TEXT NOT NULL,
  sector TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'media',
  machine_stopped BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto',
  created_by_role TEXT NOT NULL DEFAULT 'operador',
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  mechanic_name TEXT,
  resolution_details TEXT,
  parts_replaced TEXT,
  repair_time_minutes INTEGER,
  preventive_notes TEXT
);

-- 3. Índices de performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_machine_stopped ON public.tickets (machine_stopped);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_equipment ON public.tickets (equipment);

-- 4. Habilitar Row Level Security (RLS) na Tabela de Chamados
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso (RLS) para gravação e leitura de chamados
DROP POLICY IF EXISTS "Permitir leitura de chamados" ON public.tickets;
CREATE POLICY "Permitir leitura de chamados"
  ON public.tickets
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Permitir inclusão de chamados" ON public.tickets;
CREATE POLICY "Permitir inclusão de chamados"
  ON public.tickets
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de chamados" ON public.tickets;
CREATE POLICY "Permitir atualização de chamados"
  ON public.tickets
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir deleção de chamados" ON public.tickets;
CREATE POLICY "Permitir deleção de chamados"
  ON public.tickets
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 6. Criação do Bucket de Armazenamento para anexos/fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Políticas de Armazenamento (Storage RLS)
DROP POLICY IF EXISTS "Permitir download publico de anexos" ON storage.objects;
CREATE POLICY "Permitir download publico de anexos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'ticket-attachments');

DROP POLICY IF EXISTS "Permitir upload de anexos de chamados" ON storage.objects;
CREATE POLICY "Permitir upload de anexos de chamados"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'ticket-attachments');
`;

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey && !envUrl.includes('your-project-id')) {
    return { url: envUrl, anonKey: envKey };
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler configuração Supabase do localStorage', err);
  }

  return { url: '', anonKey: '' };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(LOCAL_STORAGE_SUPABASE_CONFIG_KEY, JSON.stringify(config));
}

let cachedClient: SupabaseClient | null = null;
let currentConfigString = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const configKey = `${config.url}::${config.anonKey}`;
  if (cachedClient && currentConfigString === configKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
      },
    });
    currentConfigString = configKey;
    return cachedClient;
  } catch (err) {
    console.error('Falha ao inicializar cliente Supabase:', err);
    return null;
  }
}

// Local Storage Handlers
export function getLocalTickets(): Ticket[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_TICKETS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao recuperar tickets locais', e);
  }
  // Initialize with sample data if empty
  localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(INITIAL_TICKETS));
  return INITIAL_TICKETS;
}

export function saveLocalTickets(tickets: Ticket[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Erro ao salvar tickets no localStorage', e);
  }
}

// Unified Ticket Service (Supabase + Local fallback)
export async function fetchTickets(): Promise<{ tickets: Ticket[]; isUsingSupabase: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return {
      tickets: getLocalTickets(),
      isUsingSupabase: false,
    };
  }

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao consultar Supabase, usando armazenamento local:', error.message);
      return {
        tickets: getLocalTickets(),
        isUsingSupabase: false,
        error: `Supabase: ${error.message}. Verifique se a tabela "tickets" foi criada no SQL Editor.`,
      };
    }

    if (data && data.length > 0) {
      const formatted: Ticket[] = data.map((row: any) => ({
        id: row.id,
        code: row.code || `OS-${row.id.slice(0, 6)}`,
        title: row.title,
        equipment: row.equipment,
        sector: row.sector,
        priority: row.priority,
        machine_stopped: Boolean(row.machine_stopped),
        description: row.description,
        status: row.status,
        created_by_role: row.created_by_role,
        created_by_name: row.created_by_name,
        created_at: row.created_at,
        started_at: row.started_at,
        closed_at: row.closed_at,
        mechanic_name: row.mechanic_name,
        resolution_details: row.resolution_details,
        parts_replaced: row.parts_replaced,
        repair_time_minutes: row.repair_time_minutes,
        preventive_notes: row.preventive_notes,
      }));
      // Keep local cache fresh as well
      saveLocalTickets(formatted);
      return { tickets: formatted, isUsingSupabase: true };
    } else {
      // If Supabase table is completely empty, optionally seed or return empty list
      return { tickets: [], isUsingSupabase: true };
    }
  } catch (err: any) {
    return {
      tickets: getLocalTickets(),
      isUsingSupabase: false,
      error: `Erro de conexão: ${err.message || err}`,
    };
  }
}

export async function createTicket(ticket: Omit<Ticket, 'id'>): Promise<{ success: boolean; ticket: Ticket; error?: string }> {
  const supabase = getSupabaseClient();
  const id = crypto.randomUUID();
  const newTicket: Ticket = {
    ...ticket,
    id,
  };

  // Always update local cache first
  const currentLocal = getLocalTickets();
  const updatedLocal = [newTicket, ...currentLocal];
  saveLocalTickets(updatedLocal);

  if (!supabase) {
    return { success: true, ticket: newTicket };
  }

  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert([
        {
          id: newTicket.id,
          code: newTicket.code,
          title: newTicket.title,
          equipment: newTicket.equipment,
          sector: newTicket.sector,
          priority: newTicket.priority,
          machine_stopped: newTicket.machine_stopped,
          description: newTicket.description,
          status: newTicket.status,
          created_by_role: newTicket.created_by_role,
          created_by_name: newTicket.created_by_name,
          created_at: newTicket.created_at,
          started_at: newTicket.started_at,
          closed_at: newTicket.closed_at,
          mechanic_name: newTicket.mechanic_name,
          resolution_details: newTicket.resolution_details,
          parts_replaced: newTicket.parts_replaced,
          repair_time_minutes: newTicket.repair_time_minutes,
          preventive_notes: newTicket.preventive_notes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('Falha ao salvar no Supabase:', error.message);
      return { success: true, ticket: newTicket, error: `Salvo localmente. Erro no Supabase: ${error.message}` };
    }

    return { success: true, ticket: newTicket };
  } catch (err: any) {
    return { success: true, ticket: newTicket, error: `Salvo localmente. Conexão falhou: ${err.message || err}` };
  }
}

export async function updateTicket(id: string, updates: Partial<Ticket>): Promise<{ success: boolean; error?: string }> {
  // Update local storage
  const currentLocal = getLocalTickets();
  const index = currentLocal.findIndex(t => t.id === id);
  if (index !== -1) {
    currentLocal[index] = { ...currentLocal[index], ...updates };
    saveLocalTickets(currentLocal);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.warn('Erro ao atualizar chamado no Supabase:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Falha ao comunicar com Supabase' };
  }
}

export async function testSupabaseConnection(config: SupabaseConfig): Promise<{ success: boolean; message: string }> {
  if (!config.url || !config.anonKey) {
    return { success: false, message: 'Informe a URL e a Anon Key do projeto Supabase.' };
  }

  try {
    const testClient = createClient(config.url, config.anonKey);
    const { data, error } = await testClient.from('tickets').select('id').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "public.tickets" does not exist') || error.message.includes('tickets')) {
        return {
          success: false,
          message: 'Conexão autenticada com sucesso! Porém a tabela "tickets" ainda não foi criada. Execute o script SQL no seu painel Supabase.',
        };
      }
      return { success: false, message: `Erro retornado pelo Supabase: ${error.message}` };
    }

    return { success: true, message: 'Conectado com sucesso ao Supabase! Tabela "tickets" identificada e pronta.' };
  } catch (err: any) {
    return { success: false, message: `Falha de rede ou URL inválida: ${err.message || err}` };
  }
}
