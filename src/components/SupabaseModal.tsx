import React, { useState, useEffect } from 'react';
import { X, Check, Copy, Database, ExternalLink, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Falha ao copiar script SQL', e);
    }
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const cleanConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
    };

    saveStoredSupabaseConfig(cleanConfig);
    onConfigUpdated();

    if (!cleanConfig.url || !cleanConfig.anonKey) {
      setTesting(false);
      setTestResult({
        success: false,
        message: 'Preencha a URL e a Chave Anon para conectar ao Supabase.',
      });
      return;
    }

    const res = await testSupabaseConnection(cleanConfig);
    setTesting(false);
    setTestResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-neutral-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Conectar ao Banco de Dados Supabase
              </h2>
              <p className="text-xs text-neutral-500">
                Sincronize chamados e ordens de serviço em nuvem em tempo real
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Current Status Feedback */}
          {testResult && (
            <div
              className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{testResult.message}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSaveAndTest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Project URL (Supabase)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzabcdefghijk.supabase.co"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 font-mono"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Encontrado em: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Project API Key (anon / public)
              </label>
              <input
                type="text"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 font-mono"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Encontrado em: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API Keys &gt; anon (public)
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-500">
                Se os campos ficarem vazios, o sistema opera em modo de armazenamento local.
              </span>
              <button
                type="submit"
                disabled={testing}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
              >
                {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {testing ? 'Testando Conexão...' : 'Salvar e Testar Conexão'}
              </button>
            </div>
          </form>

          {/* Step by step & SQL Script */}
          <div className="border-t border-neutral-200 pt-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Script SQL de Criação da Tabela `tickets`
              </h3>
              <button
                type="button"
                onClick={handleCopySQL}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md border border-neutral-300 hover:bg-neutral-100 text-neutral-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado para Área de Transferência!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Script SQL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-3">
              Abra o <strong>SQL Editor</strong> no painel do Supabase, cole o código abaixo e clique em <strong>Run</strong>. A tabela estará pronta para receber as informações.
            </p>
            <div className="bg-neutral-900 text-neutral-100 rounded-lg p-3.5 text-xs font-mono max-h-48 overflow-y-auto leading-relaxed border border-neutral-800">
              <pre className="whitespace-pre">{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 font-medium"
          >
            <span>Acessar Supabase Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
