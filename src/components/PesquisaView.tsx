import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { ContentItem } from '../types.ts';
import { api } from '../services/api.ts';
import { ModCard } from './ModCard.tsx';

interface PesquisaViewProps {
  isAuthenticated: boolean;
  onView: (item: ContentItem) => void;
  onEditImage: (item: ContentItem) => void;
  onDeleteImage: (id: string) => Promise<void>;
  onEditContent?: (item: ContentItem) => void;
  onDeleteContent?: (id: string) => Promise<void>;
}

const CATEGORIAS = ['TODAS', 'TELA 01', 'TELA 02', 'TELA 03', 'TELA 04', 'TELA 05'];

export const PesquisaView: React.FC<PesquisaViewProps> = ({
  isAuthenticated,
  onView,
  onEditImage,
  onDeleteImage,
  onEditContent,
  onDeleteContent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('TODAS');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Trigger search on debounce or category change
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(searchTerm, selectedCategoria);
        if (!isCancelled) {
          setResults(res.data);
          setHasSearched(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedCategoria]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header and Search Box - inspired by Pesquisa.js */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-[#F2A900]">
          <Search className="w-3.5 h-3.5" />
          <span>Pesquisa Dinâmica na API & MongoDB</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Buscar Séries e Conteúdos
        </h1>
        <p className="text-sm text-neutral-400">
          Informe um termo para consultar dinamicamente os registros armazenados no MongoDB.
        </p>

        {/* Search Bar Input */}
        <div className="relative mt-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#F2A900]" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o título, episódio, tecnologia ou sinopse..."
            autoFocus
            className="w-full pl-12 pr-12 py-3.5 bg-neutral-900 border-2 border-neutral-800 rounded-2xl text-base text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F2A900] shadow-lg transition-all"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategoria === cat
                  ? 'bg-[#F2A900] text-neutral-950 shadow-md'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Resultados da Consulta</span>
            <span>·</span>
            <span className="font-mono">{results.length} registro(s) encontrado(s)</span>
          </div>
          {searchTerm && (
            <span className="text-neutral-400">
              Termo ativo: <strong className="text-[#F2A900]">"{searchTerm}"</strong>
            </span>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
              <ModCard
                key={item._id}
                item={item}
                isAuthenticated={isAuthenticated}
                onView={onView}
                onEditImage={onEditImage}
                onDeleteImage={onDeleteImage}
                onEditContent={onEditContent}
                onDeleteContent={onDeleteContent}
              />
            ))}
          </div>
        ) : hasSearched && !loading ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-3">
            <AlertCircle className="w-10 h-10 text-neutral-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Nenhum registro correspondente</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Não encontramos resultados para o termo informado na categoria selecionada. Experimente buscar por "Breaking Bad", "Robot", "Severance" ou "Pilot".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategoria('TODAS');
              }}
              className="mt-2 px-4 py-2 text-xs font-semibold text-[#F2A900] bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
