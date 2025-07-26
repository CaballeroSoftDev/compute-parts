import Link from "next/link"

interface FooterProps {
  className?: string
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`border-t bg-white ${className}`}>
      <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8">
        {/* Brand Section */}
        <div className="flex-1">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-black">
              Compu<span className="text-[#007BFF]">Parts</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">
            Especialistas en venta de piezas electrónicas en la zona sur de México.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex-1">
          <h3 className="mb-2 text-sm font-medium text-black">Enlaces</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="text-gray-500 hover:text-[#007BFF] transition-colors">
                Acerca de Nosotros
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-500 hover:text-[#007BFF] transition-colors">
                Contacto
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-gray-500 hover:text-[#007BFF] transition-colors">
                Términos y Condiciones
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="flex-1">
          <h3 className="mb-2 text-sm font-medium text-black">Contacto</h3>
          <ul className="space-y-2 text-sm">
            <li className="text-gray-500">Email: info@compuparts.mx</li>
            <li className="text-gray-500">Teléfono: (999) 123-4567</li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-gray-500">© 2024 CompuParts. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-[#007BFF] transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/cookies" className="text-xs text-gray-500 hover:text-[#007BFF] transition-colors">
              Política de Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
