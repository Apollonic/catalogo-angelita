export type ProductBadgeStatus = 'disponivel' | 'ultimas' | 'esgotado';

export interface Product {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  quantidade: number;
  status?: ProductBadgeStatus; // Calculado dinamicamente com base na quantidade
  descricao: string;
  imagem: string;
  ativo: boolean; // Controla se aparece no site para as clientes
  created_at?: string;
  updated_at?: string;
}

export interface StoreConfig {
  name: string;
  subtitle: string;
  phoneWhatsapp: string;
  defaultMessage: string;
  categories: string[];
}

// Utilitário para determinar o badge com base na quantidade em estoque
export function getProductStockStatus(quantidade: number): ProductBadgeStatus {
  if (quantidade <= 0) return 'esgotado';
  if (quantidade < 5) return 'ultimas';
  return 'disponivel';
}

// Utilitário para formatar moeda em Real Brasileiro
export function formatCurrency(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
