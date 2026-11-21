import { supabase, isSupabaseConfigured } from './supabase';
import { productsService } from './productsService';

const LOCAL_STORAGE_CATEGORIES_KEY = 'aura_store_categories';
export const DEFAULT_CATEGORIES = ['Rosto', 'Pele', 'Cabelo', 'Perfumaria'];

export const categoriesService = {
  // Busca lista de categorias cadastradas
  async fetchCategories(): Promise<string[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'categories')
          .maybeSingle();

        if (error) throw error;
        if (data && data.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar categorias do Supabase:', err);
      }
    }

    // LocalStorage fallback
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erro ao ler categorias do localStorage:', e);
    }

    return DEFAULT_CATEGORIES;
  },

  // Salva lista completa de categorias
  async saveCategories(categories: string[]): Promise<void> {
    const json = JSON.stringify(categories);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('store_settings').upsert({
          key: 'categories',
          value: json,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      } catch (err) {
        console.warn('Erro ao salvar categorias no Supabase:', err);
      }
    }

    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, json);
  },

  // Adiciona nova categoria
  async addCategory(name: string): Promise<string[]> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('O nome da categoria não pode ser vazio.');
    }

    const current = await this.fetchCategories();
    const exists = current.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      throw new Error(`A categoria "${trimmed}" já existe.`);
    }

    const updated = [...current, trimmed];
    await this.saveCategories(updated);
    return updated;
  },

  // Renomeia uma categoria e atualiza todos os produtos vinculados a ela
  async renameCategory(oldName: string, newName: string): Promise<string[]> {
    const trimmed = newName.trim();
    if (!trimmed) {
      throw new Error('O novo nome da categoria não pode ser vazio.');
    }
    if (oldName.toLowerCase() === trimmed.toLowerCase()) {
      return this.fetchCategories();
    }

    const current = await this.fetchCategories();
    const exists = current.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase()
    );
    if (exists) {
      throw new Error(`A categoria "${trimmed}" já existe.`);
    }

    // 1. Atualiza lista de categorias
    const updated = current.map((c) => (c === oldName ? trimmed : c));
    await this.saveCategories(updated);

    // 2. Atualiza produtos que estavam com a categoria antiga
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('products')
          .update({ categoria: trimmed, updated_at: new Date().toISOString() })
          .eq('categoria', oldName);
      } catch (err) {
        console.warn('Erro ao atualizar categoria dos produtos no Supabase:', err);
      }
    }

    // Atualiza localmente também
    const allProducts = await productsService.fetchProducts(false);
    let changed = false;
    for (const p of allProducts) {
      if (p.categoria === oldName) {
        changed = true;
        p.categoria = trimmed;
      }
    }
    if (changed) {
      try {
        localStorage.setItem('aura_products_catalog', JSON.stringify(allProducts));
      } catch (err) {
        console.error('Erro ao salvar produtos atualizados com nova categoria:', err);
      }
    }

    return updated;
  },

  // Remove uma categoria
  async deleteCategory(name: string): Promise<string[]> {
    const current = await this.fetchCategories();
    if (current.length <= 1) {
      throw new Error('Você deve manter pelo menos uma categoria cadastrada.');
    }

    const updated = current.filter((c) => c !== name);
    await this.saveCategories(updated);
    return updated;
  },
};
