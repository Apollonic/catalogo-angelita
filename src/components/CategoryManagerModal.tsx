import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, Tags, AlertCircle } from 'lucide-react';
import { Product } from '../types/product';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  products: Product[];
  onAddCategory: (name: string) => Promise<void>;
  onRenameCategory: (oldName: string, newName: string) => Promise<void>;
  onDeleteCategory: (name: string) => Promise<void>;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  products,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calcula a quantidade de produtos por categoria
  const getProductCount = (category: string) => {
    return products.filter((p) => p.categoria.toLowerCase() === category.toLowerCase()).length;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await onAddCategory(trimmed);
      setNewCatName('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao adicionar categoria.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (cat: string) => {
    setError('');
    setEditingCategory(cat);
    setEditValue(cat);
  };

  const handleRename = async (oldName: string) => {
    setError('');
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCategory(null);
      return;
    }

    setSubmitting(true);
    try {
      await onRenameCategory(oldName, trimmed);
      setEditingCategory(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao renomear categoria.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: string) => {
    setError('');
    const count = getProductCount(category);

    if (count > 0) {
      const confirm = window.confirm(
        `Atenção: Existem ${count} ${
          count === 1 ? 'produto vinculado' : 'produtos vinculados'
        } à categoria "${category}". Deseja realmente remover essa categoria?`
      );
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      await onDeleteCategory(category);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao remover categoria.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#eae4de] rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eae4de]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f5ede8] border border-[#eae4de] flex items-center justify-center text-[#a66e58]">
              <Tags className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#222222]">Gerenciar Categorias</h2>
              <p className="text-[11px] text-[#666666]">
                Adicione, renomeie ou remova categorias do catálogo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#888888] hover:text-[#222222] p-1 rounded-lg hover:bg-[#faf8f6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário para adicionar nova categoria */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nome da nova categoria (ex: Maquiagem)..."
              disabled={submitting}
              className="flex-1 px-3 py-2 bg-[#faf8f6] border border-[#eae4de] rounded-xl text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#a66e58] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={submitting || !newCatName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#a66e58] hover:bg-[#8f5c48] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </form>

          {/* Lista de Categorias Atuais */}
          <div className="pt-2">
            <span className="block text-xs font-semibold text-[#444444] mb-2">
              Categorias Ativas ({categories.length})
            </span>

            <div className="space-y-2">
              {categories.map((category) => {
                const count = getProductCount(category);
                const isEditing = editingCategory === category;

                return (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#eae4de] bg-[#faf8f6]/50 hover:bg-[#faf8f6] transition-colors"
                  >
                    {isEditing ? (
                      /* Modo de Edição Inline */
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(category);
                            if (e.key === 'Escape') setEditingCategory(null);
                          }}
                          className="flex-1 px-2.5 py-1 text-xs sm:text-sm bg-white border border-[#a66e58] rounded-lg text-[#222222] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRename(category)}
                          disabled={submitting}
                          className="p-1.5 bg-[#a66e58] hover:bg-[#8f5c48] text-white rounded-lg transition-colors cursor-pointer"
                          title="Salvar novo nome"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="p-1.5 text-[#666666] hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                          title="Cancelar edição"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Exibição Normal da Categoria */
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#222222]">
                            {category}
                          </span>
                          <span className="text-[11px] text-[#888888] bg-white px-2 py-0.5 rounded-full border border-[#eae4de]">
                            {count} {count === 1 ? 'item' : 'itens'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEditing(category)}
                            disabled={submitting}
                            className="p-1.5 text-[#666666] hover:text-[#a66e58] hover:bg-white rounded-lg transition-colors cursor-pointer"
                            title={`Renomear categoria "${category}"`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            disabled={submitting || categories.length <= 1}
                            className="p-1.5 text-[#888888] hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-30 transition-colors cursor-pointer"
                            title={
                              categories.length <= 1
                                ? 'Mínimo de 1 categoria necessária'
                                : `Remover categoria "${category}"`
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-3 border-t border-[#eae4de] bg-[#faf8f6] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#eae4de] hover:border-[#a66e58] text-xs font-semibold text-[#222222] rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
