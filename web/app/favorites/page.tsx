'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useFavorites } from '@/lib/favorites-context';
import { MainLayout } from '@/components/layout/MainLayout';

export default function FavoritesPage() {
  const { favorites, removeFromFavorites, clearFavorites, favoritesCount } = useFavorites();

  return (
    <MainLayout>
      <div className="container py-6 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Mis Favoritos</h1>
            <p className="mt-1 text-gray-600">
              {favoritesCount === 0
                ? 'No tienes productos favoritos'
                : `${favoritesCount} producto${favoritesCount !== 1 ? 's' : ''} guardado${favoritesCount !== 1 ? 's' : ''}`}
            </p>
          </div>

          {favoritesCount > 0 && (
            <Button
              variant="outline"
              onClick={clearFavorites}
              className="border-red-200 bg-transparent text-red-600 hover:border-red-300 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpiar favoritos
            </Button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">No tienes favoritos aún</h2>
            <p className="mb-6 max-w-md text-gray-500">
              Explora nuestro catálogo y guarda los productos que más te interesen haciendo clic en el corazón.
            </p>
            <Link href="/catalog">
              <Button className="bg-[#007BFF] hover:bg-[#0056b3]">Explorar Catálogo</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <Link
                  href={`/product/${product.id}`}
                  className="absolute inset-0 z-10"
                >
                  <span className="sr-only">Ver producto</span>
                </Link>

                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 z-20 rounded-full bg-white/80 text-red-500 backdrop-blur-sm hover:text-red-700"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromFavorites(product.id);
                    }}
                    aria-label="Eliminar de favoritos"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>

                <div className="p-4">
                  <p className="mb-1 text-xs text-gray-500">{product.category}</p>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium text-black">{product.name}</h3>
                  <p className="mb-2 text-xs text-gray-500">{product.brand}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-black">MX${product.price.toLocaleString()}</p>
                    <Button
                      size="sm"
                      className="z-20 h-8 bg-[#007BFF] px-3 hover:bg-[#0056b3]"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Aquí se podría agregar al carrito
                      }}
                    >
                      <ShoppingCart className="mr-1 h-3 w-3" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
