import React, { useState } from 'react';
import { Camera, Save, ArrowLeft, Mail, User as UserIcon, Phone, CreditCard, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from '../types.ts';
import { api } from '../services/api.ts';

interface PerfilViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
}

export const PerfilView: React.FC<PerfilViewProps> = ({
  user,
  onUpdateUser,
  onBack,
}) => {
  const [nome, setNome] = useState(user.nome || 'Emerson');
  const [email, setEmail] = useState(user.email || 'emerson@email.com');
  const [telefone, setTelefone] = useState(user.telefone || '(15) 99999-9999');
  const [cpf, setCpf] = useState(user.cpf || '000.000.000-00');
  const [senha, setSenha] = useState('');
  const [avatar, setAvatar] = useState(user.avatar || '');

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Selecione uma imagem válida.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const res = await api.updateProfile({
        nome,
        email,
        telefone,
        cpf,
        senha: senha ? senha : undefined,
        avatar,
      });

      onUpdateUser(res.user);
      setSuccessMessage('Perfil atualizado com sucesso no banco de dados!');
      setSenha('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao atualizar dados do perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Cabecalho - Estilo Perfil.js */}
      <div className="text-center p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F2A900]/10 via-transparent to-transparent opacity-60" />

        {/* Avatar with edit button */}
        <div className="relative inline-block mx-auto mb-4">
          {avatar ? (
            <img
              src={avatar}
              alt={nome}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-[#F2A900] flex items-center justify-center text-neutral-950 font-black text-4xl border-4 border-white shadow-xl">
              {nome.charAt(0).toUpperCase()}
            </div>
          )}

          <label
            title="Alterar foto de perfil"
            className="absolute bottom-0 right-0 p-2.5 rounded-full bg-neutral-800 hover:bg-[#F2A900] text-white hover:text-neutral-950 border-2 border-white cursor-pointer shadow-lg transition-colors"
          >
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFile}
              className="hidden"
            />
          </label>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Atualize seus dados pessoais e credenciais de acesso
        </p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulario (Perfil.js) */}
      <form onSubmit={handleSalvarPerfil} className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        {/* Nome */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-300">Nome completo</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
            />
          </div>
        </div>

        {/* E-mail */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-300">E-mail</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
            />
          </div>
        </div>

        {/* Telefone e CPF em 2 colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">Telefone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(15) 99999-9999"
                className="w-full pl-10 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">CPF</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full pl-10 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Nova Senha */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-300">
            Nova senha <span className="text-neutral-500 font-normal">(deixe em branco para manter a atual)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite para alterar"
              className="w-full pl-10 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
            />
          </div>
        </div>

        {/* Avatar URL alternative */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-300">URL da foto de perfil</label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://exemplo.com/avatar.jpg"
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-2.5">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 rounded-xl bg-[#F2A900] hover:bg-[#e09b00] text-neutral-950 font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar alterações'}</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-neutral-700/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao início</span>
          </button>
        </div>
      </form>
    </div>
  );
};
