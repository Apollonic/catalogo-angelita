import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { StockFilter } from '../components/StockFilter';
import { ProductGrid } from '../components/ProductGrid';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { Footer } from '../components/Footer';
import { Product } from '../types/product';
import { productsService } from '../services/productsService';
import { STORE_CONFIG } from '../config/store';
import { Sparkles, MessageCircle, RefreshCw } from 'lucide-react';
import { createGeneralWhatsAppLink } from '../utils/whatsapp';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Carrega produtos ativos para o catálogo
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsService.fetchProducts(true);
      setProducts(data);
    } catch (err) {
      console.error('Erro ao carregar catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Contagem de produtos por categoria para o Hero
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.categoria] = (counts[p.categoria] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtra produtos de forma reativa
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.categoria === selectedCategory;

      const matchesSearch =
        term === '' ||
        product.nome.toLowerCase().includes(term) ||
        product.descricao.toLowerCase().includes(term);

      const matchesStock = !onlyAvailable || product.quantidade > 0;

      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, onlyAvailable]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todos');
    setOnlyAvailable(false);
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] flex flex-col justify-between">
      <div>
        <Header />

        {/* Hero Section Elegante (Inspirado no Lovable) */}
        <section className="bg-gradient-to-b from-white to-[#faf8f6] border-b border-[#eae4de] py-8 sm:py-12 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f5ede8] text-[#a66e58] border border-[#eae4de]">
              <Sparkles className="w-3.5 h-3.5" />
              Catálogo Oficial Exclusivo
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif italic text-[#222222] tracking-tight">
              Realce sua beleza natural todos os dias
            </h2>
            <p className="text-sm sm:text-base text-[#666666] max-w-xl mx-auto">
              Cosméticos selecionados com carinho para cuidar de você com delicadeza e sofisticação.
            </p>
            <div>
              <a
                href={createGeneralWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Fale no WhatsApp</span>
              </a>
            </div>

            {/* Atalhos com contagem por categoria */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 max-w-2xl mx-auto">
              {['Rosto', 'Pele', 'Cabelo', 'Perfumaria'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedCategory === cat
                      ? 'bg-white border-[#a66e58] shadow-sm ring-1 ring-[#a66e58]'
                      : 'bg-white/80 border-[#eae4de] hover:border-[#a66e58]/50 hover:bg-white'
                  }`}
                >
                  <span className="block text-xs font-semibold text-[#222222]">{cat}</span>
                  <span className="text-[11px] text-[#666666]">
                    {categoryCounts[cat] || 0} {categoryCounts[cat] === 1 ? 'produto' : 'produtos'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Barra de Controles: Busca e Filtros */}
        <section className="max-w-5xl mx-auto px-4 mt-8 mb-6 space-y-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar produto por nome ou descrição..."
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CategoryFilter
              categories={STORE_CONFIG.categories}
              activeCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <StockFilter
              checked={onlyAvailable}
              onChange={setOnlyAvailable}
            />
          </div>

          {/* Indicador de resultados */}
          <div className="flex items-center justify-between text-xs text-[#666666] px-1">
            <span>
              Exibindo <strong className="text-[#222222]">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'produto' : 'produtos'}
            </span>
            {(searchTerm || selectedCategory !== 'Todos' || onlyAvailable) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[#a66e58] hover:underline cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </section>

        {/* Grade de Produtos ou Carregamento */}
        <main className="max-w-5xl mx-auto px-4 mb-16">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-[#666666]">
              <RefreshCw className="w-7 h-7 animate-spin text-[#a66e58] mb-3" />
              <p className="text-sm">Carregando catálogo...</p>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              onResetFilters={handleResetFilters}
            />
          )}
        </main>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};
