import type { Metadata } from 'next';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad | CompuParts',
  description:
    'Política de privacidad de CompuParts. Información sobre cómo recopilamos, utilizamos y protegemos tus datos personales.',
};

export default function PrivacyPage() {
  return (
    <PageLayout
      title="Política de Privacidad"
      description="Información sobre cómo recopilamos, utilizamos y protegemos tus datos personales."
    >
      <Card>
        <CardHeader>
          <CardTitle>Política de Privacidad</CardTitle>
          <CardDescription>Última actualización: 25 de julio de 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos, utilizamos y protegemos
              tus datos personales.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Introducción</h2>
            <p>
              CompuParts, con domicilio en Av. Tecnológica #123, Col. Innovación, Ciudad de México, CP 01234, es
              responsable del tratamiento de tus datos personales.
            </p>
            <p>
              Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos la información
              que nos proporcionas cuando utilizas nuestro sitio web, realizas compras o te comunicas con nosotros. Al
              utilizar nuestros servicios, aceptas las prácticas descritas en esta política.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Datos personales que recopilamos</h2>
            <p>Podemos recopilar los siguientes tipos de información personal:</p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Información de identificación (nombre, apellidos, RFC)</li>
              <li>Información de contacto (correo electrónico, número de teléfono, dirección postal)</li>
              <li>Información de pago (número de tarjeta de crédito/débito, fecha de vencimiento)</li>
              <li>Información de la cuenta (nombre de usuario, contraseña)</li>
              <li>Historial de compras y preferencias de productos</li>
              <li>Información técnica (dirección IP, tipo de navegador, dispositivo)</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Finalidades del tratamiento de datos</h2>
            <p>Utilizamos tus datos personales para los siguientes fines:</p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Procesar y gestionar tus pedidos</li>
              <li>Proporcionar servicio al cliente y soporte técnico</li>
              <li>Enviarte información sobre tus compras (confirmaciones, actualizaciones de envío)</li>
              <li>Mejorar nuestros productos y servicios</li>
              <li>Personalizar tu experiencia en nuestro sitio web</li>
              <li>Enviarte comunicaciones de marketing (si has dado tu consentimiento)</li>
              <li>Cumplir con obligaciones legales y fiscales</li>
              <li>Prevenir fraudes y proteger la seguridad de nuestro sitio</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Base legal para el tratamiento</h2>
            <p>Tratamos tus datos personales con las siguientes bases legales:</p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                <strong>Ejecución de un contrato:</strong> Cuando es necesario para cumplir con nuestras obligaciones
                contractuales contigo (por ejemplo, procesar tu pedido).
              </li>
              <li>
                <strong>Consentimiento:</strong> Cuando nos has dado tu consentimiento explícito para tratar tus datos
                con un fin específico (por ejemplo, para enviarte comunicaciones de marketing).
              </li>
              <li>
                <strong>Interés legítimo:</strong> Cuando el tratamiento es necesario para nuestros intereses legítimos
                y no prevalecen tus derechos y libertades (por ejemplo, para mejorar nuestros servicios).
              </li>
              <li>
                <strong>Obligación legal:</strong> Cuando el tratamiento es necesario para cumplir con una obligación
                legal (por ejemplo, conservar facturas para fines fiscales).
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Compartir datos personales</h2>
            <p>Podemos compartir tus datos personales con las siguientes categorías de destinatarios:</p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                <strong>Proveedores de servicios:</strong> Empresas que nos ayudan a proporcionar nuestros servicios
                (procesadores de pagos, servicios de envío, servicios de atención al cliente).
              </li>
              <li>
                <strong>Socios comerciales:</strong> Fabricantes o distribuidores de productos cuando sea necesario para
                cumplir con garantías o servicios postventa.
              </li>
              <li>
                <strong>Autoridades públicas:</strong> Cuando sea requerido por ley, regulación o procedimiento legal.
              </li>
            </ul>
            <p>No vendemos ni alquilamos tus datos personales a terceros para fines de marketing.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Transferencias internacionales</h2>
            <p>
              Algunos de nuestros proveedores de servicios pueden estar ubicados en países fuera de México. En estos
              casos, nos aseguramos de que existan garantías adecuadas para proteger tus datos personales de acuerdo con
              la legislación mexicana.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Seguridad de los datos</h2>
            <p>
              Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales contra el
              acceso no autorizado, la pérdida, la alteración o la destrucción. Estas medidas incluyen:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Encriptación de datos sensibles</li>
              <li>Acceso restringido a datos personales</li>
              <li>Monitoreo y pruebas de seguridad regulares</li>
              <li>Planes de respuesta a incidentes</li>
              <li>Formación del personal en materia de privacidad y seguridad</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Conservación de datos</h2>
            <p>
              Conservamos tus datos personales solo durante el tiempo necesario para cumplir con los fines para los que
              fueron recopilados, incluido el cumplimiento de requisitos legales, contables o de informes.
            </p>
            <p>
              Para determinar el período de conservación adecuado, consideramos la cantidad, naturaleza y sensibilidad
              de los datos personales, el riesgo potencial de daño por uso o divulgación no autorizados, los fines para
              los que procesamos los datos y si podemos lograr esos fines a través de otros medios.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Tus derechos ARCO</h2>
            <p>
              De acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, tienes
              los siguientes derechos en relación con tus datos personales:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>
                <strong>Acceso:</strong> Derecho a conocer qué datos personales tenemos sobre ti y cómo los tratamos.
              </li>
              <li>
                <strong>Rectificación:</strong> Derecho a solicitar la corrección de tus datos personales si son
                inexactos o incompletos.
              </li>
              <li>
                <strong>Cancelación:</strong> Derecho a solicitar que eliminemos tus datos personales de nuestros
                registros.
              </li>
              <li>
                <strong>Oposición:</strong> Derecho a oponerte al tratamiento de tus datos personales para fines
                específicos.
              </li>
            </ul>
            <p>Para ejercer tus derechos ARCO, puedes enviar una solicitud a privacy@compuparts.com, incluyendo:</p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>Tu nombre completo y dirección de correo electrónico</li>
              <li>Una copia de un documento oficial que acredite tu identidad</li>
              <li>Una descripción clara del derecho que deseas ejercer y los datos personales involucrados</li>
              <li>Cualquier otra información que nos ayude a localizar tus datos personales</li>
            </ul>
            <p>Responderemos a tu solicitud en un plazo máximo de 20 días hábiles.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Cookies y tecnologías similares</h2>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web, recordar tus
              preferencias y mostrarte contenido relevante. Puedes obtener más información sobre cómo utilizamos las
              cookies en nuestra{' '}
              <Link
                href="/cookies"
                className="text-[#007BFF] hover:underline"
              >
                Política de Cookies
              </Link>
              .
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Cambios a esta política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas
              de privacidad o por otros motivos operativos, legales o regulatorios. Te notificaremos cualquier cambio
              material publicando la nueva Política de Privacidad en nuestro sitio web y, cuando sea apropiado, te
              informaremos por correo electrónico.
            </p>
            <p>
              Te recomendamos revisar esta política regularmente para estar informado sobre cómo protegemos tu
              información.
            </p>
          </div>

          <div className="mt-8 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold">Contacto para asuntos de privacidad:</h3>
            <p className="text-sm">
              Si tienes preguntas o inquietudes sobre esta Política de Privacidad o el tratamiento de tus datos
              personales, puedes contactarnos en:
            </p>
            <p className="mt-2 text-sm">
              <strong>Correo electrónico:</strong> privacy@compuparts.com
              <br />
              <strong>Teléfono:</strong> (55) 9876-5432
              <br />
              <strong>Dirección:</strong> Av. Tecnológica #123, Col. Innovación, Ciudad de México, CP 01234
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              También tienes derecho a presentar una reclamación ante el Instituto Nacional de Transparencia, Acceso a
              la Información y Protección de Datos Personales (INAI) si consideras que hemos violado tus derechos de
              protección de datos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
