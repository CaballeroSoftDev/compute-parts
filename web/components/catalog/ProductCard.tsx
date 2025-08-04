'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Plus } from 'lucide-react';
import type { CatalogProduct } from '@/lib/interfaces/catalog';
import { ImageHelper } from '@/lib/utils/image-helper';
import { useCart } from '@/lib/hooks/use-cart';

interface ProductCardProps {
  product: CatalogProduct;
  isFavorite: boolean;
  onFavoriteClick: (product: CatalogProduct, e: React.MouseEvent) => void;
}

export function ProductCard({ product, isFavorite, onFavoriteClick }: ProductCardProps) {
  const { addToCart, isUpdating } = useCart();
  const isProductUpdating = isUpdating(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart({
        product_id: product.id,
        quantity: 1,
      });
    } catch (error) {
      console.error('Error agregando al carrito:', error);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Link solo para la imagen */}
      <Link
        href={`/product/${product.id}`}
        className="block"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <Image
            src={ImageHelper.getValidImageUrl(product.image)}
            alt={product.name}
            fill
            className="object-contain transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-2 top-2 z-30 rounded-full bg-white/80 backdrop-blur-sm transition-colors ${
              isFavorite ? 'text-red-500 hover:text-red-700' : 'text-gray-400 hover:text-red-500'
            }`}
            onClick={(e) => onFavoriteClick(product, e)}
            aria-label={isFavorite ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </Link>
      
      {/* Contenido del producto */}
      <div className="p-4">
        <div className="mb-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">{product.category}</p>
        </div>
        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900">{product.name}</h3>
        <p className="mb-2 text-xs text-gray-500">{product.brand}</p>
        <p className="text-lg font-bold text-[#007BFF]">
          MX${(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toLocaleString()}
        </p>
        <Button
          onClick={handleAddToCart}
          disabled={isProductUpdating}
          className="mt-2 w-full bg-[#007BFF] hover:bg-[#0056b3] text-white"
          size="sm"
        >
          {isProductUpdating ? (
            <>
              <Plus className="mr-2 h-4 w-4 animate-spin" />
              Agregando...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Agregar al carrito
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
