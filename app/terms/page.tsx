import type { Metadata } from "next"
import Link from "next/link"
import { PageLayout } from "@/components/layout/PageLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export const metadata: Metadata = {
  title: "Términos y Condiciones | CompuParts",
  description:
    "Términos y condiciones de uso de CompuParts. Información legal sobre compras, envíos, devoluciones y más.",
}

export default function TermsPage() {
  return (
    <PageLayout
      title="Términos y Condiciones"
      description="Información legal sobre el uso de nuestros servicios y productos."
    >
      <Card>
        <CardHeader>
          <CardTitle>Términos y Condiciones de Uso</CardTitle>
          <CardDescription>Última actualización: 25 de julio de 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Por favor, lee detenidamente estos términos y condiciones antes de utilizar nuestros servicios.
            </AlertDescription>
          </Alert>

          {/* Índice */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Índice de contenidos:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>
                <a href="#general" className="text-[#007BFF] hover:underline">
                  Términos Generales
                </a>
              </li>
              <li>
                <a href="#products" className="text-[#007BFF] hover:underline">
                  Productos y Precios
                </a>
              </li>
              <li>
                <a href="#payments" className="text-[#007BFF] hover:underline">
                  Pagos y Facturación
                </a>
              </li>
              <li>
                <a href="#shipping" className="text-[#007BFF] hover:underline">
                  Envíos y Entregas
                </a>
              </li>
              <li>
                <a href="#returns" className="text-[#007BFF] hover:underline">
                  Devoluciones y Reembolsos
                </a>
              </li>
              <li>
                <a href="#warranty" className="text-[#007BFF] hover:underline">
                  Garantías
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-[#007BFF] hover:underline">
                  Privacidad y Datos Personales
                </a>
              </li>
              <li>
                <a href="#liability" className="text-[#007BFF] hover:underline">
                  Limitación de Responsabilidad
                </a>
              </li>
            </ol>
          </div>

          {/* Términos Generales */}
          <div id="general" className="space-y-3">
            <h2 className="text-xl font-semibold">1. Términos Generales</h2>
            <p>
              Al acceder y utilizar el sitio web de CompuParts (en adelante, "el Sitio"), aceptas cumplir con estos
              Términos y Condiciones de Uso, todas las leyes y regulaciones aplicables, y reconoces que eres responsable
              de cumplir con cualquier ley local aplicable.
            </p>
            <p>
              Si no estás de acuerdo con alguno de estos términos, tienes prohibido utilizar o acceder a este sitio. Los
              materiales contenidos en este sitio están protegidos por las leyes de derechos de autor y marcas
              registradas aplicables.
            </p>
            <p>
              CompuParts se reserva el derecho de modificar estos términos en cualquier momento sin previo aviso. Al
              utilizar este sitio, aceptas estar sujeto a la versión más actualizada de estos Términos y Condiciones.
            </p>
          </div>

          {/* Productos y Precios */}
          <div id="products" className="space-y-3">
            <h2 className="text-xl font-semibold">2. Productos y Precios</h2>
            <p>
              CompuParts se esfuerza por mostrar con precisión los colores, características y especificaciones de los
              productos. Sin embargo, no garantizamos que los colores, especificaciones o cualquier otra característica
              de los productos sean exactos, completos, confiables, actualizados o libres de errores.
            </p>
            <p>
              Todos los precios mostrados en el Sitio están en Pesos Mexicanos (MXN) e incluyen IVA, a menos que se
              indique lo contrario. CompuParts se reserva el derecho de modificar los precios en cualquier momento sin
              previo aviso.
            </p>
            <p>
              En caso de que un producto esté listado a un precio incorrecto debido a un error tipográfico o de sistema,
              CompuParts se reserva el derecho de rechazar o cancelar cualquier pedido realizado para dicho producto.
            </p>
          </div>

          {/* Pagos y Facturación */}
          <div id="payments" className="space-y-3">
            <h2 className="text-xl font-semibold">3. Pagos y Facturación</h2>
            <p>
              CompuParts acepta diversos métodos de pago, incluyendo tarjetas de crédito/débito, transferencias
              bancarias y pagos en efectivo en tiendas de conveniencia. Todos los pagos con tarjeta son procesados a
              través de sistemas seguros y encriptados.
            </p>
            <p>
              Para solicitar factura, deberás proporcionar tus datos fiscales al momento de realizar tu compra o dentro
              de los 7 días naturales posteriores a la misma, de acuerdo con las disposiciones fiscales vigentes.
            </p>
            <p>
              CompuParts se reserva el derecho de rechazar cualquier pedido que realices con nosotros. Podemos, a
              nuestra discreción, limitar o cancelar las cantidades compradas por persona, por hogar o por pedido.
            </p>
          </div>

          {/* Envíos y Entregas */}
          <div id="shipping" className="space-y-3">
            <h2 className="text-xl font-semibold">4. Envíos y Entregas</h2>
            <p>
              CompuParts realiza envíos a toda la República Mexicana. Los tiempos de entrega son estimados y pueden
              variar dependiendo de la ubicación geográfica y la disponibilidad de los productos.
            </p>
            <p>
              Los costos de envío se calculan en función del peso, dimensiones y destino del pedido. Estos costos se
              mostrarán claramente antes de finalizar tu compra.
            </p>
            <p>
              Una vez que tu pedido ha sido enviado, recibirás un correo electrónico con la información de seguimiento.
              CompuParts no se hace responsable por retrasos causados por el servicio de paquetería, condiciones
              climáticas adversas o cualquier otra circunstancia fuera de nuestro control.
            </p>
          </div>

          {/* Devoluciones y Reembolsos */}
          <div id="returns" className="space-y-3">
            <h2 className="text-xl font-semibold">5. Devoluciones y Reembolsos</h2>
            <p>
              Puedes solicitar la devolución de un producto dentro de los 7 días naturales posteriores a la recepción
              del mismo, siempre y cuando el producto se encuentre en su empaque original, sin usar y en perfectas
              condiciones.
            </p>
            <p>
              Para iniciar un proceso de devolución, deberás contactar a nuestro servicio de atención al cliente y
              proporcionar el número de pedido y el motivo de la devolución.
            </p>
            <p>
              Los reembolsos se realizarán utilizando el mismo método de pago utilizado para la compra original, una vez
              que el producto haya sido recibido e inspeccionado por nuestro equipo.
            </p>
            <p>
              Los costos de envío para devoluciones correrán por cuenta del cliente, excepto en casos donde el producto
              presente defectos de fabricación o haya sido enviado por error.
            </p>
          </div>

          {/* Garantías */}
          <div id="warranty" className="space-y-3">
            <h2 className="text-xl font-semibold">6. Garantías</h2>
            <p>
              Todos los productos vendidos por CompuParts cuentan con la garantía ofrecida por el fabricante, cuya
              duración puede variar según el producto.
            </p>
            <p>
              Para hacer válida la garantía, deberás presentar el comprobante de compra y el producto en su empaque
              original con todos sus accesorios.
            </p>
            <p>
              La garantía no cubre daños causados por uso indebido, accidentes, modificaciones no autorizadas, o
              desgaste normal del producto.
            </p>
            <p>
              En caso de que un producto presente defectos cubiertos por la garantía, CompuParts, a su discreción, podrá
              reparar el producto, reemplazarlo por uno igual o similar, o reembolsar el precio de compra.
            </p>
          </div>

          {/* Privacidad y Datos Personales */}
          <div id="privacy" className="space-y-3">
            <h2 className="text-xl font-semibold">7. Privacidad y Datos Personales</h2>
            <p>
              CompuParts se compromete a proteger tu privacidad y tus datos personales de acuerdo con la Ley Federal de
              Protección de Datos Personales en Posesión de los Particulares.
            </p>
            <p>
              Al utilizar nuestro Sitio y proporcionar tus datos personales, aceptas que CompuParts recopile, utilice y
              divulgue tu información de acuerdo con nuestra{" "}
              <Link href="/privacy" className="text-[#007BFF] hover:underline">
                Política de Privacidad
              </Link>
              .
            </p>
            <p>
              CompuParts utiliza cookies y tecnologías similares para mejorar tu experiencia en nuestro Sitio. Puedes
              obtener más información sobre cómo utilizamos las cookies en nuestra{" "}
              <Link href="/cookies" className="text-[#007BFF] hover:underline">
                Política de Cookies
              </Link>
              .
            </p>
          </div>

          {/* Limitación de Responsabilidad */}
          <div id="liability" className="space-y-3">
            <h2 className="text-xl font-semibold">8. Limitación de Responsabilidad</h2>
            <p>
              En ningún caso CompuParts, sus directores, empleados o agentes serán responsables por cualquier daño
              directo, indirecto, incidental, especial o consecuente que resulte del uso o la imposibilidad de usar los
              productos o servicios adquiridos a través del Sitio.
            </p>
            <p>
              CompuParts no garantiza que el Sitio esté libre de virus u otros componentes dañinos. No seremos
              responsables de cualquier pérdida o daño causado por un ataque distribuido de denegación de servicio,
              virus o cualquier otro material tecnológicamente dañino que pueda infectar tu equipo, programas
              informáticos, datos u otro material debido a tu uso del Sitio.
            </p>
            <p>
              La responsabilidad máxima de CompuParts por cualquier reclamación derivada de estos Términos y Condiciones
              no excederá el precio de compra del producto en cuestión.
            </p>
          </div>

          {/* Contacto */}
          <div className="p-4 bg-gray-50 rounded-lg mt-8">
            <h3 className="font-semibold mb-2">Contacto para asuntos legales:</h3>
            <p className="text-sm">
              Si tienes alguna pregunta sobre estos Términos y Condiciones, puedes contactarnos en:
            </p>
            <p className="text-sm mt-2">
              <strong>Correo electrónico:</strong> legal@compuparts.com
              <br />
              <strong>Teléfono:</strong> (55) 9876-5432
              <br />
              <strong>Dirección:</strong> Av. Tecnológica #123, Col. Innovación, Ciudad de México, CP 01234
            </p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
