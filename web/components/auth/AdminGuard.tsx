'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
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
      if (!user) {
        // Usuario no autenticado, redirigir al login
        router.push('/auth/login');
        return;
      }

      if (!isAdmin) {
        // Usuario no es admin, redirigir al dashboard
        router.push('/dashboard');
        return;
      }

      if (requireSuperAdmin && !isSuperAdmin) {
        // Se requiere superadmin pero el usuario no lo es
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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
            <CardTitle>Acceso denegado</CardTitle>
            <CardDescription>Debes iniciar sesión para acceder al panel administrativo.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">Redirigiendo al login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Shield className="mx-auto h-8 w-8 text-orange-500" />
            <CardTitle>Permisos insuficientes</CardTitle>
            <CardDescription>No tienes permisos de administrador para acceder a esta sección.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">Redirigiendo al dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Shield className="mx-auto h-8 w-8 text-red-500" />
            <CardTitle>Permisos de superadmin requeridos</CardTitle>
            <CardDescription>Esta sección requiere permisos de superadministrador.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">Redirigiendo al panel administrativo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
