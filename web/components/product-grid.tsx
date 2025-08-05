'use client';

import type React from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/lib/favorites-context';

// Datos de ejemplo
const products = [
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
];

export function ProductGrid() {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleFavoriteClick = (product: (typeof products)[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        category: product.category,
        image: product.image,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
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
              className={`absolute right-2 top-2 z-20 rounded-full bg-white/80 backdrop-blur-sm ${
                isFavorite(product.id) ? 'text-red-500 hover:text-red-700' : 'text-gray-400 hover:text-red-500'
              }`}
              onClick={(e) => handleFavoriteClick(product, e)}
              aria-label={isFavorite(product.id) ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
            >
              <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <div className="p-4">
            <p className="mb-1 text-xs text-gray-500">{product.category}</p>
            <h3 className="line-clamp-2 text-sm font-medium text-black">{product.name}</h3>
            <p className="mt-1 text-xs text-gray-500">{product.brand}</p>
            <p className="mt-2 font-bold text-black">MX${product.price.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
