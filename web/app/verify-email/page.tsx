'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Mail, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Email de verificación reenviado. Revisa tu bandeja de entrada.');
      }
    } catch (err) {
      setError('Error al reenviar el email');
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
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold">¡Registro Exitoso!</CardTitle>
          <CardDescription className="text-center">Tu cuenta ha sido creada correctamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{message}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-2">
              <span className="text-sm text-gray-600">
                Hemos enviado un correo de verificación a tu dirección de correo electrónico. Por favor revisa tu
                bandeja de entrada y haz clic en el enlace para activar tu cuenta.
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <div className="w-full space-y-2">
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
            />
            <Button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full bg-gray-600 text-white hover:bg-gray-700"
            >
              {loading ? 'Enviando...' : 'Reenviar correo de verificación'}
            </Button>
          </div>

          <div className="text-center">
            <Link href="/login">
              <Button
                variant="link"
                className="p-0 text-[#007BFF]"
              >
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
