import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_PASSWORD_KEY = 'aura_seller_password';
const SESSION_AUTH_KEY = 'aura_seller_session';

export const authService = {
  // Verifica se a senha da vendedora já foi criada no primeiro acesso
  async hasPasswordConfigured(): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'seller_password')
          .maybeSingle();

        if (error) throw error;
        if (data && data.value) {
          return true;
        }
      } catch (err) {
        console.warn('Erro ao verificar senha no Supabase:', err);
      }
    }

    // LocalStorage fallback
    const localPass = localStorage.getItem(LOCAL_STORAGE_PASSWORD_KEY);
    return Boolean(localPass);
  },

  // Cadastra a senha no primeiro acesso
  async setInitialPassword(password: string): Promise<boolean> {
    const trimmed = password.trim();
    if (!trimmed || trimmed.length < 4) {
      throw new Error('A senha deve ter pelo menos 4 caracteres.');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('store_settings').upsert({
          key: 'seller_password',
          value: trimmed,
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      } catch (err) {
        console.warn('Erro ao salvar senha no Supabase, salvando localmente:', err);
      }
    }

    localStorage.setItem(LOCAL_STORAGE_PASSWORD_KEY, trimmed);
    sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
    return true;
  },

  // Valida a senha digitada
  async verifyPassword(password: string): Promise<boolean> {
    const trimmed = password.trim();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'seller_password')
          .maybeSingle();

        if (error) throw error;
        if (data && data.value) {
          const isValid = data.value === trimmed;
          if (isValid) {
            sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
          }
          return isValid;
        }
      } catch (err) {
        console.warn('Erro ao validar senha no Supabase, tentando local:', err);
      }
    }

    const localPass = localStorage.getItem(LOCAL_STORAGE_PASSWORD_KEY);
    const isValid = localPass === trimmed;
    if (isValid) {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
    }
    return isValid;
  },

  // Verifica se a vendedora está autenticada na sessão atual
  isAuthenticated(): boolean {
    return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
  },

  // Encerra a sessão da vendedora
  logout(): void {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
  },
};
