import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar produto por nome ou descrição...',
}) => {
  return (
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 bg-white border border-[#eae4de] rounded-xl text-sm text-[#222222] placeholder-[#666666]/70 focus:outline-none focus:border-[#a66e58] focus:ring-1 focus:ring-[#a66e58] transition-all shadow-sm"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#222222] p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
