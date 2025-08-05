'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Redirección automática con countdown visible
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShouldRedirect(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Efecto separado para manejar la redirección
  useEffect(() => {
    if (shouldRedirect) {
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 100); // Pequeño delay para evitar el error

      return () => clearTimeout(redirectTimer);
    }
  }, [shouldRedirect, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* Animación de error 404 */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Círculo principal */}
              <div className="flex h-32 w-32 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-2xl">
                <span className="text-4xl font-bold text-white">404</span>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute -right-2 -top-2 h-8 w-8 animate-bounce rounded-full bg-yellow-400"></div>
              <div className="absolute -bottom-2 -left-2 h-6 w-6 animate-ping rounded-full bg-blue-400"></div>
              <div className="absolute -left-4 top-1/2 h-4 w-4 animate-pulse rounded-full bg-green-400"></div>
            </div>
          </div>

          {/* Líneas decorativas */}
          <div className="absolute left-0 top-1/2 h-0.5 w-16 -translate-y-1/2 transform bg-gradient-to-r from-transparent to-gray-300"></div>
          <div className="absolute right-0 top-1/2 h-0.5 w-16 -translate-y-1/2 transform bg-gradient-to-l from-transparent to-gray-300"></div>
        </div>

        {/* Título principal */}
        <h1 className="mb-6 bg-gradient-to-r from-gray-900 via-red-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
          ¡Oops!
        </h1>

        {/* Subtítulo */}
        <h2 className="mb-4 text-2xl font-semibold text-gray-800 md:text-3xl">Página no encontrada</h2>

        {/* Descripción */}
        <p className="mx-auto mb-8 max-w-md text-lg leading-relaxed text-gray-600">
          La página que buscas no existe o ha sido movida a otra ubicación.
        </p>

        {/* Mensaje de redirección */}
        <div className="mb-8 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-lg">
          <div className="mb-3 flex items-center justify-center">
            <Search className="mr-2 h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Redirección automática</span>
          </div>
          <p className="text-sm text-blue-700">
            Serás redirigido a la página principal en <span className="font-bold text-blue-800">{countdown}</span>{' '}
            segundo{countdown !== 1 ? 's' : ''}...
          </p>
        </div>

        {/* Botones de acción */}
        <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button className="w-full transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl sm:w-auto">
              <Home className="mr-2 h-5 w-5" />
              Ir a la página principal
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full transform rounded-xl border-2 border-gray-300 px-8 py-3 text-gray-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:shadow-xl sm:w-auto"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Volver atrás
          </Button>
        </div>

        {/* Información adicional */}
        <div className="rounded-2xl border border-gray-200 bg-white/50 p-6 shadow-lg backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
            <span className="font-medium text-gray-700">¿Necesitas ayuda?</span>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Si crees que esto es un error o necesitas asistencia, no dudes en contactarnos.
          </p>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              href="/contact"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
            >
              Contactar soporte
            </Link>
            <span className="hidden text-gray-400 sm:inline">•</span>
            <Link
              href="/catalog"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
            >
              Explorar productos
            </Link>
          </div>
        </div>

        {/* Elementos decorativos de fondo */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-10 top-20 h-2 w-2 animate-ping rounded-full bg-blue-400"></div>
          <div className="absolute right-20 top-40 h-3 w-3 animate-bounce rounded-full bg-purple-400"></div>
          <div className="absolute bottom-20 left-20 h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
          <div className="absolute bottom-40 right-10 h-3 w-3 animate-ping rounded-full bg-yellow-400"></div>
        </div>
      </div>
    </div>
  );
}
