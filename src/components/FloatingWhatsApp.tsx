import React from 'react';
import { MessageCircle } from 'lucide-react';
import { createGeneralWhatsAppLink } from '../utils/whatsapp';

interface FloatingWhatsAppProps {
  label?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  label = 'Falar no WhatsApp',
}) => {
  const whatsappUrl = createGeneralWhatsAppLink();

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Atendimento no WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-semibold text-sm px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
    >
      <MessageCircle className="w-5 h-5 fill-current" />
      <span>{label}</span>
    </a>
  );
};
