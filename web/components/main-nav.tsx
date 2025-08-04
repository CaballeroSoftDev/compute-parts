import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';

export function MainNav() {
  const { user } = useAuth();

  return (
    <nav className="flex items-center gap-6 text-sm">
      <Link
        href="/catalog"
        className="font-medium text-black transition-colors hover:text-[#007BFF]"
      >
        Catálogo
      </Link>
      <Link
        href="/brands"
        className="font-medium text-black transition-colors hover:text-[#007BFF]"
      >
        Marcas
      </Link>
      {user && (
        <Link
          href="/orders"
          className="font-medium text-black transition-colors hover:text-[#007BFF]"
        >
          Mis Órdenes
        </Link>
      )}
      <Link
        href="/support"
        className="font-medium text-black transition-colors hover:text-[#007BFF]"
      >
        Soporte
      </Link>
    </nav>
  );
}
