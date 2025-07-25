import type { Metadata } from "next"
import Link from "next/link"
import { PageLayout } from "@/components/layout/PageLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Clock, Award, Mail, Phone, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Acerca de Nosotros | CompuParts",
  description:
    "Conoce más sobre CompuParts, tu tienda especializada en componentes electrónicos de alta calidad desde 2018.",
}

export default function AboutPage() {
  return (
    <PageLayout
      title="Acerca de Nosotros"
      description="Conoce más sobre CompuParts y nuestra misión de ofrecer los mejores componentes electrónicos."
    >
      <div className="grid gap-8">
        {/* Historia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nuestra Historia</CardTitle>
            <CardDescription>Desde 2018 sirviendo a la comunidad tecnológica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              CompuParts nació en 2018 con una misión clara: proporcionar componentes electrónicos de alta calidad a
              precios accesibles para entusiastas, profesionales y empresas en México.
            </p>
            <p>
              Lo que comenzó como una pequeña tienda en la Ciudad de México ha crecido hasta convertirse en uno de los
              principales distribuidores de componentes electrónicos del país, con un catálogo de más de 5,000 productos
              y envíos a toda la República Mexicana.
            </p>
            <p>
              Nuestra pasión por la tecnología y el compromiso con la calidad nos han permitido construir relaciones
              duraderas con nuestros clientes y proveedores, convirtiéndonos en un referente en el sector.
            </p>
          </CardContent>
        </Card>

        {/* Misión y Visión */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  Misión
                </Badge>
                Nuestra Misión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Proporcionar componentes electrónicos de la más alta calidad a precios competitivos, ofreciendo un
                servicio excepcional y asesoramiento técnico especializado para ayudar a nuestros clientes a desarrollar
                sus proyectos con éxito.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                  Visión
                </Badge>
                Nuestra Visión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Ser el proveedor líder de componentes electrónicos en México, reconocido por la calidad de nuestros
                productos, la excelencia en el servicio al cliente y nuestro compromiso con la innovación tecnológica y
                la sostenibilidad.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Valores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nuestros Valores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-2 text-[#007BFF]">Calidad</h3>
                <p>
                  Nos comprometemos a ofrecer solo productos que cumplan con los más altos estándares de calidad y
                  rendimiento.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-2 text-[#007BFF]">Integridad</h3>
                <p>Actuamos con honestidad y transparencia en todas nuestras operaciones y relaciones comerciales.</p>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-2 text-[#007BFF]">Innovación</h3>
                <p>
                  Buscamos constantemente nuevas tecnologías y soluciones para mantenernos a la vanguardia del sector.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-2 text-[#007BFF]">Servicio</h3>
                <p>
                  Nos esforzamos por superar las expectativas de nuestros clientes con un servicio personalizado y
                  eficiente.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-2 text-[#007BFF]">Sostenibilidad</h3>
                <p>
                  Trabajamos para minimizar nuestro impacto ambiental y promover prácticas sostenibles en nuestra
                  industria.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-2 text-[#007BFF]">Comunidad</h3>
                <p>Apoyamos a la comunidad tecnológica local mediante talleres, eventos y programas educativos.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Building2 className="mx-auto h-8 w-8 text-[#007BFF] mb-2" />
              <p className="text-3xl font-bold">6+</p>
              <p className="text-sm text-gray-500">Años de experiencia</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="mx-auto h-8 w-8 text-[#007BFF] mb-2" />
              <p className="text-3xl font-bold">10,000+</p>
              <p className="text-sm text-gray-500">Clientes satisfechos</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Clock className="mx-auto h-8 w-8 text-[#007BFF] mb-2" />
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm text-gray-500">Soporte técnico</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Award className="mx-auto h-8 w-8 text-[#007BFF] mb-2" />
              <p className="text-3xl font-bold">5,000+</p>
              <p className="text-sm text-gray-500">Productos disponibles</p>
            </CardContent>
          </Card>
        </div>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Contáctanos</CardTitle>
            <CardDescription>Estamos aquí para ayudarte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#007BFF] mt-0.5" />
                <div>
                  <h3 className="font-medium">Dirección</h3>
                  <p className="text-sm text-gray-500">Av. Tecnológica #123, Col. Innovación</p>
                  <p className="text-sm text-gray-500">Ciudad de México, CP 01234</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-[#007BFF] mt-0.5" />
                <div>
                  <h3 className="font-medium">Teléfono</h3>
                  <p className="text-sm text-gray-500">Ventas: (55) 1234-5678</p>
                  <p className="text-sm text-gray-500">Soporte: (55) 8765-4321</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-[#007BFF] mt-0.5" />
                <div>
                  <h3 className="font-medium">Correo Electrónico</h3>
                  <p className="text-sm text-gray-500">ventas@compuparts.com</p>
                  <p className="text-sm text-gray-500">soporte@compuparts.com</p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-[#007BFF] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
              >
                Contáctanos
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
