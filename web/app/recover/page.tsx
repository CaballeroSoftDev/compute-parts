'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

export default function RecoverPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Manejar el evento de recuperación de contraseña
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // El usuario ha hecho clic en el enlace de recuperación
        // Redirigir a una página para actualizar la contraseña
        window.location.href = '/update-password';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validación básica
    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    // Validación de formato de email más robusta
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);

    try {
      // Enviar enlace de recuperación usando Supabase
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error al enviar enlace de recuperación:', err);

      // Manejar errores específicos de Supabase
      if (err.message?.includes('User not found')) {
        setError('No existe una cuenta registrada con este correo electrónico. Verifica que el email sea correcto.');
      } else if (err.message?.includes('Too many requests')) {
        setError('Demasiados intentos. Por favor espera 5 minutos antes de intentar de nuevo.');
      } else if (err.message?.includes('Invalid email')) {
        setError('Por favor ingresa un correo electrónico válido');
      } else if (err.message?.includes('Email rate limit exceeded')) {
        setError('Has excedido el límite de envíos. Por favor espera antes de intentar de nuevo.');
      } else {
        setError('Error al enviar el enlace de recuperación. Verifica tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex justify-center">
            <Link
              href="/"
              className="text-2xl font-bold text-black"
            >
              Compu<span className="text-[#007BFF]">Parts</span>
            </Link>
          </div>
          <CardDescription className="text-center">
            Ingresa tu correo electrónico para recibir un enlace de recuperación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>¡Enlace enviado exitosamente!</strong>
                    </p>
                    <p>
                      Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>• Revisa tu bandeja de entrada</p>
                      <p>• Si no lo encuentras, revisa la carpeta de spam</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {!success && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || success}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#007BFF] hover:bg-[#0056b3]"
                  disabled={loading || success}
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <Link
              href="/login"
              className="text-[#007BFF] hover:underline"
            >
              Volver a inicio de sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
