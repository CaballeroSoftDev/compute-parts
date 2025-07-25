export interface Category {
  id: number
  name: string
  description: string
  createdAt: string
  productCount: number
}

export interface Brand {
  id: number
  name: string
  description: string
  website?: string
  createdAt: string
  productCount: number
}

export interface Product {
  id: number
  name: string
  description: string
  category: string
  brand: string
  price: number
  stock: number
  status: "Activo" | "Inactivo" | "Agotado"
  image: string
  featured: boolean
  createdAt: string
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  role: "Cliente" | "Administrador" | "Moderador"
  status: "Activo" | "Inactivo" | "Suspendido"
  joinDate: string
  lastLogin: string
  orders: number
  totalSpent: number
  avatar?: string
  address?: string
  notes?: string
  emailVerified: boolean
  notifications: boolean
}

export interface Order {
  id: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: OrderItem[]
  total: number
  status: "Pendiente" | "Procesando" | "Enviado" | "Completado" | "Cancelado"
  paymentStatus: "Pendiente" | "Pagado" | "Reembolsado" | "Fallido"
  paymentMethod: "Tarjeta" | "PayPal" | "Transferencia" | "Efectivo"
  shippingAddress: string
  trackingNumber?: string
  date: string
  notes?: string
}

export interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}
