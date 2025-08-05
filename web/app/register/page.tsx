'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  // Función para calcular la fortaleza de la contraseña
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const labels = ['', 'Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];
    const colors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];

    return {
      strength,
      label: labels[strength],
      color: colors[strength],
    };
  };

  // Función para validar nombre
  const validateName = (name: string) => {
    if (!name.trim()) return 'El nombre es obligatorio';
    if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (name.trim().length > 50) return 'El nombre no puede exceder 50 caracteres';
    return '';
  };

  // Función para validar email
  const validateEmail = (email: string) => {
    if (!email.trim()) return 'El correo electrónico es obligatorio';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Por favor ingresa un correo electrónico válido';
    return '';
  };

  // Función para validar teléfono
  const validatePhone = (phone: string) => {
    if (!phone.trim()) return 'El número telefónico es obligatorio';
    const phoneRegex = /^\d{10}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) return 'El número telefónico debe tener 10 dígitos numéricos';
    return '';
  };

  // Función para validar contraseña
  const validatePassword = (password: string) => {
    if (!password) return 'La contraseña es obligatoria';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password))
      return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    return '';
  };

  // Función para validar confirmación de contraseña
  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return 'Debes confirmar tu contraseña';
    if (confirmPassword !== formData.password) return 'Las contraseñas no coinciden';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Validación en tiempo real
    if (touched[name as keyof typeof touched]) {
      let fieldError = '';
      switch (name) {
        case 'name':
          fieldError = validateName(value);
          break;
        case 'email':
          fieldError = validateEmail(value);
          break;
        case 'phone':
          fieldError = validatePhone(value);
          break;
        case 'password':
          fieldError = validatePassword(value);
          break;
        case 'confirmPassword':
          fieldError = validateConfirmPassword(value);
          break;
      }

      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validar campo al perder el foco
    let fieldError = '';
    switch (name) {
      case 'name':
        fieldError = validateName(value);
        break;
      case 'email':
        fieldError = validateEmail(value);
        break;
      case 'phone':
        fieldError = validatePhone(value);
        break;
      case 'password':
        fieldError = validatePassword(value);
        break;
      case 'confirmPassword':
        fieldError = validateConfirmPassword(value);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Marcar todos los campos como tocados para mostrar errores
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    // Validar todos los campos
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);

    // Actualizar errores
    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // Verificar si hay errores
    if (nameError || emailError || phoneError || passwordError || confirmPasswordError) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    // Validación de términos y condiciones
    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);

    try {
      // Separar nombre en first_name y last_name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userData = {
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone,
      };

      const { error, data } = await signUp(formData.email, formData.password, userData);

      if (error) {
        setError(error.message || 'Error al registrar la cuenta. Inténtalo de nuevo.');
      } else {
        // Verificar si el usuario necesita confirmación de email
        if (data.user && !data.user.email_confirmed_at) {
          // Redirigir a página de verificación de email
          router.push('/verify-email');
        } else {
          // Usuario confirmado automáticamente, redirigir
          router.push('/');
        }
      }
    } catch (err) {
      setError('Error al registrar la cuenta. Inténtalo de nuevo.');
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
          <CardTitle className="text-center text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription className="text-center">Ingresa tus datos para registrarte en Compu Parts</CardDescription>
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
            {message && (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">{message}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.name && errors.name ? 'border-red-500' : ''}
                required
              />
              {touched.name && errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.email && errors.email ? 'border-red-500' : ''}
                required
              />
              {touched.email && errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="9991234567"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.phone && errors.phone ? 'border-red-500' : ''}
                required
              />
              {touched.phone && errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pr-10 ${touched.password && errors.password ? 'border-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const { strength } = getPasswordStrength(formData.password);
                      return (
                        <div
                          key={level}
                          className={`h-1 w-8 rounded ${
                            level <= strength
                              ? strength <= 2
                                ? 'bg-red-500'
                                : strength <= 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className={`text-xs ${getPasswordStrength(formData.password).color}`}>
                    {getPasswordStrength(formData.password).label}
                  </span>
                </div>
              )}
              {touched.password && errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pr-10 ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
              {touched.confirmPassword && formData.confirmPassword && !errors.confirmPassword && (
                <p className="text-sm text-green-500">✓ Las contraseñas coinciden</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    acceptTerms: checked === true,
                  }))
                }
                required
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acepto los{' '}
                <Link
                  href="/terms"
                  className="text-[#007BFF] hover:underline"
                >
                  términos y condiciones
                </Link>
              </label>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#007BFF] hover:bg-[#0056b3]"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Crear Cuenta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link
              href="/login"
              className="text-[#007BFF] hover:underline"
            >
              Iniciar sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
