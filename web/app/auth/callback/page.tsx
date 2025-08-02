'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParamsPromise = useSearchParams();
  const searchParams = use(searchParamsPromise);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener los parámetros de la URL
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(error_description || 'Error en la autenticación');
          return;
        }

        if (access_token && refresh_token) {
          // Establecer la sesión con los tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) {
            setStatus('error');
            setMessage('Error al establecer la sesión');
            return;
          }

          // Verificar si el usuario está confirmado
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user && user.email_confirmed_at) {
            setStatus('success');
            setMessage('¡Email confirmado exitosamente! Redirigiendo...');

            // Redirigir después de 2 segundos
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('El email no ha sido confirmado correctamente');
          }
        } else {
          setStatus('error');
          setMessage('Parámetros de autenticación inválidos');
        }
      } catch (error) {
        console.error('Error en callback:', error);
        setStatus('error');
        setMessage('Error inesperado durante la autenticación');
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            {status === 'loading' && 'Verificando...'}
            {status === 'success' && '¡Confirmado!'}
            {status === 'error' && 'Error'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Procesando la confirmación de tu email'}
            {status === 'success' && 'Tu cuenta ha sido verificada correctamente'}
            {status === 'error' && 'Hubo un problema con la verificación'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#007BFF]"></div>
            </div>
          )}

          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
