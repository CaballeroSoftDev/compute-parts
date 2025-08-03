'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFavorites } from '@/lib/favorites-context';
import type { CatalogProduct, CatalogFilters } from '@/lib/interfaces/catalog';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CatalogService } from '@/lib/utils/catalog-service';

export default function CatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CatalogFilters>({
    searchTerm: '',
    priceRange: [0, 20000],
    selectedCategories: [],
    selectedBrands: [],
  });

  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  // Cargar productos desde la base de datos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const catalogProducts = await CatalogService.getCatalogProducts();
        setProducts(catalogProducts);
      } catch (err) {
        console.error('Error loading catalog products:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch = !filters.searchTerm || 
      product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];

    const matchesCategory = filters.selectedCategories.length === 0 || 
      filters.selectedCategories.includes(product.category);

    const matchesBrand = filters.selectedBrands.length === 0 || 
      filters.selectedBrands.includes(product.brand);

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

  // Mostrar loading
  if (loading) {
    return (
      <MainLayout>
        <div className="container py-6 md:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF] mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <MainLayout>
        <div className="container py-6 md:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6 md:py-8">
        <div className="mb-6">
          <h1 className="mb-4 text-2xl font-bold text-black">Catálogo de Productos</h1>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="pr-4"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filtros */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearAllFilters}
              products={products}
            />
          </div>

          {/* Productos */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {filteredProducts.length} de {products.length} productos
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <p className="mb-2 text-lg font-semibold text-gray-700">
                    No se encontraron productos
                  </p>
                  <p className="text-gray-500">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                  <Button onClick={clearAllFilters} className="mt-4">
                    Limpiar filtros
                  </Button>
                </div>
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