import { Badge } from "@/components/ui/badge"
import { ROLE_CONFIG, UserRole } from "@/lib/types"

interface RoleBadgeProps {
	role: UserRole
	showDescription?: boolean
	className?: string
}

export function RoleBadge({ role, showDescription = false, className = "" }: RoleBadgeProps) {
	const roleConfig = ROLE_CONFIG[role]
	
	if (!roleConfig) {
		return null
	}

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<Badge 
				variant={roleConfig.color as any}
				className="text-xs font-medium"
			>
				{roleConfig.label}
			</Badge>
			{showDescription && (
				<span className="text-xs text-gray-500">
					{roleConfig.description}
				</span>
			)}
		</div>
	)
}

// Componente para mostrar información completa del rol
export function RoleInfo({ role }: { role: UserRole }) {
	const roleConfig = ROLE_CONFIG[role]
	
	if (!roleConfig) {
		return null
	}

	return (
		<div className="space-y-2">
			<RoleBadge role={role} />
			<div className="text-sm text-gray-600">
				<p className="font-medium">{roleConfig.label}</p>
				<p className="text-xs">{roleConfig.description}</p>
			</div>
			<div className="text-xs text-gray-500">
				<strong>Permisos:</strong>
				<ul className="mt-1 space-y-1">
					{roleConfig.permissions.map((permission, index) => (
						<li key={index} className="ml-2">
							• {permission}
						</li>
					))}
				</ul>
			</div>
		</div>
	)
} 