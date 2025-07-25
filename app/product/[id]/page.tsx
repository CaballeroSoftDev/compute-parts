"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, Star, Truck, Clock, Shield } from "lucide-react"

// Datos de ejemplo
const products = [
  {
    id: "1",
    name: "Procesador Intel Core i7-12700K",
    price: 7999,
    brand: "Intel",
    category: "Procesadores",
    description:
      "El procesador Intel Core i7-12700K de 12ª generación ofrece un rendimiento excepcional para gaming y multitarea. Con 12 núcleos (8P+4E) y 20 hilos, alcanza velocidades de hasta 5.0 GHz con Intel Turbo Boost Max Technology 3.0.",
    specifications: [
      { name: "Núcleos", value: "12 (8P+4E)" },
      { name: "Hilos", value: "20" },
      { name: "Frecuencia base", value: "3.6 GHz" },
      { name: "Frecuencia turbo", value: "Hasta 5.0 GHz" },
      { name: "Caché", value: "25 MB Intel Smart Cache" },
      { name: "TDP", value: "125W" },
      { name: "Socket", value: "LGA 1700" },
      { name: "Gráficos integrados", value: "Intel UHD Graphics 770" },
    ],
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    rating: 4.8,
    reviews: 124,
    stock: 15,
  },
]

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id) || products[0]
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const selectImage = (index: number) => {
    setCurrentImage(index)
  }

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-black">
              Compu<span className="text-[#007BFF]">Parts</span>
            </span>
          </Link>
          <div className="hidden md:flex">
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="text-black hover:text-[#007BFF]">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Carrito</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container py-6 md:py-10">
        <div className="mb-6">
          <Link href="/catalog" className="inline-flex items-center text-sm text-[#007BFF] hover:underline">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src={product.images[currentImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain"
              />
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
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border ${
                    currentImage === index ? "border-[#007BFF] ring-2 ring-[#007BFF]" : "border-gray-200"
                  }`}
                  onClick={() => selectImage(index)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - Vista ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
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
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : i < product.rating
                            ? "fill-yellow-400 text-yellow-400" // Para estrellas parciales
                            : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} reseñas)
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-black">MX${product.price.toLocaleString()}</p>

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

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Cantidad</span>
                <div className="flex items-center border rounded-md">
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
                    disabled={quantity >= product.stock}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 bg-[#007BFF] hover:bg-[#0056b3]">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar al carrito
                </Button>
                <Button variant="outline" className="flex-1 border-[#007BFF] text-[#007BFF] bg-transparent">
                  <Heart className="mr-2 h-4 w-4" />
                  Añadir a favoritos
                </Button>
              </div>
            </div>

            <div className="pt-4">
              <Tabs defaultValue="description">
                <TabsList className="w-full">
                  <TabsTrigger value="description" className="flex-1">
                    Descripción
                  </TabsTrigger>
                  <TabsTrigger value="specifications" className="flex-1">
                    Especificaciones
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4 text-sm text-gray-700 leading-relaxed">
                  <p>{product.description}</p>
                </TabsContent>
                <TabsContent value="specifications" className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span className="font-medium text-sm">{spec.name}</span>
                        <span className="text-sm text-gray-600">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <Link href={`/product/${relatedProduct.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">Ver producto</span>
                </Link>
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={relatedProduct.images[0] || "/placeholder.svg"}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 z-20 rounded-full bg-white/80 backdrop-blur-sm"
                    aria-label="Añadir a favoritos"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm text-black line-clamp-2">{relatedProduct.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{relatedProduct.brand}</p>
                  <p className="font-bold text-black mt-2">MX${relatedProduct.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-auto border-t bg-white">
        <div className="container py-6 md:py-10">
          <div className="text-center text-sm text-gray-500">© 2024 CompuParts. Todos los derechos reservados.</div>
        </div>
      </footer>
    </div>
  )
}
