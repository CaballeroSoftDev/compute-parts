import type React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  headerClassName?: string;
  footerClassName?: string;
  className?: string;
}

export function MainLayout({
  children,
  showNavigation = true,
  showFooter = true,
  headerClassName,
  footerClassName,
  className = '',
}: MainLayoutProps) {
  return (
    <div className={`flex min-h-screen flex-col ${className}`}>
      <Header
        showNavigation={showNavigation}
        className={headerClassName}
      />

      <main className="flex-1">{children}</main>

      {showFooter && <Footer className={footerClassName} />}
    </div>
  );
}
