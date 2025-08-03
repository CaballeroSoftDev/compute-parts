'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BrandsService, type Brand } from '@/lib/services/brands-service';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [featuredBrands, setFeaturedBrands] = useState<Brand[]>([]);
  const [topBrands, setTopBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Brand[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  // Cargar marcas desde la base de datos
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        setError(null);

        const [allBrands, featured] = await Promise.all([
          BrandsService.getBrands(),
          BrandsService.getFeaturedBrands(6),
        ]);

        setBrands(allBrands);
        setFeaturedBrands(featured);
        
        // Obtener las 10 marcas principales (con más productos)
        const topBrands = allBrands
          .sort((a, b) => b.product_count - a.product_count)
          .slice(0, 10);
        setTopBrands(topBrands);
      } catch (err) {
        console.error('Error loading brands:', err);
        setError('Error al cargar las marcas. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  // Buscar marcas cuando cambie el término de búsqueda
  useEffect(() => {
    const searchBrands = async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await BrandsService.searchBrands(searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching brands:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce para evitar demasiadas búsquedas
    const timeoutId = setTimeout(searchBrands, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Función para generar URL del catálogo con filtro de marca
  const getCatalogUrlWithBrandFilter = (brandName: string) => {
    const params = new URLSearchParams();
    params.set('brands', brandName);
    return `/catalog?${params.toString()}`;
  };

  // Mostrar loading
  if (loading) {
    return (
      <MainLayout>
        <div className="container py-6 md:py-8">
          <div className="mb-6">
            <h1 className="mb-4 text-2xl font-bold text-black">Nuestras Marcas</h1>
            <p className="mb-6 text-gray-600">
              Trabajamos con las mejores marcas del mercado para ofrecerte componentes de alta calidad y rendimiento.
            </p>
            <div className="relative">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="mb-12">
            <Skeleton className="mb-6 h-8 w-48" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col items-center p-6 text-center">
                      <Skeleton className="mb-4 h-16 w-full" />
                      <Skeleton className="mb-2 h-6 w-24" />
                      <Skeleton className="mb-4 h-16 w-full" />
                      <Skeleton className="mb-4 h-4 w-32" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="mb-6 h-8 w-48" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center rounded-lg border p-4"
                >
                  <Skeleton className="mb-3 h-12 w-full" />
                  <Skeleton className="mb-1 h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
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
          <h1 className="mb-4 text-2xl font-bold text-black">Nuestras Marcas</h1>
          <p className="mb-6 text-gray-600">
            Trabajamos con las mejores marcas del mercado para ofrecerte componentes de alta calidad y rendimiento.
          </p>
        </div>

        {/* Marcas destacadas */}
        {featuredBrands.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Marcas Destacadas</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {featuredBrands.map((brand) => (
                <Card
                  key={brand.id}
                  className="overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col items-center p-6 text-center">
                      <div className="relative mb-4 h-16 w-full">
                        <Image
                          src={BrandsService.getValidImageUrl(brand.logo_url || null)}
                          alt={`Logo de ${brand.name}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h3 className="mb-2 text-xl font-bold">{brand.name}</h3>
                      <p className="mb-4 text-gray-600">{brand.description}</p>
                      <p className="mb-4 text-sm text-gray-500">
                        {brand.product_count} producto{brand.product_count !== 1 ? 's' : ''} disponible
                        {brand.product_count !== 1 ? 's' : ''}
                      </p>
                      <Link href={getCatalogUrlWithBrandFilter(brand.name)}>
                        <Button className="bg-[#007BFF] hover:bg-[#0056b3]">Ver Productos</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Principales marcas con búsqueda integrada */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Principales Marcas</h2>
          
          {/* Barra de búsqueda (solo visible cuando se activa) */}
          {showSearch && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar marcas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Contenido de marcas */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {/* Mostrar marcas principales cuando no hay búsqueda activa */}
            {!showSearch && !searchTerm && topBrands.map((brand, index) => (
              <Link
                key={brand.id}
                href={getCatalogUrlWithBrandFilter(brand.name)}
                className="group flex flex-col items-center rounded-lg border p-4 transition-all hover:border-[#007BFF] hover:shadow-md"
              >
                <div className="relative mb-3 h-12 w-full">
                  <Image
                    src={BrandsService.getValidImageUrl(brand.logo_url || null)}
                    alt={`Logo de ${brand.name}`}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-medium group-hover:text-[#007BFF]">{brand.name}</span>
                <span className="text-xs text-gray-500">
                  {brand.product_count} producto{brand.product_count !== 1 ? 's' : ''}
                </span>
              </Link>
            ))}

            {/* Mostrar mensaje de búsqueda en la última posición cuando no hay búsqueda activa */}
            {!showSearch && !searchTerm && (
              <div 
                className="group flex flex-col items-center rounded-lg border-2 border-dashed border-gray-300 p-4 transition-all hover:border-[#007BFF] hover:shadow-md cursor-pointer"
                onClick={() => setShowSearch(true)}
              >
                <Search className="mb-3 h-8 w-8 text-gray-400 group-hover:text-[#007BFF]" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-[#007BFF]">¿No encontraste tu marca?</span>
                <span className="text-xs text-gray-500 text-center">Haz clic para buscar</span>
              </div>
            )}

            {/* Mostrar resultados de búsqueda */}
            {searchTerm && searchResults.map((brand) => (
              <Link
                key={brand.id}
                href={getCatalogUrlWithBrandFilter(brand.name)}
                className="group flex flex-col items-center rounded-lg border p-4 transition-all hover:border-[#007BFF] hover:shadow-md"
              >
                <div className="relative mb-3 h-12 w-full">
                  <Image
                    src={BrandsService.getValidImageUrl(brand.logo_url || null)}
                    alt={`Logo de ${brand.name}`}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-medium group-hover:text-[#007BFF]">{brand.name}</span>
                <span className="text-xs text-gray-500">
                  {brand.product_count} producto{brand.product_count !== 1 ? 's' : ''}
                </span>
              </Link>
            ))}

            {/* Mostrar loading durante búsqueda */}
            {isSearching && (
              <div className="col-span-full flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <Skeleton className="mx-auto mb-4 h-8 w-32" />
                  <Skeleton className="mx-auto h-4 w-48" />
                </div>
              </div>
            )}

            {/* Mostrar mensaje cuando no se encuentran resultados */}
            {searchTerm && !isSearching && searchResults.length === 0 && (
              <div className="col-span-full flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <p className="mb-2 text-lg font-semibold text-gray-700">No se encontraron marcas</p>
                  <p className="text-gray-500">Intenta con otro término de búsqueda</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('');
                      setShowSearch(false);
                    }}
                  >
                    Volver a las principales marcas
                  </Button>
                </div>
              </div>
            )}

            {/* Mostrar botón para volver cuando hay resultados */}
            {searchTerm && !isSearching && searchResults.length > 0 && (
              <div className="col-span-full flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setShowSearch(false);
                  }}
                >
                  Volver a las principales marcas
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-16 rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-bold">¿Por qué elegimos estas marcas?</h2>
          <p className="mb-4 text-gray-700">
            En Compu Parts nos aseguramos de trabajar únicamente con marcas reconocidas por su calidad, innovación y
            servicio post-venta. Todos nuestros productos cuentan con garantía oficial y soporte técnico especializado.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 rounded-full bg-blue-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#007BFF]"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="mb-2 font-medium">Garantía Oficial</h3>
              <p className="text-sm text-gray-600">
                Todos nuestros productos cuentan con garantía oficial del fabricante.
              </p>
            </div>
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 rounded-full bg-blue-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#007BFF]"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h3 className="mb-2 font-medium">Productos Originales</h3>
              <p className="text-sm text-gray-600">Garantizamos la autenticidad de todos nuestros productos.</p>
            </div>
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 rounded-full bg-blue-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#007BFF]"
                >
                  <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h3.9" />
                  <path d="M2 10h20" />
                  <path d="M7 15h0" />
                  <path d="M11 15h0" />
                  <path d="M16 15h0" />
                  <path d="M7 19h0" />
                  <path d="M11 19h0" />
                  <path d="M16 19h0" />
                  <path d="M10 2v4" />
                  <path d="M14 2v4" />
                  <path d="M8 2h8" />
                </svg>
              </div>
              <h3 className="mb-2 font-medium">Soporte Técnico</h3>
              <p className="text-sm text-gray-600">Contamos con técnicos especializados para resolver tus dudas.</p>
            </div>
          </div>
        </div>

        {/* Convertirse en distribuidor */}
        <div className="mt-12 rounded-lg border p-6">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="md:w-2/3">
              <h2 className="mb-2 text-xl font-bold">¿Eres distribuidor?</h2>
              <p className="mb-4 text-gray-700">
                Si representas a una marca y estás interesado en distribuir tus productos a través de Compu Parts,
                contáctanos para conocer nuestro programa de partners.
              </p>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="border-[#007BFF] bg-transparent text-[#007BFF]"
                >
                  Contactar <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex justify-center md:w-1/3">
              <div className="relative h-40 w-40">
                <Image
                  src="/placeholder.svg"
                  alt="Programa de distribuidores"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
