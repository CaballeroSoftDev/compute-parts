'use client';

import type React from 'react';
import { createContext, useContext } from 'react';
import type { Category, Brand } from '@/lib/types';
import { useCrud } from '@/lib/hooks/use-crud';

interface AdminContextType {
  categories: Category[];
  brands: Brand[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'productCount'>) => void;
  updateCategory: (id: number, category: Partial<Category>) => void;
  deleteCategory: (id: number) => void;
  addBrand: (brand: Omit<Brand, 'id' | 'createdAt' | 'productCount'>) => void;
  updateBrand: (id: number, brand: Partial<Brand>) => void;
  deleteBrand: (id: number) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Tarjetas Gráficas',
    description: 'Tarjetas de video para gaming y diseño',
    createdAt: '2024-01-01',
    productCount: 15,
  },
  {
    id: 2,
    name: 'Procesadores',
    description: 'CPUs Intel y AMD',
    createdAt: '2024-01-02',
    productCount: 12,
  },
];

const INITIAL_BRANDS: Brand[] = [
  {
    id: 1,
    name: 'NVIDIA',
    description: 'Líder en tarjetas gráficas y tecnología AI',
    website: 'https://nvidia.com',
    createdAt: '2024-01-01',
    productCount: 8,
  },
  {
    id: 2,
    name: 'AMD',
    description: 'Procesadores y tarjetas gráficas de alto rendimiento',
    website: 'https://amd.com',
    createdAt: '2024-01-02',
    productCount: 12,
  },
];

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const categoryCrud = useCrud(INITIAL_CATEGORIES, 'admin-categories', 'Categoría');
  const brandCrud = useCrud(INITIAL_BRANDS, 'admin-brands', 'Marca');

  const contextValue: AdminContextType = {
    categories: categoryCrud.items,
    brands: brandCrud.items,
    addCategory: (data) => categoryCrud.create({ ...data, productCount: 0 }),
    updateCategory: categoryCrud.update,
    deleteCategory: categoryCrud.remove,
    addBrand: (data) => brandCrud.create({ ...data, productCount: 0 }),
    updateBrand: brandCrud.update,
    deleteBrand: brandCrud.remove,
  };

  return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
