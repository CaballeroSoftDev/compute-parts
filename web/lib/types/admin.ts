// Tipos para el panel administrativo basados en la estructura de Supabase

export interface AdminProduct {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  brand_id: string | null;
  sku: string | null;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  weight: number | null;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
  specifications: Record<string, any> | null;
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  category?: AdminCategory;
  brand?: AdminBrand;
  images?: AdminProductImage[];
  variants?: AdminProductVariant[];
}

export interface AdminCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  products_count?: number;
}

export interface AdminBrand {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  products_count?: number;
}

export interface AdminProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number | null;
  is_primary: boolean;
  created_at: string;
}

export interface AdminProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_adjustment: number | null;
  stock_quantity: number | null;
  sku: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  state: string | null;
  country: string | null;
  is_first_purchase: boolean;
  email_verified: boolean;
  notifications_enabled: boolean;
  role: 'superadmin' | 'admin' | 'cliente';
  created_at: string;
  updated_at: string;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  status: 'Pendiente' | 'Procesando' | 'Enviado' | 'Completado' | 'Cancelado';
  payment_status: 'Pendiente' | 'Pagado' | 'Reembolsado' | 'Fallido';
  payment_method: 'Tarjeta' | 'PayPal' | 'Transferencia' | 'Efectivo';
  subtotal: number;
  tax_amount: number | null;
  shipping_amount: number | null;
  discount_amount: number | null;
  total_amount: number;
  shipping_address_id: string | null;
  shipping_address: Record<string, any> | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  user?: AdminUser;
  items?: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_sku: string | null;
  product_image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  // Relaciones
  product?: AdminProduct;
  variant?: AdminProductVariant;
}

// Tipos para formularios
export interface CreateProductForm {
  name: string;
  description: string;
  short_description: string;
  category_id: string;
  brand_id: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  specifications?: Record<string, any>;
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  images?: ProductImageForm[];
}

export interface ProductImageForm {
  id?: string;
  url: string;
  path: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
  file?: File; // Archivo para subida diferida
  isNew?: boolean; // Indica si es una imagen nueva
}

export interface UpdateProductForm extends Partial<CreateProductForm> {
  id: string;
}

export interface CreateCategoryForm {
  name: string;
  description?: string;
  slug?: string;
  image_url?: string;
  is_active: boolean;
}

export interface UpdateCategoryForm extends Partial<CreateCategoryForm> {}

export interface CreateBrandForm {
  name: string;
  description?: string;
  website?: string;
  is_active: boolean;
  logo_file?: File; // Archivo para subida de logo
}

export interface UpdateBrandForm extends Partial<CreateBrandForm> {
  logo_file?: File; // Archivo para subida de logo
  logo_url?: string; // URL del logo
}

// Tipos para filtros y paginación
export interface AdminFilters {
  search?: string;
  category_id?: string;
  brand_id?: string;
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;
  price_min?: number;
  price_max?: number;
  stock_min?: number;
  stock_max?: number;
  created_at_from?: string;
  created_at_to?: string;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface AdminListResponse<T> {
  data: T[];
  pagination: AdminPagination;
}

// Tipos para estadísticas
export interface AdminStats {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_categories: number;
  total_brands: number;
  total_orders: number;
  pending_orders: number;
  total_users: number;
  total_revenue: number;
}
