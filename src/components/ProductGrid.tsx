import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onResetFilters,
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-white border border-[#eae4de] rounded-xl py-14 px-4 text-center max-w-lg mx-auto shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#faf8f6] text-[#666666] mb-3">
          <PackageSearch className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#222222]">
          Nenhum produto encontrado
        </h3>
        <p className="text-[#666666] text-sm mt-1">
          Tente ajustar os termos de busca ou remover os filtros aplicados.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-[#a66e58] hover:bg-[#8f5c48] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Limpar todos os filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
