import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { Product, formatCurrency } from '../types/product';
import { productsService } from '../services/productsService';
import { createProductWhatsAppLink } from '../utils/whatsapp';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      productsService
        .getProductById(id)
        .then((data) => {
          setProduct(data);
          if (data) {
            setImgSrc(data.imagem);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex flex-col justify-between">
        <Header />
        <div className="py-24 text-center flex flex-col items-center justify-center text-[#666666]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#a66e58] mb-3" />
          <p className="text-sm">Carregando detalhes do produto...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex flex-col justify-between">
        <Header />
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <h2 className="text-xl font-bold text-[#222222] mb-2">Produto não encontrado</h2>
          <p className="text-sm text-[#666666] mb-6">
            O produto selecionado pode ter sido removido ou o link está incorreto.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#a66e58] text-white text-sm font-semibold hover:bg-[#8f5c48] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao catálogo</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isSoldOut = product.quantidade <= 0;
  const isLowStock = product.quantidade > 0 && product.quantidade < 5;
  const whatsappUrl = createProductWhatsAppLink(product);

  const fallbackUrl = `https://placehold.co/600x600/f2ece6/222222?text=${encodeURIComponent(
    product.nome
  )}`;

  return (
    <div className="min-h-screen bg-[#faf8f6] flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Botão de retorno */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-[#666666] hover:text-[#a66e58] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao catálogo</span>
            </Link>
          </div>

          {/* Grid de Detalhes do Produto */}
          <div className="bg-white border border-[#eae4de] rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Foto Ampliada */}
            <div className="relative rounded-xl overflow-hidden bg-[#f2ece6] aspect-square flex items-center justify-center">
              <img
                src={imgSrc}
                alt={product.nome}
                onError={() => setImgSrc(fallbackUrl)}
                className={`w-full h-full object-cover ${
                  isSoldOut ? 'opacity-75 grayscale-[20%]' : ''
                }`}
              />
              <span
                className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  isSoldOut
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : isLowStock
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                {isSoldOut
                  ? 'Esgotado'
                  : isLowStock
                  ? `Últimas ${product.quantidade} unidades`
                  : 'Disponível em estoque'}
              </span>
            </div>

            {/* Informações e Botão de Ação */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-white bg-[#a66e58] px-3 py-1 rounded-full shadow-2xs">
                    {product.marca}
                  </span>
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#a66e58] bg-[#f5ede8] px-3 py-1 rounded-full border border-[#eae4de]">
                    {product.categoria}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] leading-tight">
                  {product.nome}
                </h1>

                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-3xl font-extrabold text-[#222222]">
                    {formatCurrency(product.preco)}
                  </span>
                  {!isSoldOut && (
                    <span className="text-xs text-[#666666]">
                      ({product.quantidade} {product.quantidade === 1 ? 'unidade disponível' : 'unidades disponíveis'})
                    </span>
                  )}
                </div>

                {/* Descrição detalhada */}
                <div className="pt-2 border-t border-[#eae4de]">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666666] mb-2">
                    Sobre este produto
                  </h3>
                  <p className="text-sm text-[#444444] leading-relaxed whitespace-pre-line">
                    {product.descricao || 'Produto de alta qualidade para cuidados diários e bem-estar.'}
                  </p>
                </div>

                {/* Diferenciais informativos */}
                <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#666666]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#a66e58]" />
                    <span>Produto 100% Original ({product.marca})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#a66e58]" />
                    <span>Entrega e retirada a combinar</span>
                  </div>
                </div>
              </div>

              {/* Botão de Contato WhatsApp */}
              <div className="pt-4 border-t border-[#eae4de] space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 px-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow ${
                    isSoldOut
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                      : 'bg-[#25d366] hover:bg-[#1ebe5d] text-white'
                  }`}
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>{isSoldOut ? 'Avise-me quando repor no WhatsApp' : 'Pedir pelo WhatsApp'}</span>
                </a>
                <p className="text-[11px] text-center text-[#888888]">
                  Atendimento direto e personalizado via WhatsApp • Tire suas dúvidas antes de comprar
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};
