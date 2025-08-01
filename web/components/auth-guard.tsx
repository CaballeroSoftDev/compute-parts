'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { UserRole, ROLE_CONFIG } from '@/lib/types'

interface AuthGuardProps {
	children: React.ReactNode
	requireAuth?: boolean
	allowedRoles?: UserRole[]
	requiredPermissions?: string[]
	redirectTo?: string
}

export function AuthGuard({ 
	children, 
	requireAuth = true, 
	allowedRoles = [],
	requiredPermissions = [],
	redirectTo = '/login'
}: AuthGuardProps) {
	const { user, profile, userRole, hasPermission, loading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!loading) {
			// Verificar si requiere autenticación
			if (requireAuth && !user) {
				router.push(redirectTo)
				return
			}

			// Verificar roles permitidos
			if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
				router.push('/')
				return
			}

			// Verificar permisos requeridos
			if (requiredPermissions.length > 0) {
				const hasAllPermissions = requiredPermissions.every(permission => 
					hasPermission(permission)
				)
				
				if (!hasAllPermissions) {
					router.push('/')
					return
				}
			}
		}
	}, [user, profile, userRole, loading, requireAuth, allowedRoles, requiredPermissions, redirectTo, router, hasPermission])

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF] mx-auto"></div>
					<p className="mt-2 text-gray-600">Cargando...</p>
				</div>
			</div>
		)
	}

	// Verificaciones finales antes de renderizar
	if (requireAuth && !user) {
		return null
	}

	if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
		return null
	}

	if (requiredPermissions.length > 0) {
		const hasAllPermissions = requiredPermissions.every(permission => 
			hasPermission(permission)
		)
		
		if (!hasAllPermissions) {
			return null
		}
	}

	return <>{children}</>
}

// Componentes específicos para diferentes niveles de acceso
export function AdminGuard({ children }: { children: React.ReactNode }) {
	return (
		<AuthGuard allowedRoles={['admin', 'superadmin']}>
			{children}
		</AuthGuard>
	)
}

export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
	return (
		<AuthGuard allowedRoles={['superadmin']}>
			{children}
		</AuthGuard>
	)
}

export function ClientGuard({ children }: { children: React.ReactNode }) {
	return (
		<AuthGuard allowedRoles={['cliente', 'admin', 'superadmin']}>
			{children}
		</AuthGuard>
	)
} 