import { supabase, isSupabaseConfigured } from './supabase';
import {
  hashPassword,
  getRateLimitStatus,
  recordFailedAttempt,
  clearRateLimit,
  createSecureSession,
  isSecureSessionValid,
  destroySecureSession,
} from '../utils/security';

const LOCAL_STORAGE_PASSWORD_HASH_KEY = 'aura_seller_password_hash';

export const authService = {
  // Obtém status atual de bloqueio por tentativas excessivas
  getRateLimit() {
    return getRateLimitStatus();
  },

  // Verifica se a senha da vendedora já foi criada no primeiro acesso
  async hasPasswordConfigured(): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('key')
          .eq('key', 'seller_password_hash')
          .maybeSingle();

        if (!error && data) {
          return true;
        }
      } catch (err) {
        console.warn('Erro ao verificar senha no Supabase:', err);
      }
    }

    // LocalStorage fallback (usando hash seguro)
    const localHash = localStorage.getItem(LOCAL_STORAGE_PASSWORD_HASH_KEY);
    return Boolean(localHash);
  },

  // Cadastra a senha mestra inicial protegida por hash SHA-256
  async setInitialPassword(password: string): Promise<boolean> {
    const trimmed = password.trim();
    if (!trimmed || trimmed.length < 4) {
      throw new Error('A senha deve ter pelo menos 4 caracteres.');
    }

    const hashed = await hashPassword(trimmed);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: rpcError } = await supabase.rpc('set_initial_seller_password', {
          p_hash: hashed,
        });

        if (rpcError) {
          await supabase.from('store_settings').upsert({
            key: 'seller_password_hash',
            value: hashed,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Erro ao salvar hash no Supabase, salvando localmente:', err);
      }
    }

    localStorage.setItem(LOCAL_STORAGE_PASSWORD_HASH_KEY, hashed);
    clearRateLimit();
    createSecureSession();
    return true;
  },

  // Valida a senha digitada comparando hashes e aplicando rate limiting
  async verifyPassword(password: string): Promise<boolean> {
    const rateLimit = getRateLimitStatus();
    if (rateLimit.isLocked) {
      throw new Error(
        `Acesso temporariamente bloqueado por segurança devido a tentativas incorretas. Aguarde ${rateLimit.remainingSeconds} segundos.`
      );
    }

    const trimmed = password.trim();
    const inputHash = await hashPassword(trimmed);

    let isValid = false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('verify_seller_password', {
          p_hash: inputHash,
        });

        if (!rpcError && typeof rpcResult === 'boolean') {
          isValid = rpcResult;
        } else {
          const { data, error } = await supabase
            .from('store_settings')
            .select('value')
            .eq('key', 'seller_password_hash')
            .maybeSingle();

          if (!error && data && data.value) {
            isValid = data.value === inputHash;
          }
        }
      } catch (err) {
        console.warn('Erro ao validar hash no Supabase:', err);
      }
    }

    if (!isValid) {
      const localHash = localStorage.getItem(LOCAL_STORAGE_PASSWORD_HASH_KEY);
      if (localHash && localHash === inputHash) {
        isValid = true;
      }
    }

    if (isValid) {
      clearRateLimit();
      createSecureSession();
      return true;
    } else {
      const lockStatus = recordFailedAttempt();
      if (lockStatus.isLocked) {
        throw new Error(
          `Você atingiu 5 tentativas incorretas. O acesso foi bloqueado por segurança por 5 minutos.`
        );
      }
      return false;
    }
  },

  // Verifica se a sessão está autenticada e não expirou
  isAuthenticated(): boolean {
    return isSecureSessionValid();
  },

  // Encerra a sessão da vendedora destruindo tokens e chaves temporárias
  logout(): void {
    destroySecureSession();
  },
};
