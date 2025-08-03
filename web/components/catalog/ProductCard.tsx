'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import type { CatalogProduct } from '@/lib/interfaces/catalog';
import { ImageHelper } from '@/lib/utils/image-helper';

interface ProductCardProps {
  product: CatalogProduct;
  isFavorite: boolean;
  onFavoriteClick: (product: CatalogProduct, e: React.MouseEvent) => void;
}

export function ProductCard({ product, isFavorite, onFavoriteClick }: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link
        href={`/product/${product.id}`}
        className="absolute inset-0 z-10"
      >
        <span className="sr-only">Ver producto</span>
      </Link>
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={ImageHelper.getValidImageUrl(product.image)}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <Button
          variant="ghost"
          size="icon"
          className={`absolute right-2 top-2 z-20 rounded-full bg-white/80 backdrop-blur-sm transition-colors ${
            isFavorite ? 'text-red-500 hover:text-red-700' : 'text-gray-400 hover:text-red-500'
          }`}
          onClick={(e) => onFavoriteClick(product, e)}
          aria-label={isFavorite ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </div>
      <div className="p-4">
        <div className="mb-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">{product.category}</p>
        </div>
        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900">{product.name}</h3>
        <p className="mb-2 text-xs text-gray-500">{product.brand}</p>
        <p className="text-lg font-bold text-[#007BFF]">
          MX${(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
