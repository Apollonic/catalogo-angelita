import React, { useState, useEffect } from 'react';
import { X, Save, MessageCircle, AlertCircle, ExternalLink, Phone } from 'lucide-react';
import { sanitizeWhatsAppPhone } from '../services/settingsService';

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhone: string;
  onSave: (newPhone: string) => Promise<void>;
}

export const WhatsAppSettingsModal: React.FC<WhatsAppSettingsModalProps> = ({
  isOpen,
  onClose,
  currentPhone,
  onSave,
}) => {
  const [phone, setPhone] = useState(currentPhone);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPhone(currentPhone);
    setError('');
  }, [currentPhone, isOpen]);

  if (!isOpen) return null;

  const cleanPhone = sanitizeWhatsAppPhone(phone);
  const testUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Olá! Teste de recebimento de mensagens do Catálogo da Angelita.'
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setError('Por favor, informe um número válido com DDD (mínimo de 10 dígitos, ex: 11999998888).');
      return;
    }

    setSaving(true);
    try {
      await onSave(phone);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar número do WhatsApp.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#eae4de] rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eae4de]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#25d366]">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#222222]">Número do WhatsApp</h2>
              <p className="text-[11px] text-[#666666]">
                Onde você receberá os pedidos das clientes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#888888] hover:text-[#222222] p-1 rounded-lg hover:bg-[#faf8f6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1.5">
              WhatsApp de Atendimento *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 99999-8888 ou 5511999998888"
                className="w-full pl-9 pr-3 py-2.5 bg-[#faf8f6] border border-[#eae4de] rounded-xl text-sm text-[#222222] focus:outline-none focus:border-[#a66e58] focus:bg-white transition-all font-medium"
                autoFocus
              />
            </div>
            <span className="text-[11px] text-[#888888] mt-1.5 block leading-relaxed">
              Dica: Digite seu DDD + número. O código do país (55 do Brasil) é adicionado automaticamente.
            </span>
          </div>

          {/* Teste do link de WhatsApp */}
          {cleanPhone.length >= 10 && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900">
                  Número limpo: +{cleanPhone}
                </span>
                <a
                  href={testUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                >
                  <span>Testar no WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[10px] text-emerald-700 leading-normal">
                Clique em "Testar" para abrir uma conversa de teste e confirmar que o número está correto.
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="pt-3 border-t border-[#eae4de] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-[#666666] hover:text-[#222222] hover:bg-[#faf8f6] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25d366] hover:bg-[#1ebe5d] disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar WhatsApp'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
