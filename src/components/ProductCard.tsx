import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Product, ProductStatus } from '../types/product';
import { createProductWhatsAppLink } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
}

interface BadgeConfig {
  texto: string;
  classes: string;
}

function getBadgeConfig(status: ProductStatus): BadgeConfig {
  switch (status) {
    case 'disponivel':
      return {
        texto: 'Disponível',
        classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      };
    case 'ultimas':
      return {
        texto: 'Últimas unidades',
        classes: 'bg-amber-100 text-amber-800 border border-amber-200',
      };
    case 'esgotado':
      return {
        texto: 'Esgotado',
        classes: 'bg-rose-100 text-rose-800 border border-rose-200',
      };
  }
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imgSrc, setImgSrc] = useState(product.imagem);
  const isSoldOut = product.status === 'esgotado';
  const badge = getBadgeConfig(product.status);
  const whatsappUrl = createProductWhatsAppLink(product);

  const fallbackUrl = `https://placehold.co/600x450/f2ece6/222222?text=${encodeURIComponent(
    product.nome
  )}`;

  return (
    <article className="bg-white border border-[#eae4de] rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <div>
        {/* Imagem com badge de status */}
        <div className="relative h-48 sm:h-52 bg-[#f2ece6] overflow-hidden">
          <span
            className={`absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-md text-xs font-semibold ${badge.classes}`}
          >
            {badge.texto}
          </span>
          <img
            src={imgSrc}
            alt={product.nome}
            loading="lazy"
            onError={() => setImgSrc(fallbackUrl)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isSoldOut ? 'opacity-75 grayscale-[20%]' : ''
            }`}
          />
        </div>

        {/* Detalhes do Produto */}
        <div className="p-4 pb-2">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-[#666666]">
            {product.categoria}
          </span>
          <h2 className="text-base font-semibold text-[#222222] mt-0.5 leading-snug line-clamp-1">
            {product.nome}
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-1.5 leading-relaxed line-clamp-2">
            {product.descricao}
          </p>
        </div>
      </div>

      {/* Preço e Botão WhatsApp */}
      <div className="p-4 pt-2">
        <div className="text-xl font-bold text-[#222222] mb-3">
          {product.preco}
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
