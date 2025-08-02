import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cookie, Info, Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Cookies | CompuParts',
  description: 'Información sobre cómo CompuParts utiliza cookies y tecnologías similares en su sitio web.',
};

export default function CookiesPage() {
  return (
    <PageLayout
      title="Política de Cookies"
      description="Información sobre cómo utilizamos cookies y tecnologías similares en nuestro sitio web."
    >
      <Card>
        <CardHeader>
          <CardTitle>Política de Cookies</CardTitle>
          <CardDescription>Última actualización: 25 de julio de 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Cookie className="h-4 w-4" />
            <AlertDescription>
              Esta política explica qué son las cookies, cómo las utilizamos y cómo puedes controlarlas.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet, teléfono
              móvil) cuando visitas un sitio web. Las cookies se utilizan ampliamente para hacer que los sitios web
              funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
            </p>
            <p>
              Las cookies pueden ser "persistentes" o "de sesión". Las cookies persistentes permanecen en tu dispositivo
              durante un período de tiempo definido o hasta que las elimines manualmente. Las cookies de sesión se
              eliminan automáticamente cuando cierras tu navegador.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Tipos de cookies que utilizamos</h2>
            <p>Utilizamos los siguientes tipos de cookies en nuestro sitio web:</p>

            <div className="mt-4 space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold text-[#007BFF]">Cookies esenciales</h3>
                <p className="mt-1 text-sm">
                  Estas cookies son necesarias para el funcionamiento básico de nuestro sitio web. Te permiten navegar
                  por el sitio y utilizar sus funciones, como acceder a áreas seguras. Sin estas cookies, no podríamos
                  proporcionar los servicios que has solicitado.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold text-[#007BFF]">Cookies de rendimiento y análisis</h3>
                <p className="mt-1 text-sm">
                  Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, recopilando
                  información de forma anónima. Utilizamos esta información para mejorar el funcionamiento de nuestro
                  sitio y proporcionar una mejor experiencia de usuario.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold text-[#007BFF]">Cookies de funcionalidad</h3>
                <p className="mt-1 text-sm">
                  Estas cookies permiten que nuestro sitio web recuerde las elecciones que haces (como tu nombre de
                  usuario, idioma o región) y proporcione funciones mejoradas y más personalizadas.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold text-[#007BFF]">Cookies de marketing</h3>
                <p className="mt-1 text-sm">
                  Estas cookies se utilizan para rastrear a los visitantes en los sitios web. La intención es mostrar
                  anuncios relevantes y atractivos para el usuario individual, y por lo tanto, más valiosos para los
                  editores y anunciantes terceros.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Cookies específicas que utilizamos</h2>
            <p>
              A continuación se muestra una lista detallada de las cookies más importantes que utilizamos en nuestro
              sitio web:
            </p>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Propósito</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>session_id</TableCell>
                    <TableCell>Esencial</TableCell>
                    <TableCell>Sesión</TableCell>
                    <TableCell>Mantiene tu sesión activa mientras navegas por el sitio</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>cart_items</TableCell>
                    <TableCell>Esencial</TableCell>
                    <TableCell>30 días</TableCell>
                    <TableCell>Guarda los productos en tu carrito de compras</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>_ga</TableCell>
                    <TableCell>Análisis</TableCell>
                    <TableCell>2 años</TableCell>
                    <TableCell>Utilizada por Google Analytics para distinguir usuarios</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>_gid</TableCell>
                    <TableCell>Análisis</TableCell>
                    <TableCell>24 horas</TableCell>
                    <TableCell>Utilizada por Google Analytics para distinguir usuarios</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>user_preferences</TableCell>
                    <TableCell>Funcionalidad</TableCell>
                    <TableCell>1 año</TableCell>
                    <TableCell>Recuerda tus preferencias de visualización</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>recently_viewed</TableCell>
                    <TableCell>Funcionalidad</TableCell>
                    <TableCell>30 días</TableCell>
                    <TableCell>Guarda los productos que has visto recientemente</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>fbp</TableCell>
                    <TableCell>Marketing</TableCell>
                    <TableCell>3 meses</TableCell>
                    <TableCell>Utilizada por Facebook para entregar anuncios relevantes</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Cookies de terceros</h2>
            <p>
              Algunos de nuestros socios de confianza también pueden colocar cookies en tu dispositivo cuando visitas
              nuestro sitio web. Estos incluyen servicios de análisis (como Google Analytics), redes sociales (como
              Facebook) y redes publicitarias.
            </p>
            <p>
              No tenemos control sobre estas cookies de terceros. Te recomendamos consultar las políticas de privacidad
              y cookies de estos terceros para obtener más información:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#007BFF] hover:underline"
                >
                  Política de Privacidad de Google
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/policy.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#007BFF] hover:underline"
                >
                  Política de Privacidad de Facebook
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Cómo controlar las cookies</h2>
            <p>
              Puedes controlar y/o eliminar las cookies según tus preferencias. Puedes eliminar todas las cookies que ya
              están en tu dispositivo y puedes configurar la mayoría de los navegadores para evitar que se coloquen.
            </p>
            <p>
              A continuación, te proporcionamos enlaces sobre cómo gestionar las cookies en los navegadores más
              populares:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#007BFF] hover:underline"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#007BFF] hover:underline"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#007BFF] hover:underline"
                >
                  Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#007BFF] hover:underline"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>
            <p>
              Ten en cuenta que si desactivas las cookies, es posible que algunas funciones de nuestro sitio web no
              estén disponibles y que tu experiencia de usuario se vea afectada.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Tus preferencias de cookies</h2>
            <p>
              Puedes ajustar tus preferencias de cookies en cualquier momento utilizando nuestro centro de preferencias
              de cookies.
            </p>
            <div className="mt-4 flex justify-center">
              <Button className="bg-[#007BFF] hover:bg-blue-600">
                <Settings className="mr-2 h-4 w-4" /> Configurar preferencias de cookies
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Cambios en nuestra política de cookies</h2>
            <p>
              Podemos actualizar nuestra política de cookies periódicamente para reflejar cambios en las cookies que
              utilizamos o por otros motivos operativos, legales o regulatorios. Te recomendamos visitar esta página
              regularmente para estar informado sobre el uso de cookies en nuestro sitio web.
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Si tienes alguna pregunta sobre nuestra política de cookies, por favor contáctanos en
              privacy@compuparts.com.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
