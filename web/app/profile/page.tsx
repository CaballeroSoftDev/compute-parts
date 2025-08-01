"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, User, Mail, Phone, Calendar, MapPin } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Si no hay sesión, redirigir al login
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    // Si ya tenemos los datos del AuthContext, no necesitamos cargar
    if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading, router])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      router.push("/login")
    } catch (err: any) {
      console.error("Error al cerrar sesión:", err)
      setError("Error al cerrar sesión")
    }
  }

  // Mostrar loading mientras AuthContext se inicializa
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Link href="/" className="text-2xl font-bold text-black">
                Compu<span className="text-[#007BFF]">Parts</span>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Cargando Perfil</CardTitle>
            <CardDescription className="text-center">
              Estamos cargando tu información...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF]"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Link href="/" className="text-2xl font-bold text-black">
                Compu<span className="text-[#007BFF]">Parts</span>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Error</CardTitle>
            <CardDescription className="text-center">
              No se pudo cargar el perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/login")} className="w-full bg-[#007BFF] hover:bg-[#0056b3]">
              Volver al inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold text-black">
              Compu<span className="text-[#007BFF]">Parts</span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Mi Perfil</CardTitle>
          <CardDescription className="text-center">
            Información de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Información del Usuario */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Nombre</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {profile?.first_name || user?.user_metadata?.first_name || "No especificado"}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Apellido</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {profile?.last_name || user?.user_metadata?.last_name || "No especificado"}
                </div>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Información de Contacto
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Correo Electrónico</Label>
                <div className="p-3 bg-gray-50 rounded-md border flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  {user?.email || "No especificado"}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Teléfono</Label>
                <div className="p-3 bg-gray-50 rounded-md border flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  {profile?.phone || user?.user_metadata?.phone || "No especificado"}
                </div>
              </div>
            </div>
          </div>

          {/* Información de Dirección */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Dirección
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Dirección</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {profile?.address || "No especificada"}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Ciudad</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {profile?.city || "No especificada"}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Estado/Provincia</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {profile?.state || "No especificado"}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Código Postal</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {profile?.postal_code || "No especificado"}
                </div>
              </div>
            </div>
          </div>

          {/* Información de la Cuenta */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Información de la Cuenta
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">ID de Usuario</Label>
                <div className="p-3 bg-gray-50 rounded-md border text-sm font-mono">
                  {user?.id || "No disponible"}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Fecha de Registro</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : "No disponible"}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Último Acceso</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES') : "No disponible"}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Estado de Verificación</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.email_confirmed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user?.email_confirmed_at ? 'Verificado' : 'Pendiente de verificación'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
            >
              Cerrar Sesión
            </Button>
            <Button asChild className="flex-1 bg-[#007BFF] hover:bg-[#0056b3]">
              <Link href="/">
                Volver al Inicio
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 