import React, { useState } from 'react';
import { X, UserPlus, LogIn, Lock, Mail, User as UserIcon, Phone, CreditCard, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.ts';
import { User } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'cadastro';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'cadastro'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [showLoginSenha, setShowLoginSenha] = useState(false);

  // Cadastro fields (matching Cadastro.js & Perfil.js)
  const [cadNome, setCadNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadConfirmarSenha, setCadConfirmarSenha] = useState('');
  const [cadTelefone, setCadTelefone] = useState('');
  const [cadCpf, setCadCpf] = useState('');
  const [showCadSenha, setShowCadSenha] = useState(false);
  const [showCadConfirmacao, setShowCadConfirmacao] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginSenha) {
      setError('Preencha seu e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.login(loginEmail, loginSenha);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cadNome || !cadEmail || !cadSenha) {
      setError('Nome, e-mail e senha são obrigatórios.');
      return;
    }

    if (cadSenha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (cadSenha !== cadConfirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.register({
        nome: cadNome,
        email: cadEmail,
        senha: cadSenha,
        telefone: cadTelefone,
        cpf: cadCpf,
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoAccount = () => {
    setLoginEmail('emerson@email.com');
    setLoginSenha('senha123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-neutral-800/60 to-transparent border-b border-neutral-800/80">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F2A900]" />
            <span className="text-xs uppercase tracking-widest font-mono text-[#F2A900]">
              Technologic Auth
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Acesso ao Sistema' : 'Cadastro de Usuário'}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {mode === 'login'
              ? 'Entre com sua conta para acessar a Área Administrativa'
              : 'No primeiro acesso, realize seu cadastro na aplicação'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 mt-4 bg-neutral-950 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-[#F2A900] text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Já tenho cadastro (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('cadastro');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'cadastro'
                  ? 'bg-[#F2A900] text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Não tenho cadastro
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            /* ================= LOGIN FORM (Login.js) ================= */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ex: emerson@email.com"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginSenha ? 'text' : 'password'}
                    required
                    value={loginSenha}
                    onChange={(e) => setLoginSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-9 pr-10 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginSenha(!showLoginSenha)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
                  >
                    {showLoginSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Account Quick Fill */}
              <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <ShieldCheck className="w-4 h-4 text-[#F2A900]" />
                  <span>Conta pré-cadastrada: Emerson</span>
                </div>
                <button
                  type="button"
                  onClick={handleUseDemoAccount}
                  className="text-xs text-[#F2A900] hover:underline font-semibold"
                >
                  Preencher dados
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#F2A900] hover:bg-[#e09b00] text-neutral-950 font-bold text-sm tracking-wide transition-colors shadow-md disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'ENTRAR'}
              </button>
            </form>
          ) : (
            /* ================= CADASTRO FORM (Cadastro.js) ================= */
            <form onSubmit={handleCadastro} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Nome completo *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={cadNome}
                    onChange={(e) => setCadNome(e.target.value)}
                    placeholder="Digite seu nome"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">E-mail *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={cadEmail}
                    onChange={(e) => setCadEmail(e.target.value)}
                    placeholder="Digite seu e-mail"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Telefone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={cadTelefone}
                      onChange={(e) => setCadTelefone(e.target.value)}
                      placeholder="(15) 99999-9999"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">CPF</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={cadCpf}
                      onChange={(e) => setCadCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Senha * (mínimo 6 caracteres)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCadSenha ? 'text' : 'password'}
                    required
                    value={cadSenha}
                    onChange={(e) => setCadSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-9 pr-10 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCadSenha(!showCadSenha)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
                  >
                    {showCadSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Confirmar senha *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCadConfirmacao ? 'text' : 'password'}
                    required
                    value={cadConfirmarSenha}
                    onChange={(e) => setCadConfirmarSenha(e.target.value)}
                    placeholder="Repita sua senha"
                    className="w-full pl-9 pr-10 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCadConfirmacao(!showCadConfirmacao)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
                  >
                    {showCadConfirmacao ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#F2A900] hover:bg-[#e09b00] text-neutral-950 font-bold text-sm tracking-wide transition-colors shadow-md disabled:opacity-50 mt-2"
              >
                {loading ? 'Cadastrando...' : 'CADASTRAR'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
