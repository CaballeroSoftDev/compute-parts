'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFavorites } from '@/lib/favorites-context';
import type { CatalogProduct, CatalogFilters } from '@/lib/interfaces/catalog';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { ProductCard } from '@/components/catalog/ProductCard';

// Datos de ejemplo
const products: CatalogProduct[] = [
  {
    id: 1,
    name: 'Procesador Intel Core i7-12700K',
    price: 7999,
    brand: 'Intel',
    category: 'Procesadores',
    image: '/placeholder.svg?height=300&width=300',
  },
  {
    id: 2,
    name: 'Tarjeta Gráfica NVIDIA RTX 3080',
    price: 15999,
    brand: 'NVIDIA',
    category: 'Tarjetas Gráficas',
    image: '/placeholder.svg?height=300&width=300',
  },
  {
    id: 3,
    name: 'Memoria RAM Corsair Vengeance 16GB',
    price: 1499,
    brand: 'Corsair',
    category: 'Memorias',
    image: '/placeholder.svg?height=300&width=300',
  },
  {
    id: 4,
    name: 'SSD Samsung 970 EVO 1TB',
    price: 2499,
    brand: 'Samsung',
    category: 'Almacenamiento',
    image: '/placeholder.svg?height=300&width=300',
  },
  {
    id: 5,
    name: 'Placa Base ASUS ROG Strix Z690-E',
    price: 6799,
    brand: 'ASUS',
    category: 'Placas Base',
    image: '/placeholder.svg?height=300&width=300',
  },
  {
    id: 6,
    name: 'Fuente de Poder EVGA SuperNOVA 850W',
    price: 2299,
    brand: 'EVGA',
    category: 'Fuentes de Poder',
    image: '/placeholder.svg?height=300&width=300',
  },
  {
    id: 7,
    name: 'Gabinete NZXT H510',
    price: 1899,
    brand: 'NZXT',
    category: 'Gabinetes',
    image: '/placeholder.svg?height=300&width=300',
  },
  {
    id: 8,
    name: 'Monitor LG UltraGear 27" 144Hz',
    price: 5999,
    brand: 'LG',
    category: 'Monitores',
    image: '/placeholder.svg?height=300&width=300',
  },
];

const categories = [
  'Procesadores',
  'Tarjetas Gráficas',
  'Memorias',
  'Almacenamiento',
  'Placas Base',
  'Fuentes de Poder',
  'Gabinetes',
  'Monitores',
];

const brands = ['Intel', 'NVIDIA', 'Corsair', 'Samsung', 'ASUS', 'EVGA', 'NZXT', 'LG'];

export default function CatalogPage() {
  const [filters, setFilters] = useState<CatalogFilters>({
    searchTerm: '',
    priceRange: [0, 20000],
    selectedCategories: [],
    selectedBrands: [],
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
    const matchesCategory =
      filters.selectedCategories.length === 0 || filters.selectedCategories.includes(product.category);
    const matchesBrand = filters.selectedBrands.length === 0 || filters.selectedBrands.includes(product.brand);

    return matchesSearch && matchesPrice && matchesCategory && matchesBrand;
  });

  // Función para convertir CatalogProduct a Product
  const convertToProduct = (catalogProduct: CatalogProduct) => {
    return {
      id: catalogProduct.id,
      name: catalogProduct.name,
      description: `${catalogProduct.brand} - ${catalogProduct.category}`,
      category: catalogProduct.category,
      brand: catalogProduct.brand,
      price: catalogProduct.price,
      stock: 10, // Valor por defecto
      status: 'Activo' as const,
      image: catalogProduct.image,
      featured: false, // Valor por defecto
      createdAt: new Date().toISOString(), // Valor por defecto
    };
  };

  const handleFavoriteClick = (product: CatalogProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(convertToProduct(product));
    }
  };

  const handleFiltersChange = (newFilters: CatalogFilters) => {
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      priceRange: [0, 20000],
      selectedCategories: [],
      selectedBrands: [],
    });
  };

  return (
    <MainLayout>
      <div className="container py-6 md:py-8">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-black">Catálogo de Productos</h1>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative w-full">
              <Input
                placeholder="Buscar productos..."
                className="pl-4"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              />
            </div>
            <Button
              variant="outline"
              className="w-full bg-transparent sm:w-auto md:hidden"
              onClick={() => setShowMobileFilters(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Filtros */}
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories}
            brands={brands}
            showMobileFilters={showMobileFilters}
            onCloseMobileFilters={() => setShowMobileFilters(false)}
          />

          {/* Lista de productos */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="mb-2 text-lg font-medium">No se encontraron productos</p>
                <p className="mb-4 text-gray-500">Intenta con otros filtros o términos de búsqueda</p>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                >
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={isFavorite(product.id)}
                    onFavoriteClick={handleFavoriteClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
