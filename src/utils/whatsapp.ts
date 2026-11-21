import { Product, formatCurrency } from '../types/product';
import { STORE_CONFIG } from '../config/store';

export function createProductWhatsAppLink(
  product: Product,
  phone: string = STORE_CONFIG.phoneWhatsapp
): string {
  const isSoldOut = product.quantidade <= 0;
  const message = isSoldOut
    ? `Olá! Vi no catálogo da loja que o produto *${product.nome}* está esgotado. Quando chega reposição?`
    : `Olá! Tenho interesse em comprar o produto *${product.nome}* (${formatCurrency(product.preco)}). Ainda tem disponível?`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function createGeneralWhatsAppLink(
  phone: string = STORE_CONFIG.phoneWhatsapp,
  message: string = STORE_CONFIG.defaultMessage
): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
