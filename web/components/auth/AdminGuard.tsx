'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useAuthorization } from '@/lib/hooks/use-authorization';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export function AdminGuard({ children, requireSuperAdmin = false }: AdminGuardProps) {
  const { user, profile, loading } = useAuth();
  const { canAccessAdmin, userRole } = useAuthorization();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Si no hay usuario, redirigir a login
      if (!user) {
        router.push('/login');
        return;
      }

      // Si el usuario no es admin, redirigir a home
      if (!canAccessAdmin()) {
        router.push('/');
        return;
      }

      // Si se requiere superadmin y el usuario no lo es, redirigir a admin
      if (requireSuperAdmin && userRole !== 'superadmin') {
        router.push('/admin');
        return;
      }
    }
  }, [user, profile, loading, canAccessAdmin, userRole, router, requireSuperAdmin]);

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

  // Si no hay usuario o no es admin, mostrar loading mientras redirige
  if (!user || !canAccessAdmin()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
            <CardTitle>Redirigiendo...</CardTitle>
            <CardDescription>No tienes permisos para acceder a esta página</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Si llegamos aquí, el usuario está autenticado y es admin
  return <>{children}</>;
}
