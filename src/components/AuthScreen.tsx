import React, { useState } from 'react';
import { AuthUser } from '../types/ticket';
import { Wrench, HardHat, Lock, User, ArrowRight, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: AuthUser) => void;
  isSupabaseConfigured: boolean;
  onOpenSupabaseModal: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  isSupabaseConfigured,
  onOpenSupabaseModal,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === 'operador' && cleanPass === 'operador123') {
      onLogin({
        username: 'operador',
        name: 'Operador Fábrica',
        role: 'operador',
      });
      return;
    }

    if (cleanUser === 'mecanico' && cleanPass === 'mecanico123') {
      onLogin({
        username: 'mecanico',
        name: 'Mecânico de Manutenção',
        role: 'mecanico',
      });
      return;
    }

    setErrorMessage('Usuário ou senha incorretos. Utilize as credenciais cadastradas abaixo.');
  };

  const handleQuickLogin = (role: 'operador' | 'mecanico') => {
    if (role === 'operador') {
      onLogin({
        username: 'operador',
        name: 'Operador Fábrica',
        role: 'operador',
      });
    } else {
      onLogin({
        username: 'mecanico',
        name: 'Mecânico de Manutenção',
        role: 'mecanico',
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-neutral-900 text-amber-400 mb-4 shadow-sm">
          <Wrench className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          OrdemOS Industrial
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Sistema de Abertura e Encerramento de Chamados de Manutenção
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-sm border border-neutral-200 rounded-xl sm:px-10">
          {/* Quick Access Tiles */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Acesso Rápido com Credenciais Predefinidas
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('operador')}
                className="group relative flex flex-col p-4 text-left border border-neutral-200 hover:border-amber-500 rounded-lg transition-all bg-neutral-50 hover:bg-amber-50/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                    <HardHat className="w-3.5 h-3.5" />
                    Operador
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-600 transition-colors" />
                </div>
                <div className="text-sm font-semibold text-neutral-900">Entrar como Operador</div>
                <div className="text-xs text-neutral-500 mt-1">Abre chamados e descreve falhas em máquinas</div>
                <div className="mt-3 pt-2 border-t border-neutral-200/80 text-[11px] font-mono text-neutral-500 flex items-center justify-between">
                  <span>login: <strong className="text-neutral-700">operador</strong></span>
                  <span>senha: <strong className="text-neutral-700">operador123</strong></span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('mecanico')}
                className="group relative flex flex-col p-4 text-left border border-neutral-200 hover:border-blue-500 rounded-lg transition-all bg-neutral-50 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                    <Wrench className="w-3.5 h-3.5" />
                    Mecânico
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-sm font-semibold text-neutral-900">Entrar como Mecânico</div>
                <div className="text-xs text-neutral-500 mt-1">Atende falhas, relata reparos e encerra O.S.</div>
                <div className="mt-3 pt-2 border-t border-neutral-200/80 text-[11px] font-mono text-neutral-500 flex items-center justify-between">
                  <span>login: <strong className="text-neutral-700">mecanico</strong></span>
                  <span>senha: <strong className="text-neutral-700">mecanico123</strong></span>
                </div>
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-neutral-500 font-medium">Ou faça login manual</span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <span className="font-semibold">Erro:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Usuário
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="operador ou mecanico"
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Senha
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 bg-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition-colors shadow-xs"
            >
              Autenticar no Sistema
            </button>
          </form>

          {/* Supabase status footer in auth */}
          <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-neutral-500" />
              <span>Armazenamento:</span>
              {isSupabaseConfigured ? (
                <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Supabase Ativo
                </span>
              ) : (
                <span className="text-neutral-600">Local / Pronto para Supabase</span>
              )}
            </div>
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className="text-amber-700 hover:text-amber-800 font-medium underline underline-offset-2"
            >
              Configurar Supabase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
