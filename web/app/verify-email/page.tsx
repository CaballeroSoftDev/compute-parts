'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Mail, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'

export default function VerifyEmailPage() {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')

	const handleResendEmail = async () => {
		if (!email) {
			setError('Por favor ingresa tu email')
			return
		}

		setLoading(true)
		setError('')
		setMessage('')

		try {
			const { error } = await supabase.auth.resend({
				type: 'signup',
				email: email,
			})

			if (error) {
				setError(error.message)
			} else {
				setMessage('Email de verificación reenviado. Revisa tu bandeja de entrada.')
			}
		} catch (err) {
			setError('Error al reenviar el email')
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
					<div className="flex justify-center mb-4">
						<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
							<CheckCircle className="h-6 w-6 text-green-600" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold text-center">¡Registro Exitoso!</CardTitle>
					<CardDescription className="text-center">
						Tu cuenta ha sido creada correctamente
					</CardDescription>
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

					<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
						<div className="flex items-start gap-2">
							<span className="text-sm text-gray-600">
								Hemos enviado un correo de verificación a tu dirección de correo electrónico. Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
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
							className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
						/>
						<Button
							onClick={handleResendEmail}
							disabled={loading}
							className="w-full bg-gray-600 hover:bg-gray-700 text-white"
						>
							{loading ? 'Enviando...' : 'Reenviar correo de verificación'}
						</Button>
					</div>
					
					<div className="text-center">
						<Link href="/login">
							<Button variant="link" className="text-[#007BFF] p-0">
								Volver al inicio de sesión
							</Button>
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	)
} 