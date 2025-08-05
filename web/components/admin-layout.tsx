'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  Tags,
  Building2,
  ClipboardList,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  HomeIcon,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Package,
  Tags,
  Building2,
  ClipboardList,
  Users,
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarExpanded');
    if (saved !== null) {
      setIsExpanded(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('adminSidebarExpanded', JSON.stringify(newState));
  };

  // Agregar la función de cerrar sesión
  const handleLogout = () => {
    // Limpiar datos de sesión del localStorage si los hay
    localStorage.removeItem('adminSession');
    localStorage.removeItem('userToken');

    // Redirigir a la página de login
    window.location.href = '/login';
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Solo mostrar el logo en el sidebar si NO es móvil */}
      {!isMobile && (
        <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
          {isExpanded ? (
            <Link
              href="/admin"
              className="flex items-center"
            >
              <span className="text-xl font-bold">
                Compu<span className="text-[#007BFF]">Parts</span>
              </span>
            </Link>
          ) : (
            <Link
              href="/admin"
              className="flex items-center"
            >
              <span className="text-xl font-bold text-[#007BFF]">CP</span>
            </Link>
          )}
        </div>
      )}

      <nav className={cn('flex-1 space-y-1 overflow-y-auto px-3 py-6', isMobile && 'pt-6')}>
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = iconMap[item.icon as keyof typeof iconMap];

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
                isActive ? 'bg-gray-100 text-[#007BFF]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#007BFF]',
                !isExpanded && !isMobile && 'justify-center'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-[#007BFF]' : 'text-gray-400 group-hover:text-[#007BFF]',
                  (isExpanded || isMobile) && 'mr-3'
                )}
              />
              {(isExpanded || isMobile) && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4 pb-4">
        <hr className="border-gray-200" />

        <Button
          onClick={() => (window.location.href = '/')}
          variant="ghost"
          className={cn(
            'group flex w-full items-center rounded-none px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#007BFF]',
            !isExpanded && !isMobile && 'justify-center'
          )}
        >
          <HomeIcon
            className={cn(
              'h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-[#007BFF]',
              (isExpanded || isMobile) && 'mr-3'
            )}
          />
          {(isExpanded || isMobile) && <span>Volver al inicio</span>}
        </Button>

        <Button
          onClick={() => {
            handleLogout();
            if (isMobile) setIsMobileMenuOpen(false);
          }}
          variant="ghost"
          className={cn(
            'group flex w-full items-center rounded-none px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600',
            !isExpanded && !isMobile && 'justify-center'
          )}
        >
          <LogOut
            className={cn(
              'h-5 flex-shrink-0 text-gray-400 group-hover:text-red-600',
              (isExpanded || isMobile) && 'mr-3'
            )}
          />
          {(isExpanded || isMobile) && <span>Cerrar Sesión</span>}
        </Button>

        {/* Solo mostrar el botón contraer en desktop */}
        {!isMobile && (
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            className={cn(
              'group flex w-full items-center rounded-none px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600',
              !isExpanded && 'justify-center'
            )}
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="mr-3 h-4 w-4 flex-shrink-0" />
                <span>Contraer</span>
              </>
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
          </Button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden transition-all duration-300 lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white',
          isExpanded ? 'lg:w-64' : 'lg:w-[70px]'
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 border-r border-gray-200 bg-white">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              <Link
                href="/admin"
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
              >
                <X className="h-6 w-6 text-gray-400" />
              </Button>
            </div>
            <SidebarContent isMobile={true} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300',
          'lg:ml-64',
          !isExpanded && 'lg:ml-[70px]'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </Button>
          <Link
            href="/admin"
            className="flex items-center"
          >
            <span className="text-xl font-bold">
              Compu<span className="text-[#007BFF]">Parts</span>
            </span>
          </Link>
          <div className="w-6" />
        </div>

        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
