import React from 'react';
import { X, Calendar, Clock, ShieldAlert, Tag, Image as ImageIcon } from 'lucide-react';
import { ContentItem } from '../types.ts';
import { ImageFallback } from './ImageFallback.tsx';

interface ContentDetailModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onEditImage?: (item: ContentItem) => void;
}

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  isAuthenticated,
  onEditImage,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 max-h-[90vh]">
        {/* Cover with Scrim */}
        <div className="relative w-full h-64 sm:h-80 bg-neutral-950 overflow-hidden">
          <ImageFallback
            src={item.imagem}
            alt={item.titulo}
            title={item.titulo}
            category={item.categoria}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-20 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Badges */}
          <div className="absolute bottom-4 left-6 right-6 z-10 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F2A900] text-neutral-950 mb-2">
                {item.categoria}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {item.titulo}
              </h2>
              <p className="text-base text-neutral-300 font-medium">
                {item.subtitulo}
              </p>
            </div>

            {isAuthenticated && onEditImage && (
              <button
                onClick={() => {
                  onClose();
                  onEditImage(item);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-md transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#F2A900]" />
                Editar Imagem
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 border-b border-neutral-800 pb-4 font-mono">
            {item.ano && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#F2A900]" />
                <span>Ano: {item.ano}</span>
              </div>
            )}
            {item.duracao && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#F2A900]" />
                <span>Duração: {item.duracao}</span>
              </div>
            )}
            {item.classificacao && (
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#F2A900]" />
                <span>Classificação: {item.classificacao}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#F2A900]" />
              <span>MongoDB ID: {item._id}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-400">Sinopse do Conteúdo</h4>
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-sans">
              {item.descricao}
            </p>
          </div>

          {/* MongoDB Document Inspection */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-neutral-300">Documento MongoDB (JSON Real)</span>
              <span>Coleção: contents</span>
            </div>
            <pre className="text-xs font-mono text-amber-200/90 overflow-x-auto p-2 bg-black/40 rounded-lg">
              {JSON.stringify(
                {
                  _id: item._id,
                  titulo: item.titulo,
                  subtitulo: item.subtitulo,
                  categoria: item.categoria,
                  imagem: item.imagem ? (item.imagem.length > 60 ? item.imagem.substring(0, 50) + '...' : item.imagem) : '',
                  ano: item.ano,
                  temporada: item.temporada,
                  episodio: item.episodio,
                  createdAt: item.createdAt,
                  updatedAt: item.updatedAt,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-800 bg-neutral-950/40">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-[#F2A900] hover:bg-[#e09b00] rounded-lg transition-colors shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
