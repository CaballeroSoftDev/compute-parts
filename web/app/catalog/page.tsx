'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFavorites } from '@/lib/favorites-context';
import { useToast } from '@/hooks/use-toast';
import type { CatalogProduct, CatalogFilters } from '@/lib/interfaces/catalog';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductCardSkeleton } from '@/components/catalog/ProductCardSkeleton';
import { CatalogService } from '@/lib/utils/catalog-service';
import { CatalogFiltersProvider, useCatalogFilters } from '@/lib/catalog-filters-context';

function CatalogContent() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  const { filters, updateFilters, clearFilters } = useCatalogFilters();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { toast } = useToast();

  // Cargar productos desde la base de datos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const catalogProducts = await CatalogService.getCatalogProducts();

        if (catalogProducts.length === 0) {
          setError('No se encontraron productos disponibles');
        } else {
          setProducts(catalogProducts);
        }
      } catch (err) {
        console.error('Error loading catalog products:', err);
        setError('Error al cargar los productos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !filters.searchTerm ||
      product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const matchesPrice = productPrice >= filters.priceRange[0] && productPrice <= filters.priceRange[1];

    const matchesCategory =
      filters.selectedCategories.length === 0 || filters.selectedCategories.includes(product.category);

    const matchesBrand = filters.selectedBrands.length === 0 || filters.selectedBrands.includes(product.brand);

    return matchesSearch && matchesPrice && matchesCategory && matchesBrand;
  });

  // Calcular productos para la página actual
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Resetear a la primera página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Funciones de paginación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const currentPageNum = currentPage;

    // Mostrar máximo 5 páginas
    let startPage = Math.max(1, currentPageNum - 2);
    let endPage = Math.min(totalPages, currentPageNum + 2);

    // Ajustar si estamos cerca del inicio o final
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

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

  const handleFavoriteClick = async (product: CatalogProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isFavorite(product.id)) {
        const success = await removeFromFavorites(product.id);
        if (success) {
          toast({
            title: 'Eliminado de favoritos',
            description: `${product.name} se eliminó de tus favoritos`,
            variant: 'default',
          });
        }
      } else {
        const success = await addToFavorites(product.id);
        if (success) {
          toast({
            title: 'Agregado a favoritos',
            description: `${product.name} se agregó a tus favoritos`,
            variant: 'default',
          });
        }
      }
    } catch (error) {
      console.error('Error handling favorite click:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar tus favoritos',
        variant: 'destructive',
      });
    }
  };

  const handleFiltersChange = (newFilters: CatalogFilters) => {
    updateFilters(newFilters);
  };

  // Extraer categorías y marcas únicas de los productos
  const categories = products.length > 0 ? [...new Set(products.map((product) => product.category))].sort() : [];
  const brands = products.length > 0 ? [...new Set(products.map((product) => product.brand))].sort() : [];

  const handleClearAllFilters = () => {
    clearFilters();
  };

  // Mostrar loading
  if (loading) {
    return (
      <MainLayout>
        <div className="container py-6 md:py-8">
          <div className="mb-6">
            <Skeleton className="mb-4 h-8 w-64" />
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
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
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="mb-4 text-red-600">{error}</p>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
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
          <p className="text-gray-600">
            Explora nuestra amplia selección de componentes de computadora de las mejores marcas del mercado.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado
              {filteredProducts.length !== 1 ? 's' : ''}
              {totalPages > 1 && (
                <span className="ml-2">
                  • Página {currentPage} de {totalPages}
                </span>
              )}
            </p>
            {(filters.searchTerm || filters.selectedCategories.length > 0 || filters.selectedBrands.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllFilters}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              brands={brands}
              showMobileFilters={showFilters}
              onCloseMobileFilters={() => setShowFilters(false)}
            />
          </div>

          {/* Productos */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <p className="mb-2 text-lg font-semibold text-gray-700">No se encontraron productos</p>
                  <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {currentProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={isFavorite(product.id)}
                      onFavoriteClick={handleFavoriteClick}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Mostrando {indexOfFirstProduct + 1} a {Math.min(indexOfLastProduct, filteredProducts.length)} de{' '}
                      {filteredProducts.length} productos
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToFirstPage}
                        disabled={currentPage <= 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {getPageNumbers().map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage >= totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToLastPage}
                        disabled={currentPage >= totalPages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function CatalogPage() {
  return (
    <CatalogFiltersProvider>
      <CatalogContent />
    </CatalogFiltersProvider>
  );
}
