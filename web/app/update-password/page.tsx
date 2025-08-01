"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Shield, ShieldCheck, ShieldX } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()

  // Función para evaluar la fortaleza de la contraseña
  const evaluatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  // Actualizar fortaleza de contraseña cuando cambie
  useEffect(() => {
    setPasswordStrength(evaluatePasswordStrength(password))
  }, [password])

  // Debug: Monitorear cambios de estado
  useEffect(() => {
    console.log("Estado actual:", { loading, success, error })
  }, [loading, success, error])

  // Verificar si el usuario tiene un token válido de recuperación
  useEffect(() => {
    const checkRecoveryToken = async () => {
      try {
        // Verificar si hay una sesión activa
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setIsValidToken(true)
          setIsCheckingToken(false)
          return
        }

        // Verificar parámetros de la URL para tokens de recuperación
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const tokenHash = urlParams.get('token_hash')
        const type = urlParams.get('type')
        
        // Si tenemos tokens de acceso directos
        if (accessToken && refreshToken) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (error) {
              throw error
            }
            
            setIsValidToken(true)
            setIsCheckingToken(false)
            return
          } catch (err) {
            console.error("Error al establecer sesión:", err)
          }
        }
        
        // Si tenemos un token hash para verificación
        if (tokenHash && type === 'recovery') {
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery'
            })
            
            if (error) {
              throw error
            }
            
            setIsValidToken(true)
            setIsCheckingToken(false)
            return
          } catch (err) {
            console.error("Error al verificar OTP:", err)
          }
        }
        
        // Si llegamos aquí, no hay tokens válidos
        setError("El enlace de recuperación no es válido o ha expirado. Por favor solicita un nuevo enlace.")
        setIsCheckingToken(false)
        
      } catch (err) {
        console.error("Error al verificar token:", err)
        setError("Error al verificar el enlace de recuperación. Por favor solicita un nuevo enlace.")
        setIsCheckingToken(false)
      }
    }

    checkRecoveryToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    console.log("handleSubmit", password)

    // Timeout de seguridad para evitar que se quede cargando indefinidamente
    const timeoutId = setTimeout(() => {
      console.log("Timeout de seguridad - reseteando loading")
      setLoading(false)
    }, 10000) // 10 segundos

    try {
      console.log("entra")
      // Validaciones
      if (!password) {
        setError("Por favor ingresa tu nueva contraseña")
        setLoading(false)
        clearTimeout(timeoutId)
        return
      }

      if (password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres")
        setLoading(false)
        clearTimeout(timeoutId)
        return
      }

      // Validación de contraseña más robusta
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(password)) {
        setError("La contraseña debe contener al menos una letra mayúscula, una minúscula y un número")
        setLoading(false)
        clearTimeout(timeoutId)
        return
      }

      // Validación adicional de fortaleza
      if (passwordStrength < 3) {
        setError("La contraseña es demasiado débil. Por favor elige una contraseña más segura")
        setLoading(false)
        clearTimeout(timeoutId)
        return
      }

      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden")
        setLoading(false)
        clearTimeout(timeoutId)
        return
      }

      console.log("Antes de updateUser")
      
      // Verificar que el usuario esté autenticado
      const { data: { session } } = await supabase.auth.getSession()
      console.log("Sesión actual:", session)
      
      if (!session) {
        throw new Error("No hay sesión activa. Por favor verifica tu enlace de recuperación.")
      }
      
      // Actualizar la contraseña del usuario
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })
      
      console.log("Respuesta de updateUser:", { data, error })

      // Verificar si hay error en la respuesta
      if (error) {
        console.log("Error en updateUser:", error)
        throw error
      }

      console.log("Actualización exitosa, estableciendo success=true")

      // Actualización exitosa - Cerrar sesión después de actualizar la contraseña
      // para evitar que el usuario quede logueado automáticamente
      await supabase.auth.signOut()
      
      // Actualización exitosa
      setSuccess(true)
      setLoading(false)
      clearTimeout(timeoutId)
      
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err)
      
      // Manejar errores específicos de Supabase
      if (err.code === "same_password" || err.message?.includes("same_password")) {
        setError("La nueva contraseña debe ser diferente a la contraseña actual")
      } else if (err.message?.includes("Password should be at least")) {
        setError("La contraseña debe tener al menos 6 caracteres")
      } else if (err.message?.includes("Invalid password")) {
        setError("La contraseña no cumple con los requisitos de seguridad")
      } else if (err.message?.includes("User not found")) {
        setError("Usuario no encontrado. El enlace puede haber expirado")
      } else {
        setError("Error al actualizar la contraseña. Inténtalo de nuevo.")
      }
      setLoading(false)
      clearTimeout(timeoutId)
    }
  }

  // Mostrar pantalla de carga mientras se verifica el token
  if (isCheckingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Link href="/" className="text-2xl font-bold text-black">
                Compu<span className="text-[#007BFF]">Parts</span>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Verificando Enlace</CardTitle>
            <CardDescription className="text-center">
              Estamos verificando tu enlace de recuperación...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF]"></div>
            </div>
            <p className="text-sm text-gray-600">
              Por favor espera mientras verificamos que tu enlace sea válido.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidToken && !success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Link href="/" className="text-2xl font-bold text-black">
                Compu<span className="text-[#007BFF]">Parts</span>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Enlace de Recuperación Inválido</CardTitle>
            <CardDescription className="text-center">
              El enlace que intentaste usar no es válido o ha expirado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Posibles causas:</strong></p>
                <ul className="text-left space-y-1 ml-4">
                  <li>• El enlace ya fue utilizado</li>
                  <li>• El enlace expiró</li>
                  <li>• El enlace fue copiado incorrectamente</li>
                  <li>• Ya solicitaste un nuevo enlace</li>
                </ul>
              </div>
              
              <div className="pt-4 space-y-3">
                <Button asChild className="w-full bg-[#007BFF] hover:bg-[#0056b3]">
                  <Link href="/recover">
                    Solicitar nuevo enlace de recuperación
                  </Link>
                </Button>
                
                <div className="text-center">
                  <Link href="/login" className="text-sm text-[#007BFF] hover:underline">
                    Volver al inicio de sesión
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold text-black">
              Compu<span className="text-[#007BFF]">Parts</span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {success ? "Contraseña Actualizada" : "Actualizar Contraseña"}
          </CardTitle>
          <CardDescription className="text-center">
            {success ? "Tu contraseña ha sido actualizada exitosamente" : "Ingresa tu nueva contraseña"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            // Vista de éxito
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ¡Contraseña Actualizada!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => router.push("/login")} 
                    className="w-full bg-[#007BFF] hover:bg-[#0056b3]"
                  >
                    Ir al inicio de sesión
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Vista del formulario
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Indicador de fortaleza de contraseña */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Fortaleza:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-2 w-8 rounded ${
                              level <= passwordStrength
                                ? passwordStrength <= 2
                                  ? "bg-red-500"
                                  : passwordStrength <= 3
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {passwordStrength <= 2 ? "Débil" : passwordStrength <= 3 ? "Media" : "Fuerte"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className={`flex items-center space-x-1 ${password.length >= 8 ? "text-green-600" : "text-gray-400"}`}>
                        {password.length >= 8 ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
                        <span>Al menos 8 caracteres</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${/[a-z]/.test(password) ? "text-green-600" : "text-gray-400"}`}>
                        {/[a-z]/.test(password) ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
                        <span>Al menos una letra minúscula</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${/[A-Z]/.test(password) ? "text-green-600" : "text-gray-400"}`}>
                        {/[A-Z]/.test(password) ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
                        <span>Al menos una letra mayúscula</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${/\d/.test(password) ? "text-green-600" : "text-gray-400"}`}>
                        {/\d/.test(password) ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
                        <span>Al menos un número</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#007BFF] hover:bg-[#0056b3]" disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </Button>
            </form>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <Link href="/login" className="text-[#007BFF] hover:underline">
                Volver a inicio de sesión
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
} 