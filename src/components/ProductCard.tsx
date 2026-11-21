import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Product, formatCurrency } from '../types/product';
import { createProductWhatsAppLink } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imgSrc, setImgSrc] = useState(product.imagem);
  const isSoldOut = product.quantidade <= 0;
  const isLowStock = product.quantidade > 0 && product.quantidade < 5;
  const whatsappUrl = createProductWhatsAppLink(product);

  const fallbackUrl = `https://placehold.co/600x450/f2ece6/222222?text=${encodeURIComponent(
    product.nome
  )}`;

  // Configuração visual do badge
  let badgeText = 'Disponível';
  let badgeClasses = 'bg-emerald-100 text-emerald-800 border-emerald-200';

  if (isSoldOut) {
    badgeText = 'Esgotado';
    badgeClasses = 'bg-rose-100 text-rose-800 border-rose-200';
  } else if (isLowStock) {
    badgeText = `Últimas ${product.quantidade} ${product.quantidade === 1 ? 'unidade' : 'unidades'}`;
    badgeClasses = 'bg-amber-100 text-amber-800 border-amber-200';
  }

  return (
    <article className="bg-white border border-[#eae4de] rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <div>
        {/* Link para página de detalhes com foto */}
        <Link
          to={`/produto/${product.id}`}
          className="block relative h-48 sm:h-52 bg-[#f2ece6] overflow-hidden"
          title={`Ver detalhes de ${product.nome}`}
        >
          <span
            className={`absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeClasses}`}
          >
            {badgeText}
          </span>
          <img
            src={imgSrc}
            alt={product.nome}
            loading="lazy"
            onError={() => setImgSrc(fallbackUrl)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isSoldOut ? 'opacity-70 grayscale-[20%]' : ''
            }`}
          />
        </Link>

        {/* Detalhes do Produto */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#666666]">
            <span className="font-semibold text-[#a66e58]">{product.marca}</span>
            <span>•</span>
            <span>{product.categoria}</span>
          </div>
          <Link
            to={`/produto/${product.id}`}
            className="hover:text-[#a66e58] transition-colors"
          >
            <h2 className="text-base font-semibold text-[#222222] mt-1 leading-snug line-clamp-1">
              {product.nome}
            </h2>
          </Link>
          <p className="text-xs sm:text-sm text-[#666666] mt-1.5 leading-relaxed line-clamp-2">
            {product.descricao}
          </p>
        </div>
      </div>

      {/* Preço e Botão de Ação */}
      <div className="p-4 pt-2">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xl font-bold text-[#222222]">
            {formatCurrency(product.preco)}
          </span>
          {!isSoldOut && (
            <span className="text-xs text-[#666666]">
              {product.quantidade} em estoque
            </span>
          )}
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            isSoldOut
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              : 'bg-[#25d366] hover:bg-[#1ebe5d] text-white shadow-sm hover:shadow'
          }`}
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>{isSoldOut ? 'Consultar reposição' : 'Pedir no WhatsApp'}</span>
        </a>
      </div>
    </article>
  );
};
