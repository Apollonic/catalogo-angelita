import { Product, getProductStockStatus } from '../types/product';
import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_PRODUCTS } from '../data/products';
import { sanitizeText, isValidImageUrl } from '../utils/security';

const LOCAL_STORAGE_KEY = 'aura_products_catalog';
const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80';

// Inicializa dados no localStorage se necessário para modo offline/demonstração
function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw) as Product[];
  } catch (error) {
    console.error('Erro ao ler produtos do localStorage:', error);
    return INITIAL_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Erro ao salvar produtos no localStorage:', error);
  }
}

export const productsService = {
  // Lista produtos: se onlyActive for true, traz apenas os visíveis no site (para clientes)
  async fetchProducts(onlyActive = false): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('products').select('*').order('created_at', { ascending: true });

        if (onlyActive) {
          query = query.eq('ativo', true);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((p) => ({
          ...p,
          preco: Number(p.preco),
          quantidade: Number(p.quantidade),
          status: getProductStockStatus(Number(p.quantidade)),
        }));
      } catch (err) {
        console.warn('Erro ao carregar do Supabase, recorrendo aos dados locais:', err);
      }
    }

    // Fallback LocalStorage
    const local = getLocalProducts();
    const filtered = onlyActive ? local.filter((p) => p.ativo) : local;
    return filtered.map((p) => ({
      ...p,
      status: getProductStockStatus(p.quantidade),
    }));
  },

  // Busca produto por ID
  async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return null;

        return {
          ...data,
          preco: Number(data.preco),
          quantidade: Number(data.quantidade),
          status: getProductStockStatus(Number(data.quantidade)),
        };
      } catch (err) {
        console.warn('Erro ao buscar produto do Supabase:', err);
      }
    }

    const local = getLocalProducts();
    const product = local.find((p) => p.id === id);
    if (!product) return null;
    return {
      ...product,
      status: getProductStockStatus(product.quantidade),
    };
  },

  // Atualização rápida de estoque inline (+1 ou -1) com limites seguros
  async updateStock(id: string, newQuantity: number): Promise<boolean> {
    const safeQty = Math.max(0, Math.min(100000, Math.floor(newQuantity)));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .update({
            quantidade: safeQty,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Erro ao atualizar estoque no Supabase:', err);
      }
    }

    const local = getLocalProducts();
    const updated = local.map((p) => (p.id === id ? { ...p, quantidade: safeQty } : p));
    saveLocalProducts(updated);
    return true;
  },

  // Alterna visibilidade no site (ativo: true/false)
  async toggleVisibility(id: string, ativo: boolean): Promise<boolean> {
    const safeAtivo = Boolean(ativo);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .update({
            ativo: safeAtivo,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Erro ao atualizar visibilidade no Supabase:', err);
      }
    }

    const local = getLocalProducts();
    const updated = local.map((p) => (p.id === id ? { ...p, ativo: safeAtivo } : p));
    saveLocalProducts(updated);
    return true;
  },

  // Atualiza preço diretamente com limites de segurança
  async updatePrice(id: string, preco: number): Promise<boolean> {
    const safePrice = Math.max(0, Math.min(999999, Number(preco)));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .update({
            preco: safePrice,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Erro ao atualizar preço no Supabase:', err);
      }
    }

    const local = getLocalProducts();
    const updated = local.map((p) => (p.id === id ? { ...p, preco: safePrice } : p));
    saveLocalProducts(updated);
    return true;
  },

  // Salva produto completo com sanitização estrita anti-XSS e validação de imagem
  async saveProduct(productData: Partial<Product> & { nome: string; categoria: string; preco: number }): Promise<Product> {
    const sanitizedName = sanitizeText(productData.nome, 120);
    const sanitizedCategory = sanitizeText(productData.categoria, 50);
    const sanitizedDesc = sanitizeText(productData.descricao ?? '', 1000);

    const safeImage = isValidImageUrl(productData.imagem ?? '')
      ? (productData.imagem as string).trim()
      : DEFAULT_FALLBACK_IMAGE;

    const safeData = {
      nome: sanitizedName || 'Produto sem nome',
      categoria: sanitizedCategory || 'Geral',
      preco: Math.max(0, Math.min(999999, Number(productData.preco))),
      quantidade: Math.max(0, Math.min(100000, Math.floor(Number(productData.quantidade ?? 0)))),
      descricao: sanitizedDesc,
      imagem: safeImage,
      ativo: Boolean(productData.ativo ?? true),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (productData.id) {
          // Edição
          const { data, error } = await supabase
            .from('products')
            .update(safeData)
            .eq('id', productData.id)
            .select()
            .single();

          if (error) throw error;
          return {
            ...data,
            status: getProductStockStatus(data.quantidade),
          };
        } else {
          // Criação
          const { data, error } = await supabase
            .from('products')
            .insert({
              ...safeData,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;
          return {
            ...data,
            status: getProductStockStatus(data.quantidade),
          };
        }
      } catch (err) {
        console.warn('Erro ao salvar no Supabase, salvando localmente:', err);
      }
    }

    // Local fallback
    const local = getLocalProducts();
    if (productData.id) {
      const updated = local.map((p) =>
        p.id === productData.id ? ({ ...p, ...safeData, id: productData.id } as Product) : p
      );
      saveLocalProducts(updated);
      const res = updated.find((p) => p.id === productData.id)!;
      return { ...res, status: getProductStockStatus(res.quantidade) };
    } else {
      const newProduct: Product = {
        ...safeData,
        id: String(Date.now()),
        created_at: new Date().toISOString(),
      };
      const updated = [newProduct, ...local];
      saveLocalProducts(updated);
      return { ...newProduct, status: getProductStockStatus(newProduct.quantidade) };
    }
  },

  // Remove produto
  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Erro ao remover produto no Supabase:', err);
      }
    }

    const local = getLocalProducts();
    const updated = local.filter((p) => p.id !== id);
    saveLocalProducts(updated);
    return true;
  },
};
