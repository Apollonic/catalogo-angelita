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
import { categoriesService, DEFAULT_CATEGORIES } from '../services/categoriesService';
import { STORE_CONFIG } from '../config/store';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { createGeneralWhatsAppLink } from '../utils/whatsapp';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const brands = STORE_CONFIG.brands;

  // Carrega produtos ativos e categorias
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        productsService.fetchProducts(true),
        categoriesService.fetchCategories(),
      ]);
      setProducts(prodsData);
      setCategories(catsData);
    } catch (err) {
      console.error('Erro ao carregar dados do catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lista de categorias com a opção 'Todos'
  const filterCategories = useMemo(() => {
    return ['Todos', ...categories];
  }, [categories]);

  // Filtra produtos de forma reativa combinando Marca, Categoria, Busca e Estoque
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      const matchesBrand =
        selectedBrand === 'Todas' ||
        product.marca.toLowerCase() === selectedBrand.toLowerCase();

      const matchesCategory =
        selectedCategory === 'Todos' ||
        product.categoria.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        term === '' ||
        product.nome.toLowerCase().includes(term) ||
        product.descricao.toLowerCase().includes(term) ||
        product.marca.toLowerCase().includes(term);

      const matchesStock = !onlyAvailable || product.quantidade > 0;

      return matchesBrand && matchesCategory && matchesSearch && matchesStock;
    });
  }, [products, searchTerm, selectedBrand, selectedCategory, onlyAvailable]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedBrand('Todas');
    setSelectedCategory('Todos');
    setOnlyAvailable(false);
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] flex flex-col justify-between">
      <div>
        <Header />

        {/* Hero Section Acolhedora (Boas-vindas sem contadores) */}
        <section className="bg-gradient-to-b from-white to-[#faf8f6] border-b border-[#eae4de] py-8 sm:py-12 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-serif italic text-[#222222] tracking-tight">
              Seja bem-vinda ao Catálogo Angelita!
            </h2>
            <p className="text-sm sm:text-base text-[#666666] max-w-xl mx-auto leading-relaxed">
              Confira nossos cosméticos e produtos a pronta entrega selecionados com carinho. Escolha seus favoritos e faça seu pedido direto pelo WhatsApp.
            </p>
            <div className="pt-1">
              <a
                href={createGeneralWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Falar com a Angelita no WhatsApp</span>
              </a>
            </div>

            {/* Referência às Marcas em Pequenos Retângulos Circulares (Pills) */}
            <div className="pt-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#888888] block mb-2.5">
                Marcas Disponíveis
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {brands.map((brand) => {
                  const isSelected = selectedBrand === brand;
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#a66e58] text-white border-[#a66e58] shadow-sm scale-105'
                          : 'bg-white text-[#444444] border-[#eae4de] hover:border-[#a66e58] hover:bg-[#f5ede8]/50 shadow-2xs'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Barra de Controles: Busca, Categorias e Filtros */}
        <section className="max-w-5xl mx-auto px-4 mt-8 mb-6 space-y-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar produto por nome, marca ou descrição..."
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CategoryFilter
              categories={filterCategories}
              activeCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <StockFilter
              checked={onlyAvailable}
              onChange={setOnlyAvailable}
            />
          </div>

          {/* Indicador de resultados e Filtros ativos */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#666666] px-1 gap-2">
            <div className="flex items-center gap-2">
              <span>
                Exibindo <strong className="text-[#222222]">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'produto' : 'produtos'}
              </span>
              {selectedBrand !== 'Todas' && (
                <span className="bg-[#f5ede8] text-[#a66e58] px-2 py-0.5 rounded-full text-[11px] font-semibold border border-[#eae4de]">
                  Marca: {selectedBrand}
                </span>
              )}
              {selectedCategory !== 'Todos' && (
                <span className="bg-[#f5ede8] text-[#a66e58] px-2 py-0.5 rounded-full text-[11px] font-semibold border border-[#eae4de]">
                  Categoria: {selectedCategory}
                </span>
              )}
            </div>

            {(searchTerm || selectedBrand !== 'Todas' || selectedCategory !== 'Todos' || onlyAvailable) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[#a66e58] hover:underline cursor-pointer font-medium"
              >
                Limpar todos os filtros
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
