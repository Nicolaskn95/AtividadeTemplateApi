import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Shield, Database, Check, X, RefreshCw, Upload, Eye } from 'lucide-react';
import { ContentItem, User } from '../types.ts';
import { api } from '../services/api.ts';
import { ImageFallback } from './ImageFallback.tsx';

interface AdminAreaProps {
  user: User;
  contents: ContentItem[];
  onRefresh: () => Promise<void>;
  onView: (item: ContentItem) => void;
  onEditImage: (item: ContentItem) => void;
}

const CATEGORIAS = ['TELA 01', 'TELA 02', 'TELA 03', 'TELA 04', 'TELA 05'];

export const AdminArea: React.FC<AdminAreaProps> = ({
  user,
  contents,
  onRefresh,
  onView,
  onEditImage,
}) => {
  const [filterCat, setFilterCat] = useState<string>('TODAS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [categoria, setCategoria] = useState('TELA 01');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState('');
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [duracao, setDuracao] = useState('50 min');
  const [classificacao, setClassificacao] = useState('16+');

  const openCreateModal = () => {
    setEditingItem(null);
    setTitulo('');
    setSubtitulo('1x01 - Pilot');
    setCategoria('TELA 01');
    setDescricao('');
    setImagem('');
    setAno(new Date().getFullYear());
    setDuracao('50 min');
    setClassificacao('16+');
    setFeedbackMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setTitulo(item.titulo);
    setSubtitulo(item.subtitulo);
    setCategoria(item.categoria);
    setDescricao(item.descricao);
    setImagem(item.imagem);
    setAno(item.ano || 2024);
    setDuracao(item.duracao || '50 min');
    setClassificacao(item.classificacao || '16+');
    setFeedbackMessage(null);
    setIsModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagem(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !subtitulo.trim()) {
      alert('Preencha título e subtítulo.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await api.updateContent(editingItem._id, {
          titulo,
          subtitulo,
          categoria,
          descricao,
          imagem,
          ano: Number(ano),
          duracao,
          classificacao,
        });
        setFeedbackMessage({ type: 'success', text: `"${titulo}" atualizado com sucesso no MongoDB!` });
      } else {
        await api.createContent({
          titulo,
          subtitulo,
          categoria,
          descricao,
          imagem,
          ano: Number(ano),
          duracao,
          classificacao,
        });
        setFeedbackMessage({ type: 'success', text: `Novo conteúdo "${titulo}" cadastrado dinamicamente!` });
      }

      await onRefresh();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar conteúdo no banco de dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: ContentItem) => {
    if (!window.confirm(`Tem certeza que deseja excluir o conteúdo "${item.titulo}" do banco de dados MongoDB?`)) {
      return;
    }

    try {
      await api.deleteContent(item._id);
      setFeedbackMessage({ type: 'success', text: `"${item.titulo}" excluído com sucesso.` });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir conteúdo.');
    }
  };

  const filteredContents = filterCat === 'TODAS'
    ? contents
    : contents.filter(c => c.categoria === filterCat);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#F2A900]/20 text-[#F2A900]">
              <Shield className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold text-[#F2A900] uppercase tracking-wider">
              Painel de Controle Administrativo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Gerenciamento Dinâmico de Conteúdos
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Cadastre, consulte, altere e exclua dinamicamente registros sincronizados em tempo real no MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onRefresh()}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F2A900] hover:bg-[#e09b00] text-neutral-950 font-bold text-sm tracking-wide transition-all shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Cadastrar Conteúdo</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 gap-4 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setFilterCat('TODAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterCat === 'TODAS'
                ? 'bg-[#F2A900] text-neutral-950'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Todas as Telas ({contents.length})
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterCat === cat
                  ? 'bg-[#F2A900] text-neutral-950'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {cat} ({contents.filter(c => c.categoria === cat).length})
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <Database className="w-4 h-4 text-[#F2A900]" />
          <span>MongoDB: {filteredContents.length} registro(s)</span>
        </div>
      </div>

      {/* Content Table / Cards */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-200">
            <thead className="bg-neutral-950/80 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800 font-mono">
              <tr>
                <th className="py-3 px-4">Capa</th>
                <th className="py-3 px-4">Título / Episódio</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Ano / Duração</th>
                <th className="py-3 px-4">Gerenciar Imagem</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {filteredContents.map((item) => (
                <tr key={item._id} className="hover:bg-neutral-800/40 transition-colors group">
                  {/* Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="w-16 h-11 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                      <ImageFallback
                        src={item.imagem}
                        alt={item.titulo}
                        title={item.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>

                  {/* Title & Subtitle */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-bold text-white group-hover:text-[#F2A900] transition-colors truncate">
                      {item.titulo}
                    </div>
                    <div className="text-xs text-neutral-400 truncate">
                      {item.subtitulo}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-neutral-800 text-[#F2A900] border border-neutral-700/60 font-mono">
                      {item.categoria}
                    </span>
                  </td>

                  {/* Metadata */}
                  <td className="py-3 px-4 text-xs text-neutral-400 font-mono">
                    {item.ano || '—'} · {item.duracao || '—'}
                  </td>

                  {/* Image Management Direct Buttons */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEditImage(item)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-[#F2A900] hover:text-neutral-950 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Editar imagem</span>
                      </button>
                      {item.imagem && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Excluir imagem de "${item.titulo}"?`)) {
                              await api.deleteContentImage(item._id);
                              await onRefresh();
                            }
                          }}
                          className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Excluir imagem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onView(item)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-[#F2A900] hover:bg-neutral-800 transition-colors"
                        title="Editar conteúdo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Excluir registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create / Edit Content */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#F2A900]/20 text-[#F2A900]">
                  <Database className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-lg text-white">
                  {editingItem ? 'Editar Conteúdo (MongoDB)' : 'Cadastrar Novo Conteúdo'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Título da Série / Conteúdo *</label>
                  <input
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Breaking Bad"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Subtítulo / Episódio *</label>
                  <input
                    type="text"
                    required
                    value={subtitulo}
                    onChange={(e) => setSubtitulo(e.target.value)}
                    placeholder="Ex: 1x01 - Pilot"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Categoria (Aba / Tela) *</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-[#F2A900]"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Ano de Lançamento</label>
                  <input
                    type="number"
                    value={ano}
                    onChange={(e) => setAno(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-[#F2A900]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Duração</label>
                  <input
                    type="text"
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                    placeholder="Ex: 48 min"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-[#F2A900]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Descrição / Sinopse</label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Escreva a sinopse do episódio ou informações do conteúdo..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900]"
                />
              </div>

              {/* Image Input and Upload */}
              <div className="space-y-2 border-t border-neutral-800 pt-3">
                <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                  <span>Imagem de Capa (URL ou Arquivo)</span>
                  {imagem && (
                    <button
                      type="button"
                      onClick={() => setImagem('')}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remover imagem
                    </button>
                  )}
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imagem}
                    onChange={(e) => setImagem(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#F2A900]"
                  />
                  <label className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview */}
                {imagem && (
                  <div className="w-full h-32 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
                    <ImageFallback
                      src={imagem}
                      alt="Prévia da capa"
                      title={titulo || 'Prévia'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-neutral-950 bg-[#F2A900] hover:bg-[#e09b00] rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Cadastrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
