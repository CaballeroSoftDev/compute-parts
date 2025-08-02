'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, User, Menu, X, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/lib/favorites-context';
import { useAuth } from '@/lib/auth-context';
import { useAuthorization } from '@/lib/hooks/use-authorization';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { favorites } = useFavorites();
  const { user, signOut, profile } = useAuth();
  const { canAccessAdmin } = useAuthorization();

  const navigationItems = [
    { name: 'Catálogo', href: '/catalog' },
    { name: 'Marcas', href: '/brands' },
    { name: 'Soporte', href: '/support' },
  ];

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
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
            <Link
              href="/"
              className="flex items-center"
            >
              <span className="text-2xl font-bold">
                Compu<span className="text-[#007BFF]">Parts</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-8 md:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#007BFF]"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/favorites">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs"
                  >
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    style={{ cursor: 'pointer' }}
                  >
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    style={{ cursor: 'pointer' }}
                  >
                    <Link href="/orders">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Mis Pedidos
                    </Link>
                  </DropdownMenuItem>
                  {canAccessAdmin() && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        asChild
                        style={{ cursor: 'pointer' }}
                      >
                        <Link href="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          Panel Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-red-600"
                    style={{ cursor: 'pointer' }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="icon"
                >
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
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl sm:w-96">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Link
                href="/"
                className="flex items-center"
              >
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
            <nav className="space-y-4 px-4 py-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#007BFF]"
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
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#007BFF]"
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#007BFF]"
                  >
                    Mis Pedidos
                  </Link>
                  {canAccessAdmin() && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#007BFF]"
                    >
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
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
  );
}
