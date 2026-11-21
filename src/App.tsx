import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { StockFilter } from './components/StockFilter';
import { ProductGrid } from './components/ProductGrid';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { INITIAL_PRODUCTS } from './data/products';
import { STORE_CONFIG } from './config/store';

export const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Filtra produtos de forma reativa e otimizada
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return INITIAL_PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.categoria === selectedCategory;

      const matchesSearch =
        term === '' ||
        product.nome.toLowerCase().includes(term) ||
        product.descricao.toLowerCase().includes(term);

      const matchesStock = !onlyAvailable || product.status !== 'esgotado';

      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [searchTerm, selectedCategory, onlyAvailable]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todos');
    setOnlyAvailable(false);
  };

  return (
    <div className="min-h-screen pb-24 flex flex-col justify-between">
      <div>
        {/* Cabeçalho */}
        <Header />

        {/* Controles: Busca e Filtros */}
        <section className="max-w-5xl mx-auto px-4 mt-6 mb-6 space-y-4">
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

        {/* Grade de Produtos */}
        <main className="max-w-5xl mx-auto px-4">
          <ProductGrid
            products={filteredProducts}
            onResetFilters={handleResetFilters}
          />
        </main>
      </div>

      {/* Rodapé Simples */}
      <footer className="mt-16 border-t border-[#eae4de] py-6 text-center text-xs text-[#666666]">
        <p>© {new Date().getFullYear()} {STORE_CONFIG.name}. Todos os direitos reservados.</p>
        <p className="mt-1 text-[11px] text-[#888888]">
          Atendimento personalizado via WhatsApp • Pedidos e informações rápidas
        </p>
      </footer>

      {/* Botão Flutuante de WhatsApp */}
      <FloatingWhatsApp />
    </div>
  );
};

export default App;
