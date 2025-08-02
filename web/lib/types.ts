export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  productCount: number;
}

export interface Brand {
  id: number;
  name: string;
  description: string;
  website?: string;
  createdAt: string;
  productCount: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: 'Activo' | 'Inactivo' | 'Agotado';
  image: string;
  featured: boolean;
  createdAt: string;
}

// Sistema de roles mejorado
export type UserRole = 'superadmin' | 'admin' | 'cliente';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'Activo' | 'Inactivo' | 'Suspendido';
  joinDate: string;
  lastLogin: string;
  orders: number;
  totalSpent: number;
  avatar?: string;
  address?: string;
  notes?: string;
  emailVerified: boolean;
  notifications: boolean;
  // Campos adicionales para roles
  permissions?: string[];
  createdBy?: string; // Para tracking de quién creó el usuario
  canManageUsers?: boolean;
  canManageSystem?: boolean;
}

export interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  status: 'Pendiente' | 'Procesando' | 'Enviado' | 'Completado' | 'Cancelado';
  paymentStatus: 'Pendiente' | 'Pagado' | 'Reembolsado' | 'Fallido';
  paymentMethod: 'Tarjeta' | 'PayPal' | 'Transferencia' | 'Efectivo';
  shippingAddress: string;
  trackingNumber?: string;
  date: string;
  notes?: string;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Tipos para permisos y autorización
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RolePermissions {
  superadmin: Permission[];
  admin: Permission[];
  cliente: Permission[];
}

// Configuración de roles
export const ROLE_CONFIG = {
  superadmin: {
    label: 'Super Administrador',
    description: 'Acceso total al sistema',
    color: 'destructive',
    permissions: [
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'products:create',
      'products:read',
      'products:update',
      'products:delete',
      'orders:create',
      'orders:read',
      'orders:update',
      'orders:delete',
      'system:configure',
      'reports:view',
      'analytics:view',
    ],
  },
  admin: {
    label: 'Administrador',
    description: 'Gestión de productos y pedidos',
    color: 'default',
    permissions: [
      'users:read',
      'users:update',
      'products:create',
      'products:read',
      'products:update',
      'products:delete',
      'orders:read',
      'orders:update',
      'reports:view',
    ],
  },
  cliente: {
    label: 'Cliente',
    description: 'Acceso a compras y perfil',
    color: 'secondary',
    permissions: [
      'profile:read',
      'profile:update',
      'orders:read',
      'orders:create',
      'products:read',
      'cart:manage',
      'favorites:manage',
    ],
  },
} as const;
