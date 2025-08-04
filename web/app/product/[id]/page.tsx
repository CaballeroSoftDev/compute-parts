'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/MainLayout';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, Star, Truck, Clock, Shield, Loader2 } from 'lucide-react';
import { useFavorites } from '@/lib/favorites-context';
import { useCart } from '@/lib/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { CatalogService } from '@/lib/utils/catalog-service';
import { ImageHelper } from '@/lib/utils/image-helper';
import type { CatalogProduct } from '@/lib/interfaces/catalog';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToCart, isUpdating } = useCart();
  const { toast } = useToast();

  // Resolver los parámetros de la URL
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  // Cargar datos del producto
  useEffect(() => {
    const loadProduct = async () => {
      if (!resolvedParams) return;

      try {
        setLoading(true);
        setError(null);

        // Obtener todos los productos del catálogo
        const catalogProducts = await CatalogService.getCatalogProducts();

        // Buscar el producto específico por ID
        const foundProduct = catalogProducts.find((p) => p.id === resolvedParams.id);

        if (!foundProduct) {
          setError('Producto no encontrado');
          return;
        }

        setProduct(foundProduct);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Error al cargar los datos del producto. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [resolvedParams]);

  const nextImage = () => {
    if (!product) return;
    setCurrentImage((prev) => (prev + 1) % (product.images?.length || 1));
  };

  const prevImage = () => {
    if (!product) return;
    const imageCount = product.images?.length || 1;
    setCurrentImage((prev) => (prev - 1 + imageCount) % imageCount);
  };

  const selectImage = (index: number) => {
    setCurrentImage(index);
  };

  const increaseQuantity = () => {
    if (quantity < 10) {
      // Límite máximo de 10
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product) return;

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

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart({
        product_id: product.id,
        quantity: quantity,
      });
    } catch (error) {
      console.error('Error agregando al carrito:', error);
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <MainLayout>
        <div className="container py-6 md:py-10">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
              <p className="text-gray-500">Cargando producto...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Mostrar error
  if (error || !product) {
    return (
      <MainLayout>
        <div className="container py-6 md:py-10">
          <div className="mb-6">
            <Link
              href="/catalog"
              className="inline-flex items-center text-sm text-[#007BFF] hover:underline"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Volver al catálogo
            </Link>
          </div>
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="mb-4 text-red-600">{error || 'Producto no encontrado'}</p>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Preparar imágenes del producto
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <MainLayout>
      <div className="container py-6 md:py-10">
        <div className="mb-6">
          <Link
            href="/catalog"
            className="inline-flex items-center text-sm text-[#007BFF] hover:underline"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver al catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src={ImageHelper.getValidImageUrl(productImages[currentImage])}
                alt={product.name}
                fill
                className="object-contain"
              />
              {productImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm"
                    onClick={prevImage}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm"
                    onClick={nextImage}
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border ${
                      currentImage === index ? 'border-[#007BFF] ring-2 ring-[#007BFF]' : 'border-gray-200'
                    }`}
                    onClick={() => selectImage(index)}
                  >
                    <Image
                      src={ImageHelper.getValidImageUrl(image)}
                      alt={`${product.name} - Vista ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500">
                {product.category} / {product.brand}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-black md:text-3xl">{product.name}</h1>

              <div className="mt-2 flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">4.5 (24 reseñas)</span>
              </div>

              <p className="mt-4 text-3xl font-bold text-black">
                MX${(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toLocaleString()}
              </p>

              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Truck className="mr-2 h-4 w-4 text-green-600" />
                <span>Envío gratis en tu primera compra</span>
              </div>

              <div className="mt-2 flex items-center text-sm text-gray-600">
                <Clock className="mr-2 h-4 w-4 text-[#007BFF]" />
                <span>Disponible para recogida en tienda en 2 días hábiles</span>
              </div>

              <div className="mt-2 flex items-center text-sm text-gray-600">
                <Shield className="mr-2 h-4 w-4 text-[#007BFF]" />
                <span>Garantía de 1 año</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Cantidad</span>
                <div className="flex items-center rounded-md border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-10 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={increaseQuantity}
                    disabled={quantity >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1 bg-[#007BFF] hover:bg-[#0056b3]"
                  onClick={handleAddToCart}
                  disabled={isUpdating(product.id)}
                >
                  {isUpdating(product.id) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Agregar al carrito
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 border-[#007BFF] bg-transparent ${
                    isFavorite(product.id)
                      ? 'border-red-500 text-red-500 hover:text-red-700'
                      : 'text-[#007BFF] hover:text-[#0056b3]'
                  }`}
                  onClick={handleFavoriteClick}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                  {isFavorite(product.id) ? 'En favoritos' : 'Añadir a favoritos'}
                </Button>
              </div>
            </div>

            <div className="pt-4">
              <Tabs defaultValue="description">
                <TabsList className="w-full">
                  <TabsTrigger
                    value="description"
                    className="flex-1"
                  >
                    Descripción
                  </TabsTrigger>
                  <TabsTrigger
                    value="specifications"
                    className="flex-1"
                  >
                    Especificaciones
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="description"
                  className="mt-4 text-sm leading-relaxed text-gray-700"
                >
                  <p>
                    {product.description ||
                      `Descubre el ${product.name} de ${product.brand}, 
                    una excelente opción en la categoría de ${product.category}. 
                    Este producto ofrece calidad y rendimiento excepcionales para tus necesidades.`}
                  </p>
                </TabsContent>
                <TabsContent
                  value="specifications"
                  className="mt-4"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex justify-between border-b py-2">
                      <span className="text-sm font-medium">Marca</span>
                      <span className="text-sm text-gray-600">{product.brand}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                      <span className="text-sm font-medium">Categoría</span>
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                      <span className="text-sm font-medium">Precio</span>
                      <span className="text-sm text-gray-600">
                        MX$
                        {(typeof product.price === 'string'
                          ? parseFloat(product.price)
                          : product.price
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                      <span className="text-sm font-medium">ID del producto</span>
                      <span className="text-sm text-gray-600">{product.id}</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Productos relacionados - Por ahora oculto hasta implementar la funcionalidad */}
        {/* 
        <div className="mt-12 border-t pt-8">
          <h2 className="mb-6 text-xl font-bold">Productos relacionados</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Implementar productos relacionados */}
        {/* </div> */}
        {/* </div> */}
      </div>
    </MainLayout>
  );
}
