import { supabase, isSupabaseConfigured } from './supabase';
import { STORE_CONFIG } from '../config/store';

const LOCAL_STORAGE_WHATSAPP_KEY = 'aura_store_whatsapp';

// Higieniza o número de telefone para o formato aceito pelo WhatsApp internacional (ex: 5511999999999)
export function sanitizeWhatsAppPhone(phone: string): string {
  // Remove tudo que não for dígito
  let digits = phone.replace(/\D/g, '');

  // Se tiver 10 ou 11 dígitos (DDD + número), adiciona o DDI do Brasil (55)
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  return digits || STORE_CONFIG.phoneWhatsapp;
}

export const settingsService = {
  // Obtém o número de forma síncrona para renderização instantânea de botões
  getWhatsAppPhoneSync(): string {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_WHATSAPP_KEY);
      if (local && local.trim()) {
        return sanitizeWhatsAppPhone(local);
      }
    } catch {
      // Ignore
    }
    return STORE_CONFIG.phoneWhatsapp;
  },

  // Busca o telefone do Supabase com fallback local
  async fetchWhatsAppPhone(): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'whatsapp_phone')
          .maybeSingle();

        if (!error && data && data.value) {
          const clean = sanitizeWhatsAppPhone(data.value);
          localStorage.setItem(LOCAL_STORAGE_WHATSAPP_KEY, clean);
          return clean;
        }
      } catch (err) {
        console.warn('Erro ao carregar WhatsApp do Supabase:', err);
      }
    }

    return this.getWhatsAppPhoneSync();
  },

  // Salva o novo número de WhatsApp
  async updateWhatsAppPhone(newPhone: string): Promise<string> {
    const cleanPhone = sanitizeWhatsAppPhone(newPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new Error('Informe um número de WhatsApp válido com DDD (ex: 11 99999-9999).');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('store_settings').upsert({
          key: 'whatsapp_phone',
          value: cleanPhone,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      } catch (err) {
        console.warn('Erro ao salvar WhatsApp no Supabase, salvando localmente:', err);
      }
    }

    localStorage.setItem(LOCAL_STORAGE_WHATSAPP_KEY, cleanPhone);
    return cleanPhone;
  },
};
