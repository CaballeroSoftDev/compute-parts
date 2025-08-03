'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, User, Mail, Phone, Calendar, MapPin, Camera, Edit3, Save, X, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import { UploadService } from '@/lib/services/upload-service';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ProfilePage() {
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Si no hay sesión, redirigir al login
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Si ya tenemos los datos del AuthContext, no necesitamos cargar
    if (!authLoading) {
      setLoading(false);
      // Inicializar formData con datos del perfil
      if (profile) {
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          postal_code: profile.postal_code || '',
          country: profile.country || 'México',
        });
      }
    }
  }, [user, authLoading, router, profile]);

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar archivo
    const validation = UploadService.validateImageFile(file, 'avatar');
    if (!validation.valid) {
      toast({
        title: 'Error de validación',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedAvatarFile(file);
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile || !user?.id) return;

    setIsUploadingAvatar(true);
    try {
      const result = await UploadService.uploadUserAvatar(selectedAvatarFile, user.id);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Actualizar perfil con nueva URL de avatar
      const { error } = await updateProfile({ avatar_url: result.url });
      
      if (error) {
        throw error;
      }

      setAvatarPreview(null);
      setSelectedAvatarFile(null);
      
      toast({
        title: 'Avatar actualizado',
        description: 'Tu foto de perfil se ha actualizado correctamente',
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setError(error.message || 'Error al subir la foto de perfil');
      toast({
        title: 'Error',
        description: error.message || 'Error al subir la foto de perfil',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Función para validar que un campo no esté vacío
  const validateRequired = (value: string, fieldName: string): string => {
    if (!value || value.trim() === '') {
      return `${fieldName} es requerido`;
    }
    return '';
  };

  // Función para validar código postal
  const validatePostalCode = (value: string): string => {
    if (!value || value.trim() === '') {
      return 'Código postal es requerido';
    }
    if (value.length > 5) {
      return 'Código postal debe tener máximo 5 caracteres';
    }
    if (value.startsWith('0')) {
      return 'Código postal no puede empezar con cero';
    }
    if (!/^\d{5}$/.test(value)) {
      return 'Código postal debe tener exactamente 5 dígitos';
    }
    return '';
  };

  // Función para validar teléfono
  const validatePhone = (value: string): string => {
    if (!value || value.trim() === '') {
      return 'Teléfono es requerido';
    }
    if (!/^\d{10}$/.test(value.replace(/\s/g, ''))) {
      return 'Teléfono debe tener 10 dígitos';
    }
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar en tiempo real
    let error = '';
    switch (field) {
      case 'first_name':
        error = validateRequired(value, 'Nombre');
        break;
      case 'last_name':
        error = validateRequired(value, 'Apellido');
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'address':
        error = validateRequired(value, 'Dirección');
        break;
      case 'city':
        error = validateRequired(value, 'Ciudad');
        break;
      case 'state':
        error = validateRequired(value, 'Estado');
        break;
      case 'postal_code':
        error = validatePostalCode(value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validatePersonalInfo = (): boolean => {
    const newErrors = {
      first_name: validateRequired(formData.first_name, 'Nombre'),
      last_name: validateRequired(formData.last_name, 'Apellido'),
      phone: validatePhone(formData.phone),
    };

    setErrors(prev => ({ ...prev, ...newErrors }));

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSavePersonalInfo = async () => {
    if (!validatePersonalInfo()) {
      toast({
        title: 'Error de validación',
        description: 'Por favor corrige los errores antes de guardar',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
      });
      
      if (error) {
        throw error;
      }

      setIsEditingPersonal(false);
      setSuccess('Información personal actualizada exitosamente');
      
      toast({
        title: 'Información actualizada',
        description: 'Tu información personal se ha guardado correctamente',
      });
    } catch (error: any) {
      console.error('Error updating personal info:', error);
      setError(error.message || 'Error al actualizar la información personal');
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar la información personal',
        variant: 'destructive',
      });
    }
  };

  const validateAddress = (): boolean => {
    const newErrors = {
      address: validateRequired(formData.address, 'Dirección'),
      city: validateRequired(formData.city, 'Ciudad'),
      state: validateRequired(formData.state, 'Estado'),
      postal_code: validatePostalCode(formData.postal_code),
    };

    setErrors(prev => ({ ...prev, ...newErrors }));

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSaveAddress = async () => {
    if (!validateAddress()) {
      toast({
        title: 'Error de validación',
        description: 'Por favor corrige los errores antes de guardar',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await updateProfile({
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal_code: formData.postal_code.trim(),
        country: 'México', // Siempre México
      });
      
      if (error) {
        throw error;
      }

      setIsEditingAddress(false);
      setSuccess('Dirección actualizada exitosamente');
      
      toast({
        title: 'Dirección actualizada',
        description: 'Tu dirección se ha guardado correctamente',
      });
    } catch (error: any) {
      console.error('Error updating address:', error);
      setError(error.message || 'Error al actualizar la dirección');
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar la dirección',
        variant: 'destructive',
      });
    }
  };

  const handleCancelPersonalEdit = () => {
    setIsEditingPersonal(false);
    // Limpiar errores de información personal
    setErrors(prev => ({
      ...prev,
      first_name: '',
      last_name: '',
      phone: '',
    }));
    // Restaurar datos originales de información personal
    if (profile) {
      setFormData(prev => ({
        ...prev,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
      }));
    }
  };

  const handleCancelAddressEdit = () => {
    setIsEditingAddress(false);
    // Limpiar errores de dirección
    setErrors(prev => ({
      ...prev,
      address: '',
      city: '',
      state: '',
      postal_code: '',
    }));
    // Restaurar datos originales de dirección
    if (profile) {
      setFormData(prev => ({
        ...prev,
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        postal_code: profile.postal_code || '',
        country: profile.country || 'México',
      }));
    }
  };

  const getInitials = () => {
    const firstName = profile?.first_name || user?.user_metadata?.first_name || '';
    const lastName = profile?.last_name || user?.user_metadata?.last_name || '';
    const email = user?.email || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    const firstName = profile?.first_name || user?.user_metadata?.first_name || '';
    const lastName = profile?.last_name || user?.user_metadata?.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    return 'Usuario';
  };

  // Mostrar loading mientras AuthContext se inicializa
  if (authLoading || loading) {
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
            <CardTitle className="text-center text-2xl font-bold">Cargando Perfil</CardTitle>
            <CardDescription className="text-center">Estamos cargando tu información...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#007BFF]"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
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
            <CardTitle className="text-center text-2xl font-bold">Error</CardTitle>
            <CardDescription className="text-center">No se pudo cargar el perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-[#007BFF] hover:bg-[#0056b3]"
            >
              Volver al inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <div className="mx-auto max-w-4xl px-4">
          {/* Título de la página */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="mt-2 text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Columna izquierda - Avatar y información básica */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Foto de Perfil</CardTitle>
                  <CardDescription>Personaliza tu foto de perfil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                                     {/* Avatar */}
                   <div className="flex justify-center">
                     <div className="relative">
                       <Avatar className="h-32 w-32">
                         <AvatarImage 
                           src={avatarPreview || profile?.avatar_url || undefined} 
                           alt="Foto de perfil"
                         />
                         <AvatarFallback className="text-2xl font-semibold">
                           {getInitials()}
                         </AvatarFallback>
                       </Avatar>
                       
                       {/* Botón de editar avatar */}
                       <Button
                         size="sm"
                         variant="outline"
                         className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                         onClick={() => document.getElementById('avatar-input')?.click()}
                         disabled={isUploadingAvatar}
                       >
                         <Camera className="h-4 w-4" />
                       </Button>
                       
                       <input
                         id="avatar-input"
                         type="file"
                         accept="image/*"
                         onChange={handleAvatarSelect}
                         className="hidden"
                       />
                     </div>
                   </div>

                   {/* Botones de acción para nueva imagen */}
                   {avatarPreview && (
                     <div className="space-y-3">
                       <div className="text-center">
                         <p className="text-sm text-gray-600 mb-2">Nueva imagen seleccionada</p>
                         <div className="flex gap-2 justify-center">
                           <Button
                             size="sm"
                             onClick={handleAvatarUpload}
                             disabled={isUploadingAvatar}
                             className="flex-1 max-w-[120px]"
                           >
                             {isUploadingAvatar ? (
                               <>
                                 <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                 Subiendo...
                               </>
                             ) : (
                               <>
                                 <Save className="h-4 w-4 mr-2" />
                                 Guardar
                               </>
                             )}
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => {
                               setAvatarPreview(null);
                               setSelectedAvatarFile(null);
                             }}
                             className="max-w-[120px]"
                           >
                             <X className="h-4 w-4 mr-2" />
                             Cancelar
                           </Button>
                         </div>
                       </div>
                     </div>
                   )}

                  {/* Información básica */}
                  <Separator />
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Nombre completo</Label>
                      <p className="text-lg font-semibold">{getFullName()}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Correo electrónico</Label>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Estado de verificación</Label>
                      <Badge variant={user?.email_confirmed_at ? 'default' : 'destructive'}>
                        {user?.email_confirmed_at ? 'Verificado' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha - Información detallada */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información Personal */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Información Personal
                      </CardTitle>
                      <CardDescription>Datos personales de tu cuenta</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {isEditingPersonal ? 'Cancelar' : 'Editar'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                         <div className="space-y-2">
                       <Label htmlFor="first_name">Nombre</Label>
                       {isEditingPersonal ? (
                         <div>
                           <Input
                             id="first_name"
                             value={formData.first_name}
                             onChange={(e) => handleInputChange('first_name', e.target.value)}
                             placeholder="Tu nombre"
                             className={errors.first_name ? 'border-red-500' : ''}
                           />
                           {errors.first_name && (
                             <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
                           )}
                         </div>
                       ) : (
                         <div className="rounded-md border bg-gray-50 p-3">
                           {profile?.first_name || 'No especificado'}
                         </div>
                       )}
                     </div>

                     <div className="space-y-2">
                       <Label htmlFor="last_name">Apellido</Label>
                       {isEditingPersonal ? (
                         <div>
                           <Input
                             id="last_name"
                             value={formData.last_name}
                             onChange={(e) => handleInputChange('last_name', e.target.value)}
                             placeholder="Tu apellido"
                             className={errors.last_name ? 'border-red-500' : ''}
                           />
                           {errors.last_name && (
                             <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
                           )}
                         </div>
                       ) : (
                         <div className="rounded-md border bg-gray-50 p-3">
                           {profile?.last_name || 'No especificado'}
                         </div>
                       )}
                     </div>
                  </div>

                                     <div className="space-y-2">
                     <Label htmlFor="phone">Teléfono</Label>
                     {isEditingPersonal ? (
                       <div>
                         <Input
                           id="phone"
                           value={formData.phone}
                           onChange={(e) => handleInputChange('phone', e.target.value)}
                           placeholder="Tu número de teléfono (10 dígitos)"
                           className={errors.phone ? 'border-red-500' : ''}
                         />
                         {errors.phone && (
                           <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                         )}
                       </div>
                     ) : (
                       <div className="flex items-center rounded-md border bg-gray-50 p-3">
                         <Phone className="mr-2 h-4 w-4 text-gray-500" />
                         {profile?.phone || 'No especificado'}
                       </div>
                     )}
                   </div>

                  {isEditingPersonal && (
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSavePersonalInfo} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar cambios
                      </Button>
                      <Button variant="outline" onClick={handleCancelPersonalEdit}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dirección */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <MapPin className="mr-2 h-5 w-5" />
                        Dirección
                      </CardTitle>
                      <CardDescription>Información de tu dirección de envío</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {isEditingAddress ? 'Cancelar' : 'Editar'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                                     <div className="space-y-2">
                     <Label htmlFor="address">Dirección</Label>
                     {isEditingAddress ? (
                       <div>
                         <Textarea
                           id="address"
                           value={formData.address}
                           onChange={(e) => handleInputChange('address', e.target.value)}
                           placeholder="Tu dirección completa"
                           rows={2}
                           className={errors.address ? 'border-red-500' : ''}
                         />
                         {errors.address && (
                           <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                         )}
                       </div>
                     ) : (
                       <div className="rounded-md border bg-gray-50 p-3">
                         {profile?.address || 'No especificada'}
                       </div>
                     )}
                   </div>

                                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                     <div className="space-y-2">
                       <Label htmlFor="city">Ciudad</Label>
                       {isEditingAddress ? (
                         <div>
                           <Input
                             id="city"
                             value={formData.city}
                             onChange={(e) => handleInputChange('city', e.target.value)}
                             placeholder="Ciudad"
                             className={errors.city ? 'border-red-500' : ''}
                           />
                           {errors.city && (
                             <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                           )}
                         </div>
                       ) : (
                         <div className="rounded-md border bg-gray-50 p-3">
                           {profile?.city || 'No especificada'}
                         </div>
                       )}
                     </div>

                     <div className="space-y-2">
                       <Label htmlFor="state">Estado/Provincia</Label>
                       {isEditingAddress ? (
                         <div>
                           <Input
                             id="state"
                             value={formData.state}
                             onChange={(e) => handleInputChange('state', e.target.value)}
                             placeholder="Estado"
                             className={errors.state ? 'border-red-500' : ''}
                           />
                           {errors.state && (
                             <p className="text-sm text-red-500 mt-1">{errors.state}</p>
                           )}
                         </div>
                       ) : (
                         <div className="rounded-md border bg-gray-50 p-3">
                           {profile?.state || 'No especificado'}
                         </div>
                       )}
                     </div>

                     <div className="space-y-2">
                       <Label htmlFor="postal_code">Código Postal</Label>
                       {isEditingAddress ? (
                         <div>
                           <Input
                             id="postal_code"
                             value={formData.postal_code}
                             onChange={(e) => handleInputChange('postal_code', e.target.value)}
                             placeholder="Código postal (5 dígitos)"
                             maxLength={5}
                             className={errors.postal_code ? 'border-red-500' : ''}
                           />
                           {errors.postal_code && (
                             <p className="text-sm text-red-500 mt-1">{errors.postal_code}</p>
                           )}
                         </div>
                       ) : (
                         <div className="rounded-md border bg-gray-50 p-3">
                           {profile?.postal_code || 'No especificado'}
                         </div>
                       )}
                     </div>

                                         <div className="space-y-2">
                       <Label htmlFor="country">País</Label>
                       <div className="rounded-md border bg-gray-50 p-3">
                         {profile?.country || 'México'}
                       </div>
                     </div>
                  </div>

                  {isEditingAddress && (
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveAddress} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar cambios
                      </Button>
                      <Button variant="outline" onClick={handleCancelAddressEdit}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Información de la Cuenta */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Información de la Cuenta
                  </CardTitle>
                  <CardDescription>Detalles de tu cuenta y actividad</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                     <div className="space-y-2">
                       <Label className="text-sm font-medium text-gray-700">Fecha de Registro</Label>
                       <div className="rounded-md border bg-gray-50 p-3">
                         {user?.created_at ? new Date(user.created_at).toLocaleString('es-ES', {
                           year: 'numeric',
                           month: '2-digit',
                           day: '2-digit',
                           hour: '2-digit',
                           minute: '2-digit',
                           hour12: true
                         }) : 'No disponible'}
                       </div>
                     </div>

                     <div className="space-y-2">
                       <Label className="text-sm font-medium text-gray-700">Último Acceso</Label>
                       <div className="rounded-md border bg-gray-50 p-3">
                         {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('es-ES', {
                           year: 'numeric',
                           month: '2-digit',
                           day: '2-digit',
                           hour: '2-digit',
                           minute: '2-digit',
                           hour12: true
                         }) : 'No disponible'}
                       </div>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
