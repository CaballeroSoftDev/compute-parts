'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CatalogFilters } from '@/lib/interfaces/catalog';

interface CatalogFiltersContextType {
  filters: CatalogFilters;
  setFilters: (filters: CatalogFilters) => void;
  updateFilters: (updates: Partial<CatalogFilters>) => void;
  clearFilters: () => void;
  setBrandFilter: (brandId: string, brandName: string) => void;
}

const CatalogFiltersContext = createContext<CatalogFiltersContextType | undefined>(undefined);

export function CatalogFiltersProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<CatalogFilters>({
    searchTerm: '',
    priceRange: [0, 20000],
    selectedCategories: [],
    selectedBrands: [],
  });

  // Inicializar filtros desde URL params
  useEffect(() => {
    const brandFilter = searchParams.get('brand');
    const searchTerm = searchParams.get('search') || '';
    const categories = searchParams.get('categories')?.split(',') || [];
    const brands = searchParams.get('brands')?.split(',') || [];
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const newFilters: CatalogFilters = {
      searchTerm,
      priceRange: [
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 20000,
      ],
      selectedCategories: categories.filter(Boolean),
      selectedBrands: brands.filter(Boolean),
    };

    setFilters(newFilters);
  }, [searchParams]);

  const updateFilters = (updates: Partial<CatalogFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    
    // Actualizar URL params
    const params = new URLSearchParams();
    if (newFilters.searchTerm) params.set('search', newFilters.searchTerm);
    if (newFilters.selectedCategories.length > 0) params.set('categories', newFilters.selectedCategories.join(','));
    if (newFilters.selectedBrands.length > 0) params.set('brands', newFilters.selectedBrands.join(','));
    if (newFilters.priceRange[0] > 0) params.set('minPrice', newFilters.priceRange[0].toString());
    if (newFilters.priceRange[1] < 20000) params.set('maxPrice', newFilters.priceRange[1].toString());
    
    const queryString = params.toString();
    const newUrl = queryString ? `/catalog?${queryString}` : '/catalog';
    router.replace(newUrl, { scroll: false });
  };

  const clearFilters = () => {
    const defaultFilters: CatalogFilters = {
      searchTerm: '',
      priceRange: [0, 20000],
      selectedCategories: [],
      selectedBrands: [],
    };
    setFilters(defaultFilters);
    router.replace('/catalog', { scroll: false });
  };

  const setBrandFilter = (brandId: string, brandName: string) => {
    const newFilters: CatalogFilters = {
      searchTerm: '',
      priceRange: [0, 20000],
      selectedCategories: [],
      selectedBrands: [brandName],
    };
    setFilters(newFilters);
    
    // Actualizar URL con el filtro de marca
    const params = new URLSearchParams();
    params.set('brands', brandName);
    router.replace(`/catalog?${params.toString()}`, { scroll: false });
  };

  return (
    <CatalogFiltersContext.Provider
      value={{
        filters,
        setFilters,
        updateFilters,
        clearFilters,
        setBrandFilter,
      }}
    >
      {children}
    </CatalogFiltersContext.Provider>
  );
}

export function useCatalogFilters() {
  const context = useContext(CatalogFiltersContext);
  if (context === undefined) {
    throw new Error('useCatalogFilters must be used within a CatalogFiltersProvider');
  }
  return context;
} 