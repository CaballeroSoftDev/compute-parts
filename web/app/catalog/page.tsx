"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Heart, SlidersHorizontal, X } from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import { useFavorites } from "@/lib/favorites-context"

// Datos de ejemplo
const products = [
  {
    id: 1,
    name: "Procesador Intel Core i7-12700K",
    price: 7999,
    brand: "Intel",
    category: "Procesadores",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 2,
    name: "Tarjeta Gráfica NVIDIA RTX 3080",
    price: 15999,
    brand: "NVIDIA",
    category: "Tarjetas Gráficas",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 3,
    name: "Memoria RAM Corsair Vengeance 16GB",
    price: 1499,
    brand: "Corsair",
    category: "Memorias",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 4,
    name: "SSD Samsung 970 EVO 1TB",
    price: 2499,
    brand: "Samsung",
    category: "Almacenamiento",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 5,
    name: "Placa Base ASUS ROG Strix Z690-E",
    price: 6799,
    brand: "ASUS",
    category: "Placas Base",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 6,
    name: "Fuente de Poder EVGA SuperNOVA 850W",
    price: 2299,
    brand: "EVGA",
    category: "Fuentes de Poder",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 7,
    name: "Gabinete NZXT H510",
    price: 1899,
    brand: "NZXT",
    category: "Gabinetes",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 8,
    name: 'Monitor LG UltraGear 27" 144Hz',
    price: 5999,
    brand: "LG",
    category: "Monitores",
    image: "/placeholder.svg?height=300&width=300",
  },
]

const categories = [
  "Procesadores",
  "Tarjetas Gráficas",
  "Memorias",
  "Almacenamiento",
  "Placas Base",
  "Fuentes de Poder",
  "Gabinetes",
  "Monitores",
]

const brands = ["Intel", "NVIDIA", "Corsair", "Samsung", "ASUS", "EVGA", "NZXT", "LG"]

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 20000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand)

    return matchesSearch && matchesPrice && matchesCategory && matchesBrand
  })

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  const handleFavoriteClick = (product: (typeof products)[0], e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isFavorite(product.id)) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        category: product.category,
        image: product.image,
      })
    }
  }

  return (
    <MainLayout>
      <div className="container py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black mb-2">Catálogo de Productos</h1>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full">
              <Input
                placeholder="Buscar productos..."
                className="pl-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="md:hidden w-full sm:w-auto bg-transparent"
              onClick={() => setShowMobileFilters(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filtros para escritorio */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Rango de Precio</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 20000]}
                    max={20000}
                    step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-6"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MX${priceRange[0].toLocaleString()}</span>
                    <span className="text-sm">MX${priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Categorías</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Marcas</h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      <Label htmlFor={`brand-${brand}`} className="text-sm">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setSelectedCategories([])
                  setSelectedBrands([])
                  setPriceRange([0, 20000])
                  setSearchTerm("")
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>

          {/* Filtros móviles */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 bg-white p-6 overflow-y-auto md:hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Filtros</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Rango de Precio</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 20000]}
                      max={20000}
                      step={100}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-6"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">MX${priceRange[0].toLocaleString()}</span>
                      <span className="text-sm">MX${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Categorías</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`mobile-category-${category}`} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Marcas</h3>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <Label htmlFor={`mobile-brand-${brand}`} className="text-sm">
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setSelectedCategories([])
                      setSelectedBrands([])
                      setPriceRange([0, 20000])
                      setSearchTerm("")
                    }}
                  >
                    Limpiar
                  </Button>
                  <Button
                    className="flex-1 bg-[#007BFF] hover:bg-[#0056b3]"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de productos */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium mb-2">No se encontraron productos</p>
                <p className="text-gray-500 mb-4">Intenta con otros filtros o términos de búsqueda</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategories([])
                    setSelectedBrands([])
                    setPriceRange([0, 20000])
                    setSearchTerm("")
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                  >
                    <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                      <span className="sr-only">Ver producto</span>
                    </Link>
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`absolute right-2 top-2 z-20 rounded-full bg-white/80 backdrop-blur-sm ${
                          isFavorite(product.id)
                            ? "text-red-500 hover:text-red-700"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                        onClick={(e) => handleFavoriteClick(product, e)}
                        aria-label={isFavorite(product.id) ? "Eliminar de favoritos" : "Añadir a favoritos"}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite(product.id) ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                      <h3 className="font-medium text-sm text-black line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
                      <p className="font-bold text-black mt-2">MX${product.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
