import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="tablist"
      aria-label="Categorias de produtos"
    >
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-[#a66e58] text-white border border-[#a66e58] shadow-sm'
                : 'bg-white text-[#222222] border border-[#eae4de] hover:border-[#a66e58] hover:bg-[#faf8f6]'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};
