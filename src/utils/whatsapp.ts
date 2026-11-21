import { Product, formatCurrency } from '../types/product';
import { STORE_CONFIG } from '../config/store';
import { settingsService } from '../services/settingsService';

export function createProductWhatsAppLink(
  product: Product,
  phone: string = settingsService.getWhatsAppPhoneSync()
): string {
  const isSoldOut = product.quantidade <= 0;
  const message = isSoldOut
    ? `Olá, Angelita! Vi no seu catálogo online que o produto *${product.nome}* está esgotado. Quando chega reposição?`
    : `Olá, Angelita! Tenho interesse em comprar o produto *${product.nome}* (${formatCurrency(product.preco)}). Ainda tem disponível?`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function createGeneralWhatsAppLink(
  phone: string = settingsService.getWhatsAppPhoneSync(),
  message: string = STORE_CONFIG.defaultMessage
): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
