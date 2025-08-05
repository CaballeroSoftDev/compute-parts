import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Phone, Mail, FileText, HelpCircle } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

export default function SupportPage() {
  return (
    <PageLayout
      title="Centro de Soporte"
      description="Estamos aquí para ayudarte con cualquier duda o problema que puedas tener."
    >
      <section className="bg-white py-8 md:py-12">
        <div className="container px-4 md:px-6">
          {/* Opciones de contacto */}
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <Phone className="h-6 w-6 text-[#007BFF]" />
                </div>
                <h3 className="mb-2 text-lg font-bold">Teléfono</h3>
                <p className="mb-4 text-gray-600">Llámanos de lunes a viernes de 9:00 a 18:00 hrs.</p>
                <p className="font-medium">(999) 123-4567</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <Mail className="h-6 w-6 text-[#007BFF]" />
                </div>
                <h3 className="mb-2 text-lg font-bold">Correo Electrónico</h3>
                <p className="mb-4 text-gray-600">Escríbenos y te responderemos en menos de 24 horas.</p>
                <p className="font-medium">soporte@compuparts.mx</p>
              </CardContent>
            </Card>
          </div>

          {/* Formulario de contacto y FAQ */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Formulario de contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Envíanos un mensaje</CardTitle>
                <CardDescription>
                  Completa el formulario y un especialista se pondrá en contacto contigo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium"
                      >
                        Nombre completo
                      </label>
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium"
                      >
                        Correo electrónico
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium"
                    >
                      Asunto
                    </label>
                    <Input
                      id="subject"
                      placeholder="Asunto de tu mensaje"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium"
                    >
                      Mensaje
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Escribe tu mensaje aquí"
                      rows={5}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#007BFF] hover:bg-[#0056b3]"
                  >
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Preguntas frecuentes */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">Preguntas Frecuentes</h2>
              <Accordion
                type="single"
                collapsible
                className="w-full"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Cuál es el tiempo de entrega de los productos?</AccordionTrigger>
                  <AccordionContent>
                    Para recogida en tienda, los productos estarán disponibles en 2 días hábiles. Para envíos a
                    domicilio, el tiempo de entrega varía entre 3 a 5 días hábiles dependiendo de la zona de entrega
                    dentro del sur de México.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Cómo puedo rastrear mi pedido?</AccordionTrigger>
                  <AccordionContent>
                    Una vez que tu pedido sea enviado, recibirás un correo electrónico con el número de guía para
                    rastrear tu paquete. También puedes verificar el estado de tu pedido iniciando sesión en tu cuenta y
                    visitando la sección &quot;Mis Pedidos&quot;.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Cuál es la política de garantía?</AccordionTrigger>
                  <AccordionContent>
                    Todos nuestros productos cuentan con la garantía oficial del fabricante. El período de garantía
                    varía según el producto, generalmente de 1 a 3 años. Para hacer válida la garantía, es necesario
                    presentar la factura de compra y el producto en su empaque original.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>¿Realizan envíos a todo México?</AccordionTrigger>
                  <AccordionContent>
                    Actualmente solo realizamos envíos a la zona sur de México, que incluye los estados de Yucatán,
                    Quintana Roo, Campeche, Tabasco y Chiapas. Estamos trabajando para expandir nuestra cobertura a
                    nivel nacional.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>¿Cómo puedo cambiar o devolver un producto?</AccordionTrigger>
                  <AccordionContent>
                    Tienes 7 días naturales a partir de la recepción del producto para solicitar un cambio o devolución.
                    El producto debe estar en perfectas condiciones, sin usar y en su empaque original. Para iniciar el
                    proceso, contacta a nuestro equipo de soporte.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>¿Ofrecen factura electrónica?</AccordionTrigger>
                  <AccordionContent>
                    Sí, emitimos factura electrónica para todas las compras. Puedes solicitarla durante el proceso de
                    compra proporcionando tus datos fiscales, o posteriormente a través de la sección &quot;Mis
                    Compras&quot; en tu cuenta.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-8 rounded-lg bg-gray-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-blue-100 p-2">
                    <HelpCircle className="h-5 w-5 text-[#007BFF]" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold">¿No encuentras lo que buscas?</h3>
                    <p className="mb-4 text-gray-600">
                      Consulta nuestra base de conocimientos completa o contacta directamente con nuestro equipo de
                      soporte.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        className="gap-2 border-[#007BFF] bg-transparent text-[#007BFF]"
                      >
                        <FileText className="h-4 w-4" />
                        Base de Conocimientos
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa de ubicación */}
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">Visítanos</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex h-[300px] items-center justify-center overflow-hidden rounded-lg border bg-gray-100 md:col-span-2">
                <div className="p-6 text-center">
                  <p className="text-gray-500">Mapa de ubicación</p>
                  <p className="text-sm text-gray-400">
                    (Aquí se mostraría un mapa interactivo con la ubicación de la tienda)
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-bold">Tienda Principal</h3>
                  <p className="text-gray-600">Calle 60 #123 x 45 y 47</p>
                  <p className="text-gray-600">Col. Centro, Mérida, Yucatán</p>
                  <p className="text-gray-600">CP 97000</p>
                </div>
                <div>
                  <h3 className="mb-2 font-bold">Horario de Atención</h3>
                  <p className="text-gray-600">Lunes a Viernes: 9:00 - 18:00</p>
                  <p className="text-gray-600">Sábados: 9:00 - 14:00</p>
                  <p className="text-gray-600">Domingos: Cerrado</p>
                </div>
                <Button className="w-full bg-[#007BFF] hover:bg-[#0056b3]">Cómo Llegar</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
