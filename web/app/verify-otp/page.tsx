"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Inicializar refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
    // Enfocar el primer input al cargar
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    // Permitir solo números
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.substring(0, 1)
    setOtp(newOtp)

    // Mover al siguiente input si se ingresó un dígito
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Mover al input anterior al presionar backspace en un input vacío
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Verificar si lo pegado son solo dígitos y tiene la longitud correcta
    if (/^\d+$/.test(pastedData) && pastedData.length <= 6) {
      const newOtp = [...otp]

      // Llenar los inputs con los dígitos pegados
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newOtp[i] = pastedData[i]
      }

      setOtp(newOtp)

      // Enfocar el último input lleno o el siguiente vacío
      const lastIndex = Math.min(pastedData.length, 5)
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex]?.focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const otpValue = otp.join("")

    // Validación básica
    if (otpValue.length !== 6) {
      setError("Por favor ingresa el código OTP completo (6 dígitos)")
      return
    }

    setLoading(true)

    // Simulación de verificación OTP
    try {
      // Aquí iría la lógica real de verificación
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirección después de verificación exitosa
      window.location.href = "/"
    } catch (err) {
      setError("Código OTP inválido. Por favor verifica e intenta de nuevo.")
    } finally {
      setLoading(false)
    }
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
          <CardTitle className="text-2xl font-bold text-center">Verificación OTP</CardTitle>
          <CardDescription className="text-center">
            Ingresa el código de 6 dígitos enviado a tu teléfono
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-xl"
                  aria-label={`Dígito ${index + 1} del código OTP`}
                />
              ))}
            </div>

            <Button type="submit" className="w-full bg-[#007BFF] hover:bg-[#0056b3]" disabled={loading}>
              {loading ? "Verificando..." : "Verificar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            ¿No recibiste el código?{" "}
            <Button variant="link" className="p-0 h-auto text-[#007BFF] hover:underline">
              Reenviar código
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
