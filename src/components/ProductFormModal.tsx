import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  AlertCircle,
  ImagePlus,
  Trash2,
  Camera,
  Link as LinkIcon,
  RefreshCw,
} from 'lucide-react';
import { Product } from '../types/product';
import { STORE_CONFIG } from '../config/store';
import { compressAndResizeImage } from '../utils/imageCompressor';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (data: Partial<Product> & { nome: string; categoria: string; preco: number; quantidade: number }) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
}) => {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Rosto');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('5');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Estados de upload de foto
  const [processingImage, setProcessingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setNome(product.nome);
      setCategoria(product.categoria);
      setPreco(product.preco.toString());
      setQuantidade(product.quantidade.toString());
      setDescricao(product.descricao || '');
      setImagem(product.imagem || '');
      setAtivo(product.ativo !== false);
    } else {
      setNome('');
      setCategoria('Rosto');
      setPreco('');
      setQuantidade('5');
      setDescricao('');
      setImagem('');
      setAtivo(true);
    }
    setError('');
    setShowUrlInput(false);
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Lida com a seleção de arquivo da galeria/câmera
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica do tipo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido (JPEG, PNG, etc).');
      return;
    }

    setProcessingImage(true);
    setError('');

    try {
      const optimizedDataUrl = await compressAndResizeImage(file, 800, 0.85);
      setImagem(optimizedDataUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar imagem da galeria.';
      setError(msg);
    } finally {
      setProcessingImage(false);
      // Limpa o input para permitir selecionar a mesma foto se desejar
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImagem('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome.trim()) {
      setError('O nome do produto é obrigatório.');
      return;
    }

    const precoNum = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNum) || precoNum < 0) {
      setError('Por favor, informe um preço válido.');
      return;
    }

    const qtdNum = parseInt(quantidade, 10);
    if (isNaN(qtdNum) || qtdNum < 0) {
      setError('Por favor, informe uma quantidade válida.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: product?.id,
        nome: nome.trim(),
        categoria,
        preco: precoNum,
        quantidade: qtdNum,
        descricao: descricao.trim(),
        imagem: imagem.trim() || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
        ativo,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar produto.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#eae4de] rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eae4de]">
          <h2 className="text-lg font-bold text-[#222222]">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#888888] hover:text-[#222222] p-1 rounded-lg hover:bg-[#faf8f6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Seção da Foto do Produto com Upload da Galeria */}
          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1.5">
              Foto do Produto
            </label>

            {/* Input nativo de arquivo oculto */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {imagem ? (
              /* Preview da imagem selecionada */
              <div className="relative border border-[#eae4de] rounded-2xl overflow-hidden bg-[#faf8f6] p-3 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#f2ece6] border border-[#eae4de] shrink-0">
                  <img
                    src={imagem}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-xs font-medium text-[#222222] truncate">
                    Foto selecionada com sucesso
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={processingImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#eae4de] hover:border-[#a66e58] text-xs font-semibold text-[#444444] rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#a66e58]" />
                      <span>Trocar foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Área de clique para escolher da galeria ou câmera */
              <div
                onClick={() => !processingImage && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-[#eae4de] hover:border-[#a66e58] rounded-2xl p-5 text-center cursor-pointer bg-[#faf8f6]/50 hover:bg-[#faf8f6] transition-all group ${
                  processingImage ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {processingImage ? (
                  <div className="py-2 flex flex-col items-center justify-center text-xs text-[#a66e58]">
                    <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                    <span>Otimizando foto da galeria...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-[#f5ede8] border border-[#eae4de] flex items-center justify-center text-[#a66e58] group-hover:scale-110 transition-transform">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#222222] block">
                        Toque para escolher da galeria ou tirar foto
                      </span>
                      <span className="text-[11px] text-[#888888] block mt-0.5">
                        Compatível com fotos do celular ou computador (JPEG, PNG, WebP)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Alternador para quem preferir colar link da internet */}
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[#888888] hover:text-[#a66e58] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showUrlInput ? 'Ocultar campo de link da web' : 'Ou colar link da internet (URL)'}</span>
              </button>
            </div>

            {showUrlInput && (
              <div className="mt-2 animate-in fade-in duration-150">
                <input
                  type="url"
                  value={imagem}
                  onChange={(e) => setImagem(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-white border border-[#eae4de] rounded-xl text-xs text-[#222222] focus:outline-none focus:border-[#a66e58] transition-all"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1">
              Nome do Produto *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Sérum Facial Clareador 30ml"
              className="w-full px-3 py-2 bg-white border border-[#eae4de] rounded-xl text-sm text-[#222222] focus:outline-none focus:border-[#a66e58] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1">
                Categoria *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#eae4de] rounded-xl text-sm text-[#222222] focus:outline-none focus:border-[#a66e58] transition-all"
              >
                {STORE_CONFIG.categories
                  .filter((c) => c !== 'Todos')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1">
                Preço (R$) *
              </label>
              <input
                type="text"
                required
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="Ex: 89,90"
                className="w-full px-3 py-2 bg-white border border-[#eae4de] rounded-xl text-sm text-[#222222] focus:outline-none focus:border-[#a66e58] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1">
                Quantidade em Estoque *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-white border border-[#eae4de] rounded-xl text-sm text-[#222222] focus:outline-none focus:border-[#a66e58] transition-all"
              />
              <span className="text-[10px] text-[#888888] mt-0.5 block">
                0 = Esgotado | 1 a 4 = Últimas unidades
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1">
                Visibilidade no Site
              </label>
              <label className="inline-flex items-center gap-2 mt-2 text-xs text-[#444444] cursor-pointer">
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="w-4 h-4 rounded border-[#eae4de] accent-[#a66e58] cursor-pointer"
                />
                <span className="font-medium">Mostrar produto no catálogo</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1">
              Descrição do Produto
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva os benefícios, modo de uso ou características..."
              className="w-full px-3 py-2 bg-white border border-[#eae4de] rounded-xl text-sm text-[#222222] focus:outline-none focus:border-[#a66e58] transition-all"
            />
          </div>

          {/* Botões do Modal */}
          <div className="pt-4 border-t border-[#eae4de] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-[#666666] hover:text-[#222222] hover:bg-[#faf8f6] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#a66e58] hover:bg-[#8f5c48] disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar Produto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
