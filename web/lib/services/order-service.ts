import { supabase } from '../supabase';
import { CartService } from './cart-service';

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  status: 'Pendiente' | 'Procesando' | 'Enviado' | 'Completado' | 'Cancelado';
  payment_status: 'Pendiente' | 'Pagado' | 'Reembolsado' | 'Fallido';
  payment_method: 'Tarjeta' | 'PayPal' | 'Transferencia' | 'Efectivo';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  shipping_address_id?: string;
  shipping_address?: any; // JSON backup
  payment_details?: any; // Detalles del pago (PayPal, tarjeta, etc.)
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  items?: OrderItem[];
  services?: OrderService[];
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  shipping_address_data?: {
    id: string;
    first_name: string;
    last_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  product_sku?: string;
  product_image_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  // Relaciones
  product?: {
    id: string;
    name: string;
    price: number;
    sku: string;
  };
  variant?: {
    id: string;
    name: string;
    value: string;
    price_adjustment: number;
  };
}

export interface OrderService {
  id: string;
  order_id: string;
  service_id: string;
  service_name: string;
  price: number;
  created_at: string;
}

export interface CreateOrderData {
  payment_method: 'Tarjeta' | 'PayPal' | 'Transferencia' | 'Efectivo';
  shipping_method: 'pickup' | 'delivery';
  shipping_address?: {
    first_name: string;
    last_name: string;
    phone?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
  };
  selected_services?: string[];
  notes?: string;
  payment_details?: any;
  items?: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
  }>;
  guest_info?: {
    email: string;
    name: string;
    phone: string;
  };
}

export interface PaymentData {
  order_id: string;
  payment_method: 'Tarjeta' | 'PayPal' | 'Transferencia' | 'Efectivo';
  payment_details?: any;
}

export class OrderService {
  // Generar número de orden único
  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  // Crear orden (ahora se maneja desde la Edge Function)
  static async createOrder(orderData: CreateOrderData, userId?: string): Promise<Order> {
    // Esta función ya no se usa directamente desde el cliente
    // Las órdenes se crean desde la Edge Function
    throw new Error('createOrder debe llamarse desde la Edge Function');
  }

  // Obtener orden por ID
  static async getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
				*,
				items:order_items(
					*,
					product:products(
						id,
						name,
						price,
						sku
					),
					variant:product_variants(
						id,
						name,
						value,
						price_adjustment
					)
				),
				services:order_services(*),
				shipping_address_data:shipping_addresses(*)
			`
      )
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error obteniendo orden:', error);
      return null;
    }

    // Si la orden tiene un user_id, obtener los datos del perfil por separado
    if (data.user_id) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', data.user_id)
        .single();

      if (!profileError && profileData) {
        data.user = {
          id: profileData.id,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: '', // No incluimos email por seguridad
        };
      }
    }

    return data;
  }

  // Obtener órdenes del usuario
  static async getUserOrders(
    page = 1,
    limit = 10
  ): Promise<{
    orders: Order[];
    total: number;
    totalPages: number;
  }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Usuario no autenticado');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('orders')
      .select(
        `
				*,
				items:order_items(
					*,
					product:products(
						id,
						name,
						price,
						sku
					)
				),
				services:order_services(*)
			`,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error obteniendo órdenes:', error);
      throw new Error('Error al obtener las órdenes');
    }

    return {
      orders: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  // Actualizar estado de pago (ahora se maneja desde la Edge Function)
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: Order['payment_status'],
    paymentDetails?: any
  ): Promise<Order> {
    // Esta función ya no se usa directamente desde el cliente
    // Los estados de pago se actualizan desde la Edge Function
    throw new Error('updatePaymentStatus debe llamarse desde la Edge Function');
  }

  // Actualizar estado de la orden
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    // Usar supabase para actualizar el estado de la orden
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select().single();

    if (error) {
      console.error('Error actualizando estado de orden:', error);
      throw new Error('Error al actualizar el estado de la orden');
    }

    return data;
  }

  // Cancelar orden
  static async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    // Usar supabase para cancelar la orden
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'Cancelado',
        notes: reason ? `Cancelada: ${reason}` : 'Orden cancelada por el cliente',
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error cancelando orden:', error);
      throw new Error('Error al cancelar la orden');
    }

    return data;
  }

  // Obtener estadísticas de órdenes
  static async getOrderStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    completed: number;
    cancelled: number;
  }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase.from('orders').select('status').eq('user_id', user.id);

    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error al obtener estadísticas');
    }

    const stats = {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
    };

    data?.forEach((order) => {
      stats.total++;
      switch (order.status) {
        case 'Pendiente':
          stats.pending++;
          break;
        case 'Procesando':
          stats.processing++;
          break;
        case 'Enviado':
          stats.shipped++;
          break;
        case 'Completado':
          stats.completed++;
          break;
        case 'Cancelado':
          stats.cancelled++;
          break;
      }
    });

    return stats;
  }
}
