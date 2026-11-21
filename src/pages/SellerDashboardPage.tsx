import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ExternalLink,
  LogOut,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Cloud,
  Database,
} from 'lucide-react';
import { Product, formatCurrency } from '../types/product';
import { productsService } from '../services/productsService';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabase';
import { STORE_CONFIG } from '../config/store';
import { ProductFormModal } from '../components/ProductFormModal';

export const SellerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Carrega todos os produtos (inclusive os inativos)
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsService.fetchProducts(false);
      setProducts(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/vendedora', { replace: true });
  };

  // Métricas analíticas do painel
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((acc, p) => acc + p.quantidade, 0);
    const activeProducts = products.filter((p) => p.ativo).length;
    const outOfStock = products.filter((p) => p.quantidade <= 0).length;

    return { totalProducts, totalUnits, activeProducts, outOfStock };
  }, [products]);

  // Produtos filtrados por categoria e busca
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'Todas' || p.categoria === selectedCategory;

      const matchesSearch =
        term === '' ||
        p.nome.toLowerCase().includes(term) ||
        p.descricao.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  // Ajuste rápido de estoque (+1 / -1)
  const handleStockChange = async (product: Product, delta: number) => {
    const newQty = Math.max(0, product.quantidade + delta);
    if (newQty === product.quantidade) return;

    // Atualização otimista no estado local
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, quantidade: newQty } : p))
    );

    await productsService.updateStock(product.id, newQty);
    showToast(`Estoque de "${product.nome}" atualizado para ${newQty}.`);
  };

  // Alternar visibilidade no site
  const handleToggleVisibility = async (product: Product) => {
    const newStatus = !product.ativo;

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, ativo: newStatus } : p))
    );

    await productsService.toggleVisibility(product.id, newStatus);
    showToast(
      newStatus
        ? `"${product.nome}" agora está visível no site.`
        : `"${product.nome}" foi ocultado do site.`
    );
  };

  // Salvar produto (criar ou editar via modal)
  const handleSaveProduct = async (data: Partial<Product> & { nome: string; categoria: string; preco: number; quantidade: number }) => {
    await productsService.saveProduct(data);
    await loadProducts();
    showToast(data.id ? 'Produto atualizado com sucesso!' : 'Novo produto cadastrado com sucesso!');
  };

  // Excluir produto com confirmação
  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Tem certeza de que deseja remover o produto "${product.nome}"?`);
    if (!confirmed) return;

    await productsService.deleteProduct(product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    showToast(`Produto "${product.nome}" removido.`);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] pb-24 text-[#222222]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#222222] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Superior do Painel */}
      <header className="bg-white border-b border-[#eae4de] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f5ede8] border border-[#eae4de] flex items-center justify-center text-[#a66e58]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#222222]">Painel da Vendedora</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#f5ede8] text-[#a66e58]">
                  Gestão
                </span>
              </div>
              <p className="text-xs text-[#666666]">{STORE_CONFIG.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#eae4de] text-xs font-semibold text-[#444444] hover:bg-[#faf8f6] hover:text-[#a66e58] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver loja</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Indicador de Conexão Supabase / Local */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between text-[11px] text-[#666666] bg-white border border-[#eae4de] rounded-xl px-3.5 py-2 shadow-xs">
          <div className="flex items-center gap-2">
            {isSupabaseConfigured ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium text-emerald-800">Conectado ao Supabase (Sincronização em Nuvem Ativa)</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <span>Modo Local / Demonstração (As alterações são salvas no navegador local)</span>
              </>
            )}
          </div>
          <button
            onClick={loadProducts}
            className="hover:text-[#222222] inline-flex items-center gap-1 cursor-pointer"
            title="Recarregar dados"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {/* Cards de Métricas Analíticas */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-[#eae4de] rounded-xl p-4 shadow-xs">
            <span className="text-xs font-medium text-[#666666] block">Total de Produtos</span>
            <span className="text-2xl font-bold text-[#222222] mt-1 block">
              {metrics.totalProducts}
            </span>
            <span className="text-[11px] text-[#888888] mt-0.5 block">cadastrados no sistema</span>
          </div>

          <div className="bg-white border border-[#eae4de] rounded-xl p-4 shadow-xs">
            <span className="text-xs font-medium text-[#666666] block">Unidades em Estoque</span>
            <span className="text-2xl font-bold text-[#a66e58] mt-1 block">
              {metrics.totalUnits}
            </span>
            <span className="text-[11px] text-[#888888] mt-0.5 block">peças disponíveis</span>
          </div>

          <div className="bg-white border border-[#eae4de] rounded-xl p-4 shadow-xs">
            <span className="text-xs font-medium text-[#666666] block">Ativos no Site</span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">
              {metrics.activeProducts}
            </span>
            <span className="text-[11px] text-[#888888] mt-0.5 block">visíveis para clientes</span>
          </div>

          <div className="bg-white border border-[#eae4de] rounded-xl p-4 shadow-xs">
            <span className="text-xs font-medium text-[#666666] block">Esgotados</span>
            <span className="text-2xl font-bold text-rose-600 mt-1 block">
              {metrics.outOfStock}
            </span>
            <span className="text-[11px] text-[#888888] mt-0.5 block">precisam de reposição</span>
          </div>
        </section>

        {/* Barra de Filtros e Ação Principal */}
        <section className="bg-white border border-[#eae4de] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Campo de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por nome do produto..."
                className="w-full pl-9 pr-3 py-2 bg-[#faf8f6] border border-[#eae4de] rounded-xl text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#a66e58]"
              />
            </div>

            {/* Filtro por Categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-[#faf8f6] border border-[#eae4de] rounded-xl text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#a66e58]"
            >
              <option value="Todas">Todas as Categorias</option>
              {STORE_CONFIG.categories
                .filter((c) => c !== 'Todos')
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          {/* Botão Novo Produto */}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#a66e58] hover:bg-[#8f5c48] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo produto</span>
          </button>
        </section>

        {/* Tabela / Lista de Produtos */}
        <section className="bg-white border border-[#eae4de] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#eae4de] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#222222]">
              Produtos Cadastrados ({filteredProducts.length})
            </h3>
            <span className="text-xs text-[#666666]">
              Ajuste as quantidades e a disponibilidade com um clique
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#666666] text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#a66e58] mb-2" />
              Carregando produtos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-[#666666] text-sm">
              Nenhum produto encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="divide-y divide-[#eae4de]">
              {filteredProducts.map((p) => {
                const isSoldOut = p.quantidade <= 0;
                const isLowStock = p.quantidade > 0 && p.quantidade < 5;

                return (
                  <div
                    key={p.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#faf8f6]/50 transition-colors"
                  >
                    {/* Foto e Informações Principais */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-[#f2ece6] overflow-hidden shrink-0 border border-[#eae4de]">
                        <img
                          src={p.imagem}
                          alt={p.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://placehold.co/100x100/f2ece6/222222?text=${encodeURIComponent(
                              p.nome[0]
                            )}`;
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a66e58] bg-[#f5ede8] px-2 py-0.5 rounded-md">
                            {p.categoria}
                          </span>
                          {!p.ativo && (
                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              Oculto no site
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-[#222222] truncate mt-0.5">
                          {p.nome}
                        </h4>
                        <span className="text-sm font-bold text-[#222222]">
                          {formatCurrency(p.preco)}
                        </span>
                      </div>
                    </div>

                    {/* Controles de Estoque e Disponibilidade */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-between md:justify-end">
                      {/* Ajuste Rápido de Estoque */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-[#666666] mb-1">Estoque</span>
                        <div className="inline-flex items-center border border-[#eae4de] rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            disabled={p.quantidade <= 0}
                            onClick={() => handleStockChange(p, -1)}
                            className="px-2.5 py-1 text-sm font-bold text-[#666666] hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            title="Diminuir 1 unidade"
                          >
                            −
                          </button>
                          <span
                            className={`px-3 py-1 text-xs font-bold tabular-nums min-w-[2.5rem] text-center ${
                              isSoldOut
                                ? 'text-rose-600'
                                : isLowStock
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {p.quantidade}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStockChange(p, 1)}
                            className="px-2.5 py-1 text-sm font-bold text-[#666666] hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Aumentar 1 unidade"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Switch de Visibilidade no Site */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-[#666666] mb-1">No site</span>
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(p)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                            p.ativo ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                          title={p.ativo ? 'Clique para ocultar do site' : 'Clique para exibir no site'}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              p.ativo ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center gap-1.5 pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-2 text-[#666666] hover:text-[#a66e58] hover:bg-white rounded-lg border border-transparent hover:border-[#eae4de] transition-colors cursor-pointer"
                          title="Editar informações do produto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p)}
                          className="p-2 text-[#888888] hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          title="Remover produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modal de Criação / Edição de Produto */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
