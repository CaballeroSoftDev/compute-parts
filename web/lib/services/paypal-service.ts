import { supabase } from '@/lib/supabase';
import { OrderService, Order } from './order-service';
import { config, isPayPalConfigured } from '@/lib/config';

export class PayPalService {
	// Obtener token de acceso de PayPal
	static async getAccessToken(): Promise<string> {
		if (!isPayPalConfigured()) {
			throw new Error('PayPal no está configurado. Verifica las variables de entorno.');
		}

		const auth = Buffer.from(`${config.paypal.clientId}:${config.paypal.clientSecret}`).toString('base64');
		
		const response = await fetch(`${config.paypal.baseUrl}/v1/oauth2/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': `Basic ${auth}`,
			},
			body: 'grant_type=client_credentials',
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Error obteniendo token de PayPal:', errorData);
			throw new Error(`Error obteniendo token de PayPal: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		if (!data.access_token) {
			throw new Error('Token de acceso no recibido de PayPal');
		}

		return data.access_token;
	}

	// Crear orden en PayPal
	static async createPayPalOrder(orderData: {
		amount: number;
		currency: string;
		description: string;
		cartItems?: Array<{
			id: string;
			name: string;
			price: number;
			quantity: number;
			image_url?: string;
		}>;
	}): Promise<{ paypal_order_id: string; approval_url: string }> {
		const tempOrderId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const accessToken = await this.getAccessToken();

		// Calcular total de items
		const itemsTotal = orderData.cartItems?.reduce((total, item) => {
			return total + (item.price * item.quantity);
		}, 0) || orderData.amount;

		// Preparar items para PayPal
		const paypalItems = orderData.cartItems?.map(item => ({
			name: item.name,
			unit_amount: {
				currency_code: orderData.currency,
				value: item.price.toFixed(2),
			},
			quantity: item.quantity.toString(),
			description: `Producto: ${item.name}`,
			sku: item.id,
		})) || [];

		const orderPayload = {
			intent: 'CAPTURE',
			purchase_units: [
				{
					reference_id: tempOrderId,
					description: orderData.description,
					amount: {
						currency_code: orderData.currency,
						value: orderData.amount.toFixed(2),
						breakdown: {
							item_total: {
								currency_code: orderData.currency,
								value: itemsTotal.toFixed(2),
							},
						},
					},
					items: paypalItems,
				},
			],
			application_context: {
				shipping_preference: 'NO_SHIPPING',
			},
		};

		const response = await fetch(`${config.paypal.baseUrl}/v2/checkout/orders`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			body: JSON.stringify(orderPayload),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Error creando orden en PayPal:', errorData);
			throw new Error(`PayPal API Error: ${errorData.message || errorData.error_description || 'Error desconocido'}`);
		}

		const data = await response.json();
		if (!data.id) {
			throw new Error('ID de orden no recibido de PayPal');
		}

		return {
			paypal_order_id: data.id,
			approval_url: data.links.find((link: any) => link.rel === 'approve')?.href || '',
		};
	}

	// Capturar pago de PayPal
	static async capturePayPalPayment(orderId: string): Promise<any> {
		const accessToken = await this.getAccessToken();

		const response = await fetch(`${config.paypal.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Error capturando pago en PayPal:', errorData);
			throw new Error(`PayPal API Error: ${errorData.message || errorData.error_description || 'Error desconocido'}`);
		}

		const data = await response.json();
		if (!data.id) {
			throw new Error('ID de captura no recibido de PayPal');
		}

		return data;
	}

	// Verificar si PayPal está configurado
	static isConfigured(): boolean {
		return isPayPalConfigured();
	}

	// Procesar pago exitoso
	static async processSuccessfulPayment(paypalOrderId: string): Promise<Order> {
		try {
			// Capturar el pago
			const paymentData = await this.capturePayPalPayment(paypalOrderId);
			
			// Extraer información del pago
			const capture = paymentData.purchase_units[0]?.payments?.captures?.[0];
			const payer = paymentData.payer;

			// Actualizar estado de la orden
			const order = await OrderService.updatePaymentStatus(
				paymentData.purchase_units[0]?.reference_id || '',
				'Pagado',
				{
					paypal_order_id: paymentData.id,
					paypal_payment_id: paymentData.id,
					payer_info: {
						name: `${payer?.name?.given_name || ''} ${payer?.name?.surname || ''}`.trim(),
						email: payer?.email_address || '',
					},
					captured_at: new Date().toISOString(),
				}
			);

			// Actualizar estado de la orden a procesando
			await OrderService.updateOrderStatus(order.id, 'Procesando');

			return order;
		} catch (error) {
			console.error('Error procesando pago exitoso:', error);
			throw new Error('Error al procesar el pago');
		}
	}

	// Procesar pago cancelado
	static async processCancelledPayment(orderId: string): Promise<Order> {
		try {
			// Actualizar estado de pago a fallido
			const order = await OrderService.updatePaymentStatus(orderId, 'Fallido', {
				cancelled_at: new Date().toISOString(),
				reason: 'Pago cancelado por el usuario',
			});

			return order;
		} catch (error) {
			console.error('Error procesando pago cancelado:', error);
			throw new Error('Error al procesar la cancelación');
		}
	}

	// Verificar estado de una orden de PayPal
	static async getPayPalOrderStatus(paypalOrderId: string): Promise<string> {
		try {
			const accessToken = await this.getAccessToken();
			
			const response = await fetch(`${config.paypal.baseUrl}/v2/checkout/orders/${paypalOrderId}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(`Error obteniendo estado de orden de PayPal: ${errorData.message || 'Error desconocido'}`);
			}

			const data: any = await response.json();
			return data.status;
		} catch (error) {
			console.error('Error obteniendo estado de orden de PayPal:', error);
			throw new Error('Error al verificar el estado del pago');
		}
	}

	// Reembolsar pago
	static async refundPayment(captureId: string, amount?: number): Promise<boolean> {
		try {
			const accessToken = await this.getAccessToken();
			const refundData: any = {};
			
			if (amount) {
				refundData.amount = {
					value: amount.toFixed(2),
					currency_code: 'MXN',
				};
			}

			const response = await fetch(`${config.paypal.baseUrl}/v2/payments/captures/${captureId}/refund`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${accessToken}`,
				},
				body: JSON.stringify(refundData),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error('Error reembolsando pago:', errorData);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error en refundPayment:', error);
			return false;
		}
	}
} 