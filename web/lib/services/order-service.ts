import { supabase } from '../supabase';
import { supabaseServer } from '../supabase-server';
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
		const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
		return `ORD-${timestamp}-${random}`;
	}

	// Crear una nueva orden
	static async createOrder(orderData: CreateOrderData): Promise<Order> {
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		// Usar items proporcionados o obtener del carrito
		let items = orderData.items;
		let subtotal = 0;
		
		if (!items || items.length === 0) {
			// Obtener items del carrito si no se proporcionaron
			const cartItems = await CartService.getCartItems();
			if (cartItems.length === 0) {
				throw new Error('El carrito está vacío');
			}
			
			items = cartItems.map(item => ({
				product_id: item.product_id,
				name: item.product?.name || 'Producto',
				price: item.product?.price || 0,
				quantity: item.quantity,
				image_url: item.product?.product_images?.[0]?.image_url,
			}));
		}
		
		// Calcular subtotal
		subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
		
		// Obtener servicios seleccionados
		let servicesTotal = 0;
		let selectedServices: any[] = [];
		if (orderData.selected_services && orderData.selected_services.length > 0) {
			const { data: services } = await supabase
				.from('additional_services')
				.select('*')
				.in('id', orderData.selected_services);
			
			selectedServices = services || [];
			servicesTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
		}

		// Calcular envío
		const shippingAmount = orderData.shipping_method === 'delivery' ? 150 : 0;

		// Verificar si es primera compra para envío gratis
		let finalShippingAmount = shippingAmount;
		if (user && orderData.shipping_method === 'delivery') {
			const { data: profile } = await supabase
				.from('profiles')
				.select('is_first_purchase')
				.eq('id', user.id)
				.single();
			
			if (profile?.is_first_purchase) {
				finalShippingAmount = 0;
			}
		}

		const totalAmount = subtotal + servicesTotal + finalShippingAmount;

		// Crear dirección de envío si es necesario
		let shippingAddressId: string | undefined;
		if (orderData.shipping_address && orderData.shipping_method === 'delivery') {
			if (user) {
				const { data: address, error: addressError } = await supabase
					.from('shipping_addresses')
					.insert({
						user_id: user.id,
						...orderData.shipping_address,
					})
					.select()
					.single();

				if (addressError) {
					console.error('Error creando dirección:', addressError);
				} else {
					shippingAddressId = address.id;
				}
			}
		}

		// Crear la orden usando el cliente del servidor para evitar problemas de RLS
		const orderNumber = this.generateOrderNumber();
		const orderPayload = {
			order_number: orderNumber,
			user_id: user?.id || null, // Permitir null para órdenes de invitados
			guest_email: orderData.guest_info?.email,
			guest_name: orderData.guest_info?.name,
			guest_phone: orderData.guest_info?.phone,
			status: 'Pendiente' as const,
			payment_status: 'Pendiente' as const,
			payment_method: orderData.payment_method,
			subtotal: subtotal,
			tax_amount: 0, // Por ahora sin impuestos
			shipping_amount: finalShippingAmount,
			discount_amount: 0,
			total_amount: totalAmount,
			shipping_address_id: shippingAddressId,
			shipping_address: orderData.shipping_address ? JSON.stringify(orderData.shipping_address) : null,
			notes: orderData.notes,
		};

		console.log('Creando orden con payload:', JSON.stringify(orderPayload, null, 2));

		// Usar el cliente del servidor para evitar problemas de RLS
		const { data: order, error: orderError } = await supabaseServer
			.from('orders')
			.insert(orderPayload)
			.select()
			.single();

		if (orderError) {
			console.error('Error creando orden:', orderError);
			throw new Error(`Error al crear la orden: ${orderError.message}`);
		}

		// Crear items de la orden usando el cliente del servidor
		const orderItems = items.map(item => ({
			order_id: order.id,
			product_id: item.product_id,
			variant_id: undefined, // Por ahora sin variantes
			product_name: item.name,
			product_sku: item.product_id,
			product_image_url: item.image_url,
			quantity: item.quantity,
			unit_price: item.price,
			total_price: item.price * item.quantity,
		}));

		const { error: itemsError } = await supabaseServer
			.from('order_items')
			.insert(orderItems);

		if (itemsError) {
			console.error('Error creando items de orden:', itemsError);
			// Intentar eliminar la orden si falla la creación de items
			await supabaseServer.from('orders').delete().eq('id', order.id);
			throw new Error('Error al crear los items de la orden');
		}

		// Crear servicios de la orden usando el cliente del servidor
		if (selectedServices.length > 0) {
			const orderServices = selectedServices.map(service => ({
				order_id: order.id,
				service_id: service.id,
				service_name: service.name,
				price: service.price,
			}));

			const { error: servicesError } = await supabaseServer
				.from('order_services')
				.insert(orderServices);

			if (servicesError) {
				console.error('Error creando servicios de orden:', servicesError);
			}
		}

		// Limpiar carrito solo si hay usuario autenticado
		if (user) {
			await CartService.clearCart();

			// Actualizar is_first_purchase si es usuario registrado
			await supabase
				.from('profiles')
				.update({ is_first_purchase: false })
				.eq('id', user.id);
		}

		return order;
	}

	// Obtener orden por ID
	static async getOrder(orderId: string): Promise<Order | null> {
		const { data, error } = await supabase
			.from('orders')
			.select(`
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
				user:profiles(
					id,
					first_name,
					last_name,
					email
				),
				shipping_address_data:shipping_addresses(*)
			`)
			.eq('id', orderId)
			.single();

		if (error) {
			console.error('Error obteniendo orden:', error);
			return null;
		}

		return data;
	}

	// Obtener órdenes del usuario
	static async getUserOrders(page = 1, limit = 10): Promise<{
		orders: Order[];
		total: number;
		totalPages: number;
	}> {
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			throw new Error('Usuario no autenticado');
		}

		const offset = (page - 1) * limit;

		// Obtener total de órdenes
		const { count, error: countError } = await supabase
			.from('orders')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', user.id);

		if (countError) {
			console.error('Error obteniendo conteo de órdenes:', countError);
			throw new Error('Error al obtener las órdenes');
		}

		// Obtener órdenes
		const { data, error } = await supabase
			.from('orders')
			.select(`
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
				services:order_services(*),
				shipping_address_data:shipping_addresses(*)
			`)
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

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

	// Actualizar estado de pago
	static async updatePaymentStatus(orderId: string, paymentStatus: Order['payment_status'], paymentDetails?: any): Promise<Order> {
		console.log('Actualizando estado de pago para orden:', orderId);
		console.log('Nuevo estado:', paymentStatus);
		console.log('Detalles del pago:', paymentDetails);

		// Usar supabaseServer para evitar problemas de RLS
		const { data, error } = await supabaseServer
			.from('orders')
			.update({
				payment_status: paymentStatus,
				...(paymentDetails && { payment_details: paymentDetails }),
			})
			.eq('id', orderId)
			.select()
			.single();

		if (error) {
			console.error('Error actualizando estado de pago:', error);
			throw new Error('Error al actualizar el estado de pago');
		}

		console.log('Estado de pago actualizado exitosamente:', data);
		return data;
	}

	// Actualizar estado de la orden
	static async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
		// Usar supabaseServer para evitar problemas de RLS
		const { data, error } = await supabaseServer
			.from('orders')
			.update({ status })
			.eq('id', orderId)
			.select()
			.single();

		if (error) {
			console.error('Error actualizando estado de orden:', error);
			throw new Error('Error al actualizar el estado de la orden');
		}

		return data;
	}

	// Cancelar orden
	static async cancelOrder(orderId: string, reason?: string): Promise<Order> {
		// Usar supabaseServer para evitar problemas de RLS
		const { data, error } = await supabaseServer
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
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			throw new Error('Usuario no autenticado');
		}

		const { data, error } = await supabase
			.from('orders')
			.select('status')
			.eq('user_id', user.id);

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

		data?.forEach(order => {
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