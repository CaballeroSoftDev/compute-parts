"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, ShoppingCart, User, Menu, X, LogOut, Settings, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFavorites } from "@/lib/favorites-context"
import { useAuth } from "@/lib/auth-context"
import { useAuthorization } from "@/lib/hooks/use-authorization"
import { RoleBadge } from "@/components/ui/role-badge"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function Header() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const { favorites } = useFavorites()
	const { user, signOut, profile } = useAuth()
	const { userRole, canAccessAdmin, getRoleInfo } = useAuthorization()

	const navigationItems = [
		{ name: "Catálogo", href: "/catalog" },
		{ name: "Marcas", href: "/brands" },
		{ name: "Soporte", href: "/support" },
	]

	const roleInfo = getRoleInfo()

	return (
		<header className="bg-white shadow-sm border-b">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Mobile menu button */}
					<div className="md:hidden">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsMobileMenuOpen(true)}
							className="text-gray-600 hover:text-gray-900"
						>
							<Menu className="h-6 w-6" />
						</Button>
					</div>

					{/* Logo */}
					<div className="flex-shrink-0">
						<Link href="/" className="flex items-center">
							<span className="text-2xl font-bold">
								Compu<span className="text-[#007BFF]">Parts</span>
							</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex space-x-8">
						{navigationItems.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className="text-gray-600 hover:text-[#007BFF] px-3 py-2 text-sm font-medium transition-colors"
							>
								{item.name}
							</Link>
						))}
					</nav>

					{/* Action buttons */}
					<div className="flex items-center space-x-4">
						<Link href="/favorites">
							<Button variant="ghost" size="icon" className="relative">
								<Heart className="h-5 w-5" />
								{favorites.length > 0 && (
									<Badge
										variant="destructive"
										className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
									>
										{favorites.length}
									</Badge>
								)}
							</Button>
						</Link>
						<Link href="/cart">
							<Button variant="ghost" size="icon">
								<ShoppingCart className="h-5 w-5" />
							</Button>
						</Link>
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<User className="h-5 w-5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-64">
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">
												{profile?.first_name} {profile?.last_name}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link href="/profile">
											<User className="mr-2 h-4 w-4" />
											Mi Perfil
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href="/orders">
											<ShoppingCart className="mr-2 h-4 w-4" />
											Mis Pedidos
										</Link>
									</DropdownMenuItem>
									{canAccessAdmin() && (
										<>
											<DropdownMenuSeparator />
											<DropdownMenuItem asChild>
												<Link href="/admin">
													<Shield className="mr-2 h-4 w-4" />
													Panel Admin
												</Link>
											</DropdownMenuItem>
										</>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={signOut} className="text-red-600">
										<LogOut className="mr-2 h-4 w-4" />
										Cerrar Sesión
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Link href="/login">
								<Button variant="ghost" size="icon">
									<User className="h-5 w-5" />
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-50 md:hidden">
					<div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
					<div className="fixed inset-y-0 left-0 w-80 sm:w-96 bg-white shadow-xl">
						<div className="flex items-center justify-between h-16 px-4 border-b">
							<Link href="/" className="flex items-center">
								<span className="text-xl font-bold">
									Compu<span className="text-[#007BFF]">Parts</span>
								</span>
							</Link>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsMobileMenuOpen(false)}
								className="text-gray-400 hover:text-gray-600"
							>
								<X className="h-6 w-6" />
							</Button>
						</div>
						<nav className="px-4 py-6 space-y-4">
							{navigationItems.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									onClick={() => setIsMobileMenuOpen(false)}
									className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#007BFF] hover:bg-gray-50 rounded-md transition-colors"
								>
									{item.name}
								</Link>
							))}
							{user && (
								<>
									<div className="border-t pt-4">
										<div className="px-3 py-2">
											<p className="text-sm font-medium">
												{profile?.first_name} {profile?.last_name}
											</p>
										</div>
									</div>
									<Link
										href="/profile"
										onClick={() => setIsMobileMenuOpen(false)}
										className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#007BFF] hover:bg-gray-50 rounded-md transition-colors"
									>
										Mi Perfil
									</Link>
									<Link
										href="/orders"
										onClick={() => setIsMobileMenuOpen(false)}
										className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#007BFF] hover:bg-gray-50 rounded-md transition-colors"
									>
										Mis Pedidos
									</Link>
									{canAccessAdmin() && (
										<Link
											href="/admin"
											onClick={() => setIsMobileMenuOpen(false)}
											className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-[#007BFF] hover:bg-gray-50 rounded-md transition-colors"
										>
											Panel Admin
										</Link>
									)}
									<button
										onClick={() => {
											signOut()
											setIsMobileMenuOpen(false)
										}}
										className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
									>
										Cerrar Sesión
									</button>
								</>
							)}
						</nav>
					</div>
				</div>
			)}
		</header>
	)
}
