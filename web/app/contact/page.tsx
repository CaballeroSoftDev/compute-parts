import type { Metadata } from "next"
import { PageLayout } from "@/components/layout/PageLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"

export const metadata: Metadata = {
  title: "Contacto | CompuParts",
  description:
    "Ponte en contacto con CompuParts para resolver tus dudas o recibir asesoramiento técnico especializado.",
}

export default function ContactPage() {
  return (
    <PageLayout title="Contacto" description="Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo.">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Envíanos un mensaje</CardTitle>
              <CardDescription>Completa el formulario y te responderemos a la brevedad.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input id="name" placeholder="Tu nombre" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" placeholder="tu@email.com" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (opcional)</Label>
                    <Input id="phone" placeholder="(55) 1234-5678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input id="subject" placeholder="¿En qué podemos ayudarte?" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea id="message" placeholder="Escribe tu mensaje aquí..." className="min-h-[150px]" required />
                </div>
                <Button type="submit" className="w-full md:w-auto bg-[#007BFF] hover:bg-blue-600">
                  <Send className="mr-2 h-4 w-4" /> Enviar mensaje
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-[#007BFF] mt-0.5" />
                <div>
                  <h3 className="font-medium">Horario de atención</h3>
                  <p className="text-sm text-gray-500">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                  <p className="text-sm text-gray-500">Sábados: 10:00 AM - 2:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapa */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500 text-sm">Mapa interactivo</p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Preguntas frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Cuál es el tiempo de entrega?</AccordionTrigger>
                  <AccordionContent>
                    El tiempo de entrega varía según tu ubicación. Para la Ciudad de México y área metropolitana, de 1 a
                    2 días hábiles. Para el resto del país, de 3 a 5 días hábiles.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Ofrecen garantía en sus productos?</AccordionTrigger>
                  <AccordionContent>
                    Sí, todos nuestros productos cuentan con garantía. La duración varía según el fabricante, desde 3
                    meses hasta 3 años.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Realizan envíos internacionales?</AccordionTrigger>
                  <AccordionContent>
                    Actualmente solo realizamos envíos dentro de la República Mexicana.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
