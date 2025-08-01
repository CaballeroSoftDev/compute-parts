"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Mail, Clock, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const [showVerificationMessage, setShowVerificationMessage] = useState(false)
	const [resendLoading, setResendLoading] = useState(false)
	const [resendSuccess, setResendSuccess] = useState(false)
	const { signIn, userRole } = useAuth()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setShowVerificationMessage(false)
		setResendSuccess(false)

		// Validación básica
		if (!email || !password) {
			setError("Por favor completa todos los campos")
			return
		}

		if (!email.includes("@") || !email.includes(".")) {
			setError("Por favor ingresa un correo electrónico válido")
			return
		}

		if (password.length < 6) {
			setError("La contraseña debe tener al menos 6 caracteres")
			return
		}

		setLoading(true)

		try {
			const { error } = await signIn(email, password)
			
			if (error) {
				// Verificar si el error es por email no verificado
				if (error.message?.includes("Email not confirmed") || 
						error.message?.includes("email not confirmed") ||
						error.message?.includes("Email not verified") ||
						error.message?.includes("email not verified")) {
					setShowVerificationMessage(true)
					setError("")
				} else {
					setError(error.message || "Error al iniciar sesión. Verifica tus credenciales.")
				}
			} else {
				// Redirección según el rol del usuario
				setTimeout(() => {
					if (userRole === 'superadmin' || userRole === 'admin') {
						router.push("/admin")
					} else {
						router.push("/")
					}
				}, 100) // Pequeño delay para asegurar que el contexto se actualice
			}
		} catch (err) {
			setError("Error al iniciar sesión. Verifica tus credenciales.")
		} finally {
			setLoading(false)
		}
	}

	const handleResendEmail = async () => {
		if (!email) {
			setError("Por favor ingresa tu email")
			return
		}

		setResendLoading(true)
		setError("")

		try {
			const { error } = await supabase.auth.resend({
				type: 'signup',
				email: email,
			})

			if (error) {
				setError(error.message)
			} else {
				setResendSuccess(true)
				setError("")
			}
		} catch (err) {
			setError("Error al reenviar el email")
		} finally {
			setResendLoading(false)
		}
	}

	const handleBackToLogin = () => {
		setShowVerificationMessage(false)
		setResendSuccess(false)
		setError("")
	}

	// Si se muestra el mensaje de verificación, mostrar la interfaz de verificación
	if (showVerificationMessage) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<div className="flex justify-center mb-4">
							<Link href="/" className="text-2xl font-bold text-black">
								Compu<span className="text-[#007BFF]">Parts</span>
							</Link>
						</div>
						<div className="flex justify-center mb-4">
							<div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
								<AlertCircle className="h-6 w-6 text-yellow-600" />
							</div>
						</div>
						<CardTitle className="text-2xl font-bold text-center">Verificación Pendiente</CardTitle>
						<CardDescription className="text-center">
							Tu cuenta necesita ser verificada para continuar
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{!resendSuccess && (
							<Alert variant="destructive">
								<AlertDescription>
									No puedes iniciar sesión porque tu cuenta aún no ha sido verificada.
								</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
								<Mail className="h-4 w-4" />
								<span className="text-blue-700 font-medium">{email}</span>
							</div>
						</div>

						<div className="flex items-start gap-2 text-sm text-gray-600">
							<span>
								Revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta y poder iniciar sesión.
							</span>
						</div>

						{resendSuccess && (
							<Alert>
								<CheckCircle className="h-4 w-4 text-green-600" />
								<AlertDescription className="text-green-600">
									Email de verificación reenviado. Revisa tu bandeja de entrada.
								</AlertDescription>
							</Alert>
						)}
					</CardContent>
					<CardFooter className="flex flex-col space-y-3">
						<Button
							onClick={handleResendEmail}
							disabled={resendLoading}
							className="w-full bg-[#007BFF] hover:bg-[#0056b3]"
						>
							{resendLoading ? "Enviando..." : "Reenviar correo de verificación"}
						</Button>
						
						<Button
							onClick={handleBackToLogin}
							variant="outline"
							className="w-full"
						>
							Volver al inicio de sesión
						</Button>
						
					</CardFooter>
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
					<CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
					<CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<div className="space-y-2">
							<Label htmlFor="email">Correo electrónico</Label>
							<Input
								id="email"
								type="email"
								placeholder="correo@ejemplo.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Contraseña</Label>
								<Link href="/recover" className="text-xs text-[#007BFF] hover:underline">
									¿Olvidaste tu contraseña?
								</Link>
							</div>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<Button type="submit" className="w-full bg-[#007BFF] hover:bg-[#0056b3]" disabled={loading}>
							{loading ? "Iniciando sesión..." : "Iniciar Sesión"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<div className="text-center text-sm">
						¿No tienes una cuenta?{" "}
						<Link href="/register" className="text-[#007BFF] hover:underline">
							Regístrate
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	)
}
