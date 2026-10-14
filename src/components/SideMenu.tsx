import React, { useState } from 'react';
import { X, User as UserIcon, Bell, Search, Settings, LogOut, Shield, Code, ChevronRight } from 'lucide-react';
import { User } from '../types.ts';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onNavigate: (view: 'home' | 'pesquisa' | 'admin' | 'perfil' | 'api') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  user,
  onNavigate,
  onOpenAuth,
  onLogout,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSelectView = (view: 'home' | 'pesquisa' | 'admin' | 'perfil' | 'api') => {
    onNavigate(view);
    onClose();
  };

  const handleConfirmLogout = () => {
    setShowExitConfirm(false);
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-neutral-900 border-r border-neutral-800 shadow-2xl flex flex-col justify-between text-neutral-100 z-10 animate-slideRight">
        {/* Top Header - Inspired directly by CabecalhoMenu.js */}
        <div>
          <div className="p-6 bg-gradient-to-b from-neutral-800 to-neutral-900 border-b border-neutral-800 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                {/* Avatar with amber accent */}
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nome}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#F2A900] flex items-center justify-center text-neutral-950 font-bold text-2xl shadow-md border-2 border-white">
                      {user.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-neutral-900" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white truncate">
                    {user.nome}
                  </h3>
                  <p className="text-xs text-neutral-300 truncate">
                    {user.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F2A900]/20 text-[#F2A900] border border-[#F2A900]/30 uppercase">
                    Autenticado
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400">
                  <UserIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Visitante</h3>
                  <p className="text-xs text-neutral-400">Faça login para gerenciar conteúdos</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-[#F2A900] hover:bg-[#e09b00] text-neutral-950 transition-colors shadow-sm"
                >
                  ACESSAR / CADASTRAR
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => handleSelectView('home')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#F2A900]" />
                <span>Início (Séries & Cards)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>

            <button
              onClick={() => handleSelectView('pesquisa')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-neutral-400" />
                <span>Pesquisa Dinâmica</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>

            {/* Restricted area link */}
            <button
              onClick={() => {
                if (user) {
                  handleSelectView('admin');
                } else {
                  onClose();
                  onOpenAuth();
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#F2A900]" />
                <span>Área Administrativa</span>
              </div>
              {!user && (
                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">
                  Requer login
                </span>
              )}
            </button>

            {user && (
              <button
                onClick={() => handleSelectView('perfil')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-neutral-400" />
                  <span>Meu perfil</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            )}

            <button
              onClick={() => handleSelectView('api')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-[#F2A900]" />
                <span>API REST & MongoDB Console</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>
          </nav>
        </div>

        {/* Bottom Area - Logout button */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/40">
          {user ? (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                <span>Sair do aplicativo</span>
              </div>
            </button>
          ) : (
            <div className="text-center text-xs text-neutral-500 font-mono">
              Technologic v1.0.0 · Express & MongoDB
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog (Matching Dialog from CabecalhoMenu.js) */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 space-y-4">
            <h4 className="font-bold text-lg text-white">Confirmar saída</h4>
            <p className="text-sm text-neutral-300">
              Deseja realmente sair do aplicativo? Sua sessão administrativa será encerrada.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
