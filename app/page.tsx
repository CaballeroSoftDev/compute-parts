import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/product-grid"
import { MainLayout } from "@/components/layout/MainLayout"

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-black">
                Componentes Electrónicos de Alta Calidad
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-700 md:text-xl">
                Encuentra las mejores piezas electrónicas para tus proyectos y reparaciones.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/catalog">
                <Button className="bg-[#007BFF] hover:bg-[#0056b3]">Ver Catálogo</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold text-black mb-8">Productos Destacados</h2>
          <ProductGrid />
        </div>
      </section>
    </MainLayout>
  )
}
