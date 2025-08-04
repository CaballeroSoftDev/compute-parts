import { supabase } from '@/lib/supabase';

export interface CartItem {
	id: string;
	user_id: string;
	product_id: string;
	variant_id?: string;
	quantity: number;
	created_at: string;
	updated_at: string;
	// Datos del producto (join)
	product?: {
		id: string;
		name: string;
		price: number;
		sku: string;
		stock_quantity: number;
		product_images?: {
			image_url: string;
			alt_text?: string;
		}[];
	};
	variant?: {
		id: string;
		name: string;
		value: string;
		price_adjustment: number;
		stock_quantity: number;
		sku: string;
	};
}

export interface AddToCartData {
	product_id: string;
	variant_id?: string;
	quantity: number;
}

export interface UpdateCartItemData {
	quantity: number;
}

export class CartService {
	// Verificar si el usuario está autenticado
	private static async checkAuth(): Promise<string> {
		try {
			const { data: { user }, error: authError } = await supabase.auth.getUser();
			
			// Manejar silenciosamente errores de sesión faltante
			if (authError) {
				if (authError.message.includes('Auth session missing') || 
					authError.message.includes('AuthSessionMissingError')) {
					throw new Error('Usuario no autenticado');
				}
				throw authError;
			}
			
			if (!user) {
				throw new Error('Usuario no autenticado');
			}
			
			return user.id;
		} catch (error) {
			// Re-lanzar el error como "Usuario no autenticado" para consistencia
			if (error instanceof Error && (
				error.message.includes('Auth session missing') || 
				error.message.includes('AuthSessionMissingError')
			)) {
				throw new Error('Usuario no autenticado');
			}
			throw error;
		}
	}

	// Obtener todos los items del carrito del usuario
	static async getCartItems(): Promise<CartItem[]> {
		try {
			const userId = await this.checkAuth();

			const { data, error } = await supabase
				.from('cart_items')
				.select(`
					*,
					product:products(
						id,
						name,
						price,
						sku,
						stock_quantity,
						product_images(
							image_url,
							alt_text
						)
					),
					variant:product_variants(
						id,
						name,
						value,
						price_adjustment,
						stock_quantity,
						sku
					)
				`)
				.eq('user_id', userId)
				.order('created_at', { ascending: false });

			if (error) {
				console.error('Error obteniendo items del carrito:', error);
				throw new Error('Error al obtener los items del carrito');
			}

			return data || [];
		} catch (error) {
			// Si el error es de autenticación, retornar array vacío
			if (error instanceof Error && error.message === 'Usuario no autenticado') {
				return [];
			}
			throw error;
		}
	}

	// Agregar producto al carrito
	static async addToCart(itemData: AddToCartData): Promise<CartItem> {
		const userId = await this.checkAuth();

		// Verificar si el producto ya existe en el carrito
		let query = supabase
			.from('cart_items')
			.select('*')
			.eq('user_id', userId)
			.eq('product_id', itemData.product_id);
		
		// Solo agregar filtro de variant_id si existe
		if (itemData.variant_id) {
			query = query.eq('variant_id', itemData.variant_id);
		} else {
			query = query.is('variant_id', null);
		}
		
		const { data: existingItem } = await query.single();

		if (existingItem) {
			// Actualizar cantidad si ya existe
			const newQuantity = existingItem.quantity + itemData.quantity;
			const { data, error } = await supabase
				.from('cart_items')
				.update({ quantity: newQuantity })
				.eq('id', existingItem.id)
				.select()
				.single();

			if (error) {
				console.error('Error actualizando item del carrito:', error);
				throw new Error('Error al actualizar el carrito');
			}

			return data;
		}

		// Crear nuevo item si no existe
		const { data, error } = await supabase
			.from('cart_items')
			.insert({
				user_id: userId,
				product_id: itemData.product_id,
				variant_id: itemData.variant_id,
				quantity: itemData.quantity,
			})
			.select()
			.single();

		if (error) {
			console.error('Error agregando item al carrito:', error);
			throw new Error('Error al agregar producto al carrito');
		}

		return data;
	}

	// Actualizar cantidad de un item
	static async updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
		const userId = await this.checkAuth();

		if (quantity <= 0) {
			// Eliminar item si la cantidad es 0 o menor
			return this.removeFromCart(itemId);
		}

		const { data, error } = await supabase
			.from('cart_items')
			.update({ quantity })
			.eq('id', itemId)
			.eq('user_id', userId)
			.select()
			.single();

		if (error) {
			console.error('Error actualizando item del carrito:', error);
			throw new Error('Error al actualizar la cantidad');
		}

		return data;
	}

	// Eliminar item del carrito
	static async removeFromCart(itemId: string): Promise<void> {
		const userId = await this.checkAuth();

		const { error } = await supabase
			.from('cart_items')
			.delete()
			.eq('id', itemId)
			.eq('user_id', userId);

		if (error) {
			console.error('Error eliminando item del carrito:', error);
			throw new Error('Error al eliminar producto del carrito');
		}
	}

	// Limpiar todo el carrito
	static async clearCart(): Promise<void> {
		const userId = await this.checkAuth();

		const { error } = await supabase
			.from('cart_items')
			.delete()
			.eq('user_id', userId);

		if (error) {
			console.error('Error limpiando carrito:', error);
			throw new Error('Error al limpiar el carrito');
		}
	}

	// Obtener el total de items en el carrito
	static async getCartItemCount(): Promise<number> {
		try {
			const userId = await this.checkAuth();

			const { count, error } = await supabase
				.from('cart_items')
				.select('*', { count: 'exact', head: true })
				.eq('user_id', userId);

			if (error) {
				console.error('Error obteniendo conteo del carrito:', error);
				return 0;
			}

			return count || 0;
		} catch (error) {
			// Si el error es de autenticación, retornar 0
			if (error instanceof Error && error.message === 'Usuario no autenticado') {
				return 0;
			}
			throw error;
		}
	}

	// Calcular el total del carrito
	static async getCartTotal(): Promise<{
		subtotal: number;
		total: number;
		itemCount: number;
	}> {
		const items = await this.getCartItems();
		
		let subtotal = 0;
		let itemCount = 0;

		for (const item of items) {
			const unitPrice = item.product?.price || 0;
			const variantAdjustment = item.variant?.price_adjustment || 0;
			const finalPrice = unitPrice + variantAdjustment;
			
			subtotal += finalPrice * item.quantity;
			itemCount += item.quantity;
		}

		return {
			subtotal,
			total: subtotal, // Sin impuestos por ahora
			itemCount,
		};
	}
} 