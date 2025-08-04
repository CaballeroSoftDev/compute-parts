'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export function AdminGuard({ children, requireSuperAdmin = false }: AdminGuardProps) {
  const { user, profile, loading, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Verificación adicional de seguridad (el middleware ya hizo la validación principal)
      if (!user || !isAdmin) {
        console.log('🔒 AdminGuard: Usuario no autorizado, redirigiendo a /');
        router.push('/');
        return;
      }

      if (requireSuperAdmin && !isSuperAdmin) {
        console.log('🔒 AdminGuard: Se requiere superadmin, redirigiendo a /admin');
        router.push('/admin');
        return;
      }
    }
  }, [user, loading, isAdmin, isSuperAdmin, router, requireSuperAdmin]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
            <CardTitle>Verificando permisos</CardTitle>
            <CardDescription>Comprobando tu acceso al panel administrativo...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Si llegamos aquí, el usuario está autenticado y es admin (validado por middleware)
  return <>{children}</>;
}
