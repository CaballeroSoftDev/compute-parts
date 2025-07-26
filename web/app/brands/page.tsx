import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"

// Datos de ejemplo para marcas
const brands = [
  {
    id: 1,
    name: "Intel",
    logo: "/placeholder.svg?height=100&width=200",
    description: "Líder mundial en fabricación de procesadores y tecnologías de computación.",
    productCount: 24,
    featured: true,
  },
  {
    id: 2,
    name: "NVIDIA",
    logo: "/placeholder.svg?height=100&width=200",
    description: "Pioneros en tecnología de gráficos y computación acelerada por GPU.",
    productCount: 18,
    featured: true,
  },
  {
    id: 3,
    name: "AMD",
    logo: "/placeholder.svg?height=100&width=200",
    description: "Innovadores en procesadores de alto rendimiento y tarjetas gráficas.",
    productCount: 22,
    featured: true,
  },
  {
    id: 4,
    name: "Corsair",
    logo: "/placeholder.svg?height=100&width=200",
    description: "Especialistas en componentes de alto rendimiento para entusiastas y gamers.",
    productCount: 35,
    featured: false,
  },
  {
    id: 5,
    name: "Samsung",
    logo: "/placeholder.svg?height=100&width=200",
    description: "Líder en tecnología de almacenamiento y memoria para computadoras.",
    productCount: 28,
    featured: false,
  },
  {
    id: 6,
    name: "ASUS",
    logo: "/placeholder.svg?height=100&width=200",
    description: "Reconocidos por sus placas base, laptops y componentes de alta calidad.",
    productCount: 42,
    featured: true,
  },
  {
    id: 7,
    name: "MSI",
    logo: "/placeholder.svg?height=100&width=200",
    description: "Especialistas en hardware para gaming y estaciones de trabajo profesionales.",
    productCount: 31,
    featured: false,
  },
  {
    id: 8,
    name: "Western Digital",
    logo: "/placeholder.svg?height=100&width=200",
    description: "Líderes en soluciones de almacenamiento confiables y de alto rendimiento.",
    productCount: 19,
    featured: false,
  },
  {
    id: 9,
    name: "Gigabyte",
    logo: "/placeholder.svg?height=100&width=200",
    description: "Fabricantes de placas base, tarjetas gráficas y periféricos de calidad.",
    productCount: 27,
    featured: false,
  },
  {
    id: 10,
    name: "Cooler Master",
    logo: "/placeholder.svg?height=100&width=200",
    description: "Especialistas en soluciones de refrigeración y gabinetes para PC.",
    productCount: 23,
    featured: false,
  },
]

export default function BrandsPage() {
  const featuredBrands = brands.filter((brand) => brand.featured)

  return (
    <PageLayout
      title="Nuestras Marcas"
      description="Trabajamos con las mejores marcas del mercado para ofrecerte componentes de alta calidad y rendimiento."
    >
      <section className="py-8 md:py-12 bg-white">
        <div className="container px-4 md:px-6">
          {/* Marcas destacadas */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Marcas Destacadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBrands.map((brand) => (
                <Card key={brand.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col items-center text-center">
                      <div className="relative h-16 w-full mb-4">
                        <Image
                          src={brand.logo || "/placeholder.svg"}
                          alt={`Logo de ${brand.name}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{brand.name}</h3>
                      <p className="text-gray-600 mb-4">{brand.description}</p>
                      <p className="text-sm text-gray-500 mb-4">{brand.productCount} productos disponibles</p>
                      <Link href={`/catalog?brand=${brand.name}`}>
                        <Button className="bg-[#007BFF] hover:bg-[#0056b3]">Ver Productos</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Todas las marcas */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Todas las Marcas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/catalog?brand=${brand.name}`}
                  className="group flex flex-col items-center p-4 border rounded-lg hover:border-[#007BFF] hover:shadow-md transition-all"
                >
                  <div className="relative h-12 w-full mb-3">
                    <Image
                      src={brand.logo || "/placeholder.svg"}
                      alt={`Logo de ${brand.name}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium group-hover:text-[#007BFF]">{brand.name}</span>
                  <span className="text-xs text-gray-500">{brand.productCount} productos</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-16 bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">¿Por qué elegimos estas marcas?</h2>
            <p className="text-gray-700 mb-4">
              En Compu Parts nos aseguramos de trabajar únicamente con marcas reconocidas por su calidad, innovación y
              servicio post-venta. Todos nuestros productos cuentan con garantía oficial y soporte técnico
              especializado.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="rounded-full bg-blue-100 p-3 mb-3">
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
                <h3 className="font-medium mb-2">Garantía Oficial</h3>
                <p className="text-sm text-gray-600">
                  Todos nuestros productos cuentan con garantía oficial del fabricante.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="rounded-full bg-blue-100 p-3 mb-3">
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
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <h3 className="font-medium mb-2">Productos Originales</h3>
                <p className="text-sm text-gray-600">Garantizamos la autenticidad de todos nuestros productos.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="rounded-full bg-blue-100 p-3 mb-3">
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
                <h3 className="font-medium mb-2">Soporte Técnico</h3>
                <p className="text-sm text-gray-600">Contamos con técnicos especializados para resolver tus dudas.</p>
              </div>
            </div>
          </div>

          {/* Convertirse en distribuidor */}
          <div className="mt-12 border rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="md:w-2/3">
                <h2 className="text-xl font-bold mb-2">¿Eres distribuidor?</h2>
                <p className="text-gray-700 mb-4">
                  Si representas a una marca y estás interesado en distribuir tus productos a través de Compu Parts,
                  contáctanos para conocer nuestro programa de partners.
                </p>
                <Link href="/contact">
                  <Button variant="outline" className="border-[#007BFF] text-[#007BFF] bg-transparent">
                    Contactar <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <div className="relative w-40 h-40">
                  <Image
                    src="/placeholder.svg?height=160&width=160"
                    alt="Programa de distribuidores"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
