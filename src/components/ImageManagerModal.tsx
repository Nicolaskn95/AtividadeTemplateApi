import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Trash2, Check } from 'lucide-react';
import { ContentItem } from '../types.ts';
import { ImageFallback } from './ImageFallback.tsx';

interface ImageManagerModalProps {
  item: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onSaveImage: (id: string, imageUrl: string) => Promise<void>;
  onDeleteImage: (id: string) => Promise<void>;
}

export const ImageManagerModal: React.FC<ImageManagerModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveImage,
  onDeleteImage,
}) => {
  const [imageUrl, setImageUrl] = useState(item.imagem || '');
  const [previewUrl, setPreviewUrl] = useState(item.imagem || '');
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);
      setPreviewUrl(base64);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (val: string) => {
    setImageUrl(val);
    setPreviewUrl(val);
    setError(null);
  };

  const handleSave = async () => {
    if (!imageUrl.trim()) {
      setError('Por favor informe a URL da imagem ou envie um arquivo.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSaveImage(item._id, imageUrl.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar imagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir a imagem deste conteúdo?')) {
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onDeleteImage(item._id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir imagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-[#F2A900]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Gerenciar Imagem</h3>
              <p className="text-xs text-neutral-400 truncate max-w-xs">{item.titulo} · {item.subtitulo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          {/* Preview Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">Pré-visualização</label>
            <div className="w-full h-44 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center">
              <ImageFallback
                src={previewUrl}
                alt={item.titulo}
                title={item.titulo}
                category={item.categoria}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Tabs for URL vs Upload */}
          <div className="flex p-1 bg-neutral-950 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'url' ? 'bg-[#F2A900] text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              URL da Imagem
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'upload' ? 'bg-[#F2A900] text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload de Arquivo
            </button>
          </div>

          {/* URL Input */}
          {activeTab === 'url' ? (
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400">Endereço (URL) da imagem</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900] transition-colors"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400">Selecione uma imagem do seu dispositivo</label>
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-neutral-800 hover:border-neutral-600 rounded-xl cursor-pointer bg-neutral-950/60 transition-colors">
                <Upload className="w-6 h-6 text-neutral-400 mb-1" />
                <span className="text-xs text-neutral-400">Clique para selecionar imagem (PNG, JPG, WebP)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950/40">
          {item.imagem ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Imagem
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-[#F2A900] hover:bg-[#e09b00] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Imagem'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
