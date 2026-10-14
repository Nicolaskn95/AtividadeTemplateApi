import React, { useState, useEffect } from 'react';
import { Database, Play, CheckCircle, AlertTriangle, RefreshCw, Send, ArrowRight, Code } from 'lucide-react';
import { DatabaseStatus } from '../types.ts';
import { api, tokenStorage } from '../services/api.ts';

export const ApiExplorer: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/contents');
  const [customParam, setCustomParam] = useState<string>('');
  const [payloadBody, setPayloadBody] = useState<string>('');
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const status = await api.getDbStatus();
      setDbStatus(status);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/contents',
      label: 'Listar Conteúdos (com filtro opcional)',
      description: 'Retorna a lista dinâmica de conteúdos armazenados no MongoDB.',
      auth: false,
      sampleBody: '',
    },
    {
      method: 'GET',
      path: '/api/search',
      label: 'Pesquisar Registros',
      description: 'Realiza pesquisa dinâmica por termo correspondente nos registros MongoDB.',
      auth: false,
      defaultParam: 'q=Breaking',
      sampleBody: '',
    },
    {
      method: 'GET',
      path: '/api/db/status',
      label: 'Status da Conexão MongoDB',
      description: 'Informa se o banco de dados MongoDB remoto ou embutido está ativo.',
      auth: false,
      sampleBody: '',
    },
    {
      method: 'POST',
      path: '/api/contents',
      label: 'Cadastrar Conteúdo (CRUD)',
      description: 'Cadastra novo registro dinâmico no MongoDB (requer autenticação).',
      auth: true,
      sampleBody: JSON.stringify(
        {
          titulo: 'Succession',
          subtitulo: '1x01 - Celebration',
          categoria: 'TELA 01',
          descricao: 'A família Roy é conhecida por controlar o maior conglomerado de mídia e entretenimento.',
          imagem: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
          ano: 2018,
          duracao: '60 min',
          classificacao: '18+',
        },
        null,
        2
      ),
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      label: 'Login de Usuário',
      description: 'Autentica credenciais e retorna o Token JWT de acesso administrativo.',
      auth: false,
      sampleBody: JSON.stringify(
        {
          email: 'emerson@email.com',
          senha: 'senha123',
        },
        null,
        2
      ),
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      label: 'Identificação do Usuário Logado',
      description: 'Retorna o perfil do usuário ativo utilizando o Bearer Token.',
      auth: true,
      sampleBody: '',
    },
  ];

  const handleSelect = (ep: typeof endpoints[0]) => {
    setSelectedEndpoint(`${ep.method} ${ep.path}`);
    setCustomParam(ep.defaultParam || '');
    setPayloadBody(ep.sampleBody || '');
    setResponseOutput(null);
    setStatusCode(null);
  };

  const handleExecute = async () => {
    const current = endpoints.find(e => `${e.method} ${e.path}` === selectedEndpoint);
    if (!current) return;

    setLoading(true);
    const start = performance.now();
    try {
      const url = current.path + (customParam ? (customParam.startsWith('?') ? customParam : `?${customParam}`) : '');
      const token = tokenStorage.get();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: current.method,
        headers,
        body: ['POST', 'PUT'].includes(current.method) && payloadBody ? payloadBody : undefined,
      });

      const elapsed = Math.round(performance.now() - start);
      setResponseTime(elapsed);
      setStatusCode(res.status);

      const json = await res.json().catch(() => ({}));
      setResponseOutput(json);
      fetchStatus();
    } catch (err: any) {
      setStatusCode(500);
      setResponseOutput({ error: err.message || 'Falha ao executar requisição.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSeed = async () => {
    if (window.confirm('Deseja restaurar os dados de exemplo padrão no MongoDB?')) {
      await api.resetSeed();
      fetchStatus();
      alert('Dados de exemplo restaurados no MongoDB com sucesso!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#F2A900]/20 text-[#F2A900]">
              <Code className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold text-[#F2A900] uppercase tracking-wider">
              Console Interativo da API REST Express.js & MongoDB
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Documentação e Testador de Endpoints
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Teste os endpoints da API REST em tempo real com dados persistidos no MongoDB.
          </p>
        </div>

        {/* Database Status Badge */}
        {dbStatus && (
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3 shrink-0">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="text-xs font-mono">
              <div className="text-white font-bold">{dbStatus.databaseType}</div>
              <div className="text-neutral-400 text-[11px]">
                Banco: <span className="text-[#F2A900]">{dbStatus.databaseName}</span> · Conteúdos: {dbStatus.collections.contents}
              </div>
            </div>
            <button
              onClick={handleResetSeed}
              title="Restaurar dados padrão de teste"
              className="ml-2 p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints List Column */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs uppercase font-mono font-bold text-neutral-400 tracking-wider">
            Endpoints Disponíveis
          </h3>

          <div className="space-y-2">
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint === `${ep.method} ${ep.path}`;
              return (
                <button
                  key={`${ep.method}-${ep.path}`}
                  onClick={() => handleSelect(ep)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-neutral-800/90 border-[#F2A900] shadow-md'
                      : 'bg-neutral-900 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          ep.method === 'GET'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="text-xs font-mono font-semibold text-white">
                        {ep.path}
                      </span>
                    </div>

                    {ep.auth && (
                      <span className="text-[10px] text-[#F2A900] font-mono bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                        Auth
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-medium text-neutral-300 mt-2">
                    {ep.label}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {ep.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Request / Response Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="text-[#F2A900] font-bold">Requisição:</span>
                <span className="text-white font-bold">{selectedEndpoint}</span>
              </div>
              <button
                onClick={handleExecute}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F2A900] hover:bg-[#e09b00] text-neutral-950 font-bold text-xs transition-colors shadow-md disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Executando...' : 'Testar Endpoint'}</span>
              </button>
            </div>

            {/* Query parameters input */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-neutral-400">
                Parâmetros de Consulta (Query Params)
              </label>
              <input
                type="text"
                value={customParam}
                onChange={(e) => setCustomParam(e.target.value)}
                placeholder="Ex: q=breaking&categoria=TELA 01"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900]"
              />
            </div>

            {/* Request Body input for POST / PUT */}
            {selectedEndpoint.startsWith('POST') || selectedEndpoint.startsWith('PUT') ? (
              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400">
                  Corpo da Requisição (JSON Payload)
                </label>
                <textarea
                  rows={6}
                  value={payloadBody}
                  onChange={(e) => setPayloadBody(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-amber-200/90 focus:outline-none focus:border-[#F2A900]"
                />
              </div>
            ) : null}

            {/* Response Section */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Resposta da API (Express + MongoDB):</span>
                {statusCode !== null && (
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        statusCode >= 200 && statusCode < 300
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      Status: {statusCode}
                    </span>
                    {responseTime && (
                      <span className="text-neutral-400">{responseTime}ms</span>
                    )}
                  </div>
                )}
              </div>

              <div className="relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 p-3 max-h-80 overflow-y-auto">
                {responseOutput ? (
                  <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(responseOutput, null, 2)}
                  </pre>
                ) : (
                  <div className="py-12 text-center text-xs text-neutral-500 font-mono">
                    Clique em "Testar Endpoint" para disparar a chamada à API REST.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
