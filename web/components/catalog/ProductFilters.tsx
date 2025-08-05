'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import type { CatalogFilters } from '@/lib/interfaces/catalog';

interface ProductFiltersProps {
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
  categories: string[];
  brands: string[];
  showMobileFilters: boolean;
  onCloseMobileFilters: () => void;
}

export function ProductFilters({
  filters,
  onFiltersChange,
  categories,
  brands,
  showMobileFilters,
  onCloseMobileFilters,
}: ProductFiltersProps) {
  const updateFilters = (updates: Partial<CatalogFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.selectedCategories.includes(category)
      ? filters.selectedCategories.filter((c) => c !== category)
      : [...filters.selectedCategories, category];
    updateFilters({ selectedCategories: newCategories });
  };

  const toggleBrand = (brand: string) => {
    const newBrands = filters.selectedBrands.includes(brand)
      ? filters.selectedBrands.filter((b) => b !== brand)
      : [...filters.selectedBrands, brand];
    updateFilters({ selectedBrands: newBrands });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      priceRange: [0, 20000],
      selectedCategories: [],
      selectedBrands: [],
    });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-medium">Rango de Precio</h3>
        <div className="px-2">
          <Slider
            defaultValue={[0, 20000]}
            max={20000}
            step={100}
            value={filters.priceRange}
            onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
            className="mb-6"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm">MX${filters.priceRange[0].toLocaleString()}</span>
            <span className="text-sm">MX${filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-medium">Categorías</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`category-${category}`}
                checked={filters.selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-medium">Marcas</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div
              key={brand}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label
                htmlFor={`brand-${brand}`}
                className="text-sm"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full bg-transparent"
        onClick={clearFilters}
      >
        Limpiar Filtros
      </Button>
    </div>
  );

  return (
    <>
      {/* Filtros para escritorio */}
      <div className="hidden w-64 shrink-0 md:block">
        <div className="sticky top-24">
          <FilterContent />
        </div>
      </div>

      {/* Filtros móviles */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white p-6 md:hidden">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Filtros</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseMobileFilters}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <FilterContent />

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={clearFilters}
            >
              Limpiar
            </Button>
            <Button
              className="flex-1 bg-[#007BFF] hover:bg-[#0056b3]"
              onClick={onCloseMobileFilters}
            >
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
