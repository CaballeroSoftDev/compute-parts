export const NAVIGATION_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { name: "Productos", href: "/admin/products", icon: "Package" },
  { name: "Categorías", href: "/admin/categories", icon: "Tags" },
  { name: "Marcas", href: "/admin/brands", icon: "Building2" },
  { name: "Pedidos", href: "/admin/orders", icon: "ClipboardList" },
  { name: "Usuarios", href: "/admin/users", icon: "Users" },
] as const

export const STATUS_COLORS = {
  Activo: "bg-green-100 text-green-800",
  Inactivo: "bg-gray-100 text-gray-800",
  Suspendido: "bg-red-100 text-red-800",
  Completado: "bg-green-100 text-green-800",
  Procesando: "bg-blue-100 text-blue-800",
  Enviado: "bg-purple-100 text-purple-800",
  Pendiente: "bg-yellow-100 text-yellow-800",
  Cancelado: "bg-red-100 text-red-800",
  Pagado: "bg-green-100 text-green-800",
  Reembolsado: "bg-blue-100 text-blue-800",
  Fallido: "bg-red-100 text-red-800",
} as const

export const STOCK_THRESHOLDS = {
  LOW: 10,
  EMPTY: 0,
} as const
