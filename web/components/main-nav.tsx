import Link from 'next/link';

export function MainNav() {
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
      <Link
        href="/support"
        className="font-medium text-black transition-colors hover:text-[#007BFF]"
      >
        Soporte
      </Link>
    </nav>
  );
}
