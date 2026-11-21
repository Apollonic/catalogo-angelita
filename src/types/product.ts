export type ProductStatus = 'disponivel' | 'ultimas' | 'esgotado';

export interface Product {
  id: string;
  nome: string;
  categoria: string;
  preco: string;
  status: ProductStatus;
  descricao: string;
  imagem: string;
}

export interface StoreConfig {
  name: string;
  subtitle: string;
  phoneWhatsapp: string;
  defaultMessage: string;
  categories: string[];
}
