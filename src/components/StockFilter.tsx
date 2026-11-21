import React from 'react';

interface StockFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const StockFilter: React.FC<StockFilterProps> = ({ checked, onChange }) => {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-[#666666] cursor-pointer select-none py-1 hover:text-[#222222] transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-[#eae4de] accent-[#a66e58] cursor-pointer transition-colors"
      />
      <span>Mostrar apenas disponíveis</span>
    </label>
  );
};
