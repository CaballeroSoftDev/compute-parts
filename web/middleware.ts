import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Crear cliente de Supabase para el middleware
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo aplicar middleware a rutas de admin
  if (pathname.startsWith('/admin')) {
    try {
      // Obtener el token de la sesión desde las cookies
      const authCookie = request.cookies.get('sb-access-token')?.value;

      if (!authCookie) {
        // No hay sesión, redirigir a la página principal
        console.log('🔒 Middleware: Usuario no autenticado, redirigiendo a /');
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Verificar el usuario con el token
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(authCookie);

      if (authError || !user) {
        // Token inválido o usuario no encontrado, redirigir a la página principal
        console.log('🔒 Middleware: Token inválido, redirigiendo a /');
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Verificar si el usuario es admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || !['admin', 'superadmin'].includes(profile.role)) {
        // Usuario no es admin, redirigir a la página principal
        console.log('🔒 Middleware: Usuario no es admin, redirigiendo a /');
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Usuario es admin, permitir acceso
      console.log('✅ Middleware: Usuario admin, permitiendo acceso');
      return NextResponse.next();
    } catch (error) {
      console.error('❌ Error en middleware:', error);
      // En caso de error, redirigir a la página principal por seguridad
      return NextResponse.redirect(new URL('/', request.url));
    }
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
