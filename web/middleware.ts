import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo aplicar middleware a rutas de admin
  if (pathname.startsWith('/admin')) {
    console.log('🔒 Middleware: Verificando acceso a ruta admin:', pathname);

    // Para rutas de admin, permitir el acceso y dejar que el componente AdminGuard maneje la autorización
    // Esto es más eficiente porque el AdminGuard puede acceder al contexto de autenticación del cliente
    console.log('✅ Middleware: Permitiendo acceso a ruta admin, delegando autorización a AdminGuard');
    return NextResponse.next();
  }

  // Para rutas que no son admin, continuar normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
