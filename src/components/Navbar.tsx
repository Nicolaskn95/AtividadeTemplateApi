import React from 'react';
import { Menu, Search, User as UserIcon, Shield, LogIn, ChevronDown } from 'lucide-react';
import { User } from '../types.ts';

interface NavbarProps {
  currentView: 'home' | 'pesquisa' | 'admin' | 'perfil' | 'api';
  onNavigate: (view: 'home' | 'pesquisa' | 'admin' | 'perfil' | 'api') => void;
  user: User | null;
  onOpenAuth: (mode?: 'login' | 'cadastro') => void;
  onOpenSideMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  onOpenSideMenu,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSideMenu}
            className="p-2 -ml-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A900] transition-colors"
            title="Abrir Menu"
            aria-label="Abrir menu lateral"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="flex items-baseline gap-2 text-left group"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-[#F2A900] transition-colors whitespace-nowrap shrink-0">
              Technologic
            </span>
            <span className="hidden sm:inline text-[11px] font-mono text-[#F2A900] tracking-wider uppercase font-semibold">
              Express & MongoDB
            </span>
          </button>
        </div>

        {/* Zone 2: Clean 4–5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors py-1 ${
              currentView === 'home' ? 'text-[#F2A900] border-b-2 border-[#F2A900] font-semibold' : ''
            }`}
          >
            Início
          </button>

          <button
            onClick={() => onNavigate('pesquisa')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors py-1 flex items-center gap-1.5 ${
              currentView === 'pesquisa' ? 'text-[#F2A900] border-b-2 border-[#F2A900] font-semibold' : ''
            }`}
          >
            <Search className="w-4 h-4" />
            Pesquisa
          </button>

          <button
            onClick={() => {
              if (user) {
                onNavigate('admin');
              } else {
                onOpenAuth('login');
              }
            }}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors py-1 flex items-center gap-1.5 ${
              currentView === 'admin' ? 'text-[#F2A900] border-b-2 border-[#F2A900] font-semibold' : ''
            }`}
          >
            <Shield className="w-4 h-4 text-[#F2A900]" />
            Área Administrativa
          </button>

          <button
            onClick={() => onNavigate('api')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors py-1 font-mono text-xs ${
              currentView === 'api' ? 'text-[#F2A900] border-b-2 border-[#F2A900] font-semibold' : ''
            }`}
          >
            API REST Console
          </button>
        </nav>

        {/* Zone 3: 1 primary action or User identification */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            /* User Identification in Header/Menu: Requirement 3 */
            <button
              onClick={onOpenSideMenu}
              className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 transition-colors"
              title="Perfil do usuário"
            >
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white tracking-tight leading-tight whitespace-nowrap">
                  {user.nome}
                </span>
                <span className="text-[10px] text-[#F2A900] font-mono leading-none">
                  Admin
                </span>
              </div>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.nome}
                  className="w-8 h-8 rounded-full object-cover border border-[#F2A900]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#F2A900] text-neutral-950 font-black text-xs flex items-center justify-center border border-white">
                  {user.nome.charAt(0).toUpperCase()}
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 mr-1" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Login
              </button>
              <button
                onClick={() => onOpenAuth('cadastro')}
                className="px-4 py-1.5 text-xs font-bold text-neutral-950 bg-[#F2A900] hover:bg-[#e09b00] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Cadastrar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
