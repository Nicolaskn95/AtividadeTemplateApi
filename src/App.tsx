/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { SideMenu } from './components/SideMenu.tsx';
import { ModCard } from './components/ModCard.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AdminArea } from './components/AdminArea.tsx';
import { PesquisaView } from './components/PesquisaView.tsx';
import { PerfilView } from './components/PerfilView.tsx';
import { ApiExplorer } from './components/ApiExplorer.tsx';
import { ContentDetailModal } from './components/ContentDetailModal.tsx';
import { ImageManagerModal } from './components/ImageManagerModal.tsx';
import { User, ContentItem } from './types.ts';
import { api, tokenStorage } from './services/api.ts';
import { Plus, RefreshCw, Shield, Sparkles, Database, Film, Layers } from 'lucide-react';

const TABS = ['TODAS', 'TELA 01', 'TELA 02', 'TELA 03', 'TELA 04', 'TELA 05'];

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('TODAS');
  const [currentView, setCurrentView] = useState<'home' | 'pesquisa' | 'admin' | 'perfil' | 'api'>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'cadastro'>('login');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);
  const [imageEditItem, setImageEditItem] = useState<ContentItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      // 1. Verify token & get user if available
      const token = tokenStorage.get();
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me);
        } catch {
          tokenStorage.clear();
          setUser(null);
        }
      }

      // 2. Fetch contents
      const res = await api.getContents();
      setContents(res.data);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Image operations
  const handleSaveImage = async (id: string, imageUrl: string) => {
    await api.updateContentImage(id, imageUrl);
    showNotification('Imagem alterada com sucesso no MongoDB!');
    await loadData();
  };

  const handleDeleteImage = async (id: string) => {
    await api.deleteContentImage(id);
    showNotification('Imagem excluída com sucesso.', 'info');
    await loadData();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    if (currentView === 'admin' || currentView === 'perfil') {
      setCurrentView('home');
    }
    showNotification('Sessão encerrada com sucesso.', 'info');
  };

  const handleOpenAuth = (mode: 'login' | 'cadastro' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  // Filter contents for home view
  const filteredContents = activeTab === 'TODAS'
    ? contents
    : contents.filter(c => c.categoria === activeTab);

  // Splash Screen on initial load (inspired by SplashScreen.js)
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-neutral-100">
        <div className="flex flex-col items-center space-y-6 animate-pulse">
          <div className="w-20 h-20 rounded-3xl bg-[#F2A900] flex items-center justify-center text-neutral-950 font-black text-4xl shadow-2xl shadow-amber-500/20">
            T
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white">Technologic</h1>
            <p className="text-xs text-[#F2A900] font-mono tracking-widest uppercase font-semibold">
              API REST Express.js & MongoDB
            </p>
          </div>
          <div className="w-32 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className="w-full h-full bg-[#F2A900] animate-[shimmer_1.5s_infinite]" />
          </div>
          <span className="text-xs text-neutral-500 font-mono">Carregando aplicação...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-[#F2A900] selection:text-neutral-950">
      {/* Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        user={user}
        onOpenAuth={handleOpenAuth}
        onOpenSideMenu={() => setSideMenuOpen(true)}
      />

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border ${
              notification.type === 'success'
                ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                : 'bg-neutral-900 border-[#F2A900]/40 text-[#F2A900]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {currentView === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero / Banner Area */}
            <section className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-900/60 to-neutral-950 border-b border-neutral-800/80">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#F2A900] text-neutral-950">
                    MONGODB COMPATÍVEL
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    Node.js + Express.js REST API
                  </span>
                </div>

                <div className="max-w-3xl space-y-2">
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    Plataforma Technologic
                  </h1>
                  <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                    Conteúdos cadastrados, consultados, alterados e excluídos dinamicamente com Express.js e MongoDB.
                    Usuários autenticados gerenciam imagens e registros; visitantes visualizam livremente.
                  </p>
                </div>

                {/* Quick Action CTA / User State */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {user ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCurrentView('admin')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F2A900] hover:bg-[#e09b00] text-neutral-950 font-bold text-xs tracking-wide transition-all shadow-md"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Acessar Área Administrativa</span>
                      </button>
                      <button
                        onClick={() => setCurrentView('api')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors border border-neutral-700/60"
                      >
                        <Database className="w-4 h-4 text-[#F2A900]" />
                        <span>Ver API REST & Status MongoDB</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenAuth('cadastro')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F2A900] hover:bg-[#e09b00] text-neutral-950 font-bold text-xs tracking-wide transition-all shadow-md"
                      >
                        <span>Criar Conta (Primeiro Acesso)</span>
                      </button>
                      <button
                        onClick={() => handleOpenAuth('login')}
                        className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors border border-neutral-700/60"
                      >
                        Já Possuo Cadastro
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Horizontal Tabs: TELA 01 to TELA 05 (matching AppBar.js) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 gap-4">
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                        activeTab === tab
                          ? 'bg-[#F2A900] text-neutral-950 shadow-md scale-105'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800/80'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono shrink-0">
                  <Film className="w-4 h-4 text-[#F2A900]" />
                  <span>{filteredContents.length} registro(s)</span>
                </div>
              </div>
            </section>

            {/* Series Cards Grid (ModCard from Cards.js) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredContents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredContents.map((item) => (
                    <ModCard
                      key={item._id}
                      item={item}
                      isAuthenticated={Boolean(user)}
                      onView={(c) => setDetailItem(c)}
                      onEditImage={(c) => setImageEditItem(c)}
                      onDeleteImage={handleDeleteImage}
                      onEditContent={user ? () => setCurrentView('admin') : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-3">
                  <Layers className="w-12 h-12 text-neutral-600 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Nenhum conteúdo nesta aba</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Não há registros cadastrados na categoria {activeTab}.
                  </p>
                  {user && (
                    <button
                      onClick={() => setCurrentView('admin')}
                      className="px-4 py-2 text-xs font-bold text-neutral-950 bg-[#F2A900] hover:bg-[#e09b00] rounded-lg transition-colors"
                    >
                      Cadastrar nesta tela
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {currentView === 'pesquisa' && (
          <PesquisaView
            isAuthenticated={Boolean(user)}
            onView={(c) => setDetailItem(c)}
            onEditImage={(c) => setImageEditItem(c)}
            onDeleteImage={handleDeleteImage}
          />
        )}

        {currentView === 'admin' && (
          user ? (
            <AdminArea
              user={user}
              contents={contents}
              onRefresh={loadData}
              onView={(c) => setDetailItem(c)}
              onEditImage={(c) => setImageEditItem(c)}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-4 shadow-2xl">
              <Shield className="w-12 h-12 text-[#F2A900] mx-auto" />
              <h2 className="text-xl font-bold text-white">Acesso Restrito</h2>
              <p className="text-xs text-neutral-400">
                Somente usuários autenticados poderão acessar a área administrativa.
              </p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F2A900] hover:bg-[#e09b00] text-neutral-950 font-bold text-xs uppercase tracking-wide transition-colors"
              >
                Efetuar Login
              </button>
            </div>
          )
        )}

        {currentView === 'perfil' && user && (
          <PerfilView
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
              showNotification('Perfil atualizado com sucesso!');
            }}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'api' && <ApiExplorer />}
      </main>

      {/* Side Menu Drawer (CabecalhoMenu.js) */}
      <SideMenu
        isOpen={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        user={user}
        onNavigate={(view) => setCurrentView(view)}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Auth Modal (Login & Cadastro) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          showNotification(`Bem-vindo, ${loggedUser.nome}!`);
          loadData();
        }}
      />

      {/* Detail Modal */}
      <ContentDetailModal
        item={detailItem}
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        isAuthenticated={Boolean(user)}
        onEditImage={(c) => setImageEditItem(c)}
      />

      {/* Image Manager Modal (Editar / Excluir Imagem) */}
      {imageEditItem && (
        <ImageManagerModal
          item={imageEditItem}
          isOpen={Boolean(imageEditItem)}
          onClose={() => setImageEditItem(null)}
          onSaveImage={handleSaveImage}
          onDeleteImage={handleDeleteImage}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Technologic</span>
            <span>·</span>
            <span>API REST Express.js & MongoDB</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-400">
            CRUD Dinâmico · Autenticação JWT · Gerenciamento de Imagens · Pesquisa em Tempo Real
          </div>
        </div>
      </footer>
    </div>
  );
}
