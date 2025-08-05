'use client';

import { useAuth } from '@/lib/auth-context';
import { useAuthorization } from '@/lib/hooks/use-authorization';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function AuthDebug() {
  const { user, profile, session, loading } = useAuth();
  const { canAccessAdmin, userRole } = useAuthorization();
  const [showDetails, setShowDetails] = useState(false);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-sm">🔍 Debug Auth - Cargando...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md" data-testid="auth-debug">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          🔍 Debug Auth
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ocultar' : 'Mostrar'} Detalles
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs">Estado:</span>
          <Badge variant={user ? 'default' : 'destructive'}>
            {user ? 'Autenticado' : 'No autenticado'}
          </Badge>
        </div>

        {user && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs">Email:</span>
              <span className="text-xs font-mono">{user.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs">Rol:</span>
              <Badge variant={userRole === 'admin' || userRole === 'superadmin' ? 'default' : 'secondary'}>
                {userRole || 'Sin rol'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs">Admin:</span>
              <Badge variant={canAccessAdmin() ? 'default' : 'destructive'}>
                {canAccessAdmin() ? 'Sí' : 'No'}
              </Badge>
            </div>

            {profile && (
              <div className="flex items-center justify-between">
                <span className="text-xs">Nombre:</span>
                <span className="text-xs">
                  {profile.first_name} {profile.last_name}
                </span>
              </div>
            )}
          </>
        )}

        {showDetails && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <div className="text-xs">
              <strong>Session:</strong> {session ? 'Activa' : 'Inactiva'}
            </div>
            <div className="text-xs">
              <strong>User ID:</strong> {user?.id || 'N/A'}
            </div>
            <div className="text-xs">
              <strong>Profile ID:</strong> {profile?.id || 'N/A'}
            </div>
            <div className="text-xs">
              <strong>Profile Role:</strong> {profile?.role || 'N/A'}
            </div>
            <div className="text-xs">
              <strong>Auth Role:</strong> {userRole || 'N/A'}
            </div>
            <div className="text-xs">
              <strong>Can Access Admin:</strong> {canAccessAdmin() ? 'Sí' : 'No'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 