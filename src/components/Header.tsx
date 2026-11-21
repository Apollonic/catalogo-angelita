import React from 'react';
import { Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '../config/store';

interface HeaderProps {
  name?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  name = STORE_CONFIG.name,
  subtitle = STORE_CONFIG.subtitle,
}) => {
  return (
    <header className="bg-white border-b border-[#eae4de] py-6 px-4 text-center">
      <div className="max-w-5xl mx-auto">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#faf8f6] border border-[#eae4de] text-[#a66e58] mb-2.5 shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#222222]">
          {name}
        </h1>
        <p className="text-sm sm:text-base text-[#666666] mt-1.5 max-w-xl mx-auto">
          {subtitle}
        </p>
      </div>
    </header>
  );
};
