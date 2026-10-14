import React from 'react';
import { Image as ImageIcon, Trash2, Eye, Edit3 } from 'lucide-react';
import { ContentItem } from '../types.ts';
import { ImageFallback } from './ImageFallback.tsx';

interface ModCardProps {
  item: ContentItem;
  isAuthenticated: boolean;
  onView: (item: ContentItem) => void;
  onEditImage: (item: ContentItem) => void;
  onDeleteImage: (id: string) => Promise<void>;
  onEditContent?: (item: ContentItem) => void;
  onDeleteContent?: (id: string) => Promise<void>;
}

export const ModCard: React.FC<ModCardProps> = ({
  item,
  isAuthenticated,
  onView,
  onEditImage,
  onDeleteImage,
  onEditContent,
  onDeleteContent,
}) => {
  const handleDeleteImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Deseja realmente excluir a imagem de "${item.titulo}"?`)) {
      await onDeleteImage(item._id);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-xl">
      {/* Category Indicator Tag */}
      <div className="absolute top-3 left-3 z-10">
        <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider rounded-md bg-black/75 text-[#F2A900] backdrop-blur-md border border-neutral-800">
          {item.categoria}
        </span>
      </div>

      {/* Cover Image Container */}
      <div
        onClick={() => onView(item)}
        className="relative w-full aspect-[16/10] bg-neutral-950 overflow-hidden cursor-pointer"
      >
        <ImageFallback
          src={item.imagem}
          alt={item.titulo}
          title={item.titulo}
          category={item.categoria}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60" />
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-lg text-white group-hover:text-[#F2A900] transition-colors leading-snug">
                {item.titulo}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-neutral-400 mt-0.5">
                {item.subtitulo}
              </p>
            </div>
            {item.ano && (
              <span className="text-xs text-neutral-500 font-mono shrink-0">
                {item.ano}
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
            {item.descricao}
          </p>
        </div>

        {/* Card Actions */}
        <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* Public action: Always available */}
          <button
            type="button"
            onClick={() => onView(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 hover:text-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Ver</span>
          </button>

          {/* Conditional image management actions: ONLY FOR AUTHENTICATED USERS */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              {/* Editar Imagem */}
              <button
                type="button"
                onClick={() => onEditImage(item)}
                title="Editar imagem deste conteúdo"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-800/90 hover:bg-[#F2A900] hover:text-neutral-950 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar imagem</span>
              </button>

              {/* Excluir Imagem (if image exists) */}
              {item.imagem && (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  title="Excluir imagem deste conteúdo"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Excluir imagem</span>
                </button>
              )}

              {/* Quick edit content if handler provided */}
              {onEditContent && (
                <button
                  type="button"
                  onClick={() => onEditContent(item)}
                  title="Editar dados"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            // Unauthenticated info notice
            <span className="text-[11px] text-neutral-500 italic">
              Faça login para gerenciar
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
