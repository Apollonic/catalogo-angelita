import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { STORE_CONFIG } from '../config/store';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-[#eae4de] py-8 text-center text-xs text-[#666666] bg-white">
      <div className="max-w-5xl mx-auto px-4 space-y-3">
        <p>© {new Date().getFullYear()} {STORE_CONFIG.name}. Todos os direitos reservados.</p>
        <p className="text-[11px] text-[#888888]">
          Atendimento personalizado via WhatsApp • Pedidos e informações rápidas
        </p>

        {/* Link discreto para a vendedora */}
        <div className="pt-2">
          <Link
            to="/vendedora"
            className="inline-flex items-center gap-1.5 text-[11px] text-[#888888] hover:text-[#a66e58] hover:underline transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>Área da vendedora</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};
