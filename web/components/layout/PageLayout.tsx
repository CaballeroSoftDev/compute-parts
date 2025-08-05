import type React from 'react';
import { MainLayout } from './MainLayout';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showNavigation?: boolean;
  showFooter?: boolean;
  headerClassName?: string;
  footerClassName?: string;
  className?: string;
}

export function PageLayout({
  children,
  title,
  description,
  showNavigation = true,
  showFooter = true,
  headerClassName,
  footerClassName,
  className = '',
}: PageLayoutProps) {
  return (
    <MainLayout
      showNavigation={showNavigation}
      showFooter={showFooter}
      headerClassName={headerClassName}
      footerClassName={footerClassName}
      className={className}
    >
      {title && (
        <section className="border-b bg-white py-12">
          <div className="container px-4 md:px-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tighter text-black sm:text-4xl md:text-5xl">{title}</h1>
              {description && <p className="mx-auto max-w-[700px] text-gray-700 md:text-xl">{description}</p>}
            </div>
          </div>
        </section>
      )}
      {children}
    </MainLayout>
  );
}
