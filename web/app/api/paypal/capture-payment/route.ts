import { NextRequest, NextResponse } from 'next/server';
import { PayPalService } from '@/lib/services/paypal-service';
import { OrderService } from '@/lib/services/order-service';

export async function POST(request: NextRequest) {
	try {
		const { paypal_order_id, orderData } = await request.json();

		console.log('=== INICIO CAPTURE PAYMENT ===');
		console.log('Datos recibidos:', { paypal_order_id, orderData });

		if (!paypal_order_id) {
			return NextResponse.json(
				{ error: 'ID de orden de PayPal requerido' },
				{ status: 400 }
			);
		}

		if (!PayPalService.isConfigured()) {
			return NextResponse.json(
				{ error: 'PayPal no está configurado. Verifica las variables de entorno.' },
				{ status: 500 }
			);
		}

		// Capturar el pago en PayPal
		console.log('Capturando pago en PayPal...');
		let paymentData;
		try {
			paymentData = await PayPalService.capturePayPalPayment(paypal_order_id);
			console.log('Pago capturado exitosamente:', paymentData.status);
		} catch (paypalError) {
			console.error('Error capturando pago en PayPal:', paypalError);
			return NextResponse.json(
				{ 
					error: 'Error al capturar el pago en PayPal: ' + (paypalError instanceof Error ? paypalError.message : 'Error desconocido')
				},
				{ status: 500 }
			);
		}

		// Si el pago fue exitoso, crear la orden en Supabase
		if (paymentData.status === 'COMPLETED') {
			console.log('Preparando datos para crear orden...');
			
			// Preparar los datos de la orden para Supabase
			const createOrderData = {
				payment_method: 'PayPal' as const,
				shipping_method: orderData?.shipping_method || 'pickup',
				shipping_address: orderData?.shipping_address,
				selected_services: orderData?.selected_services || [],
				notes: 'Pago procesado con PayPal',
				items: orderData?.items || [],
			};

			console.log('Datos de orden preparados:', JSON.stringify(createOrderData, null, 2));

			try {
				console.log('Creando orden en Supabase...');
				const order = await OrderService.createOrder(createOrderData);
				console.log('Orden creada exitosamente:', order.id);

				// Actualizar el estado de pago a pagado
				console.log('Actualizando estado de pago...');
				await OrderService.updatePaymentStatus(order.id, 'Pagado', {
					paypal_order_id: paymentData.id,
					paypal_payment_id: paymentData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
					payer_info: {
						name: `${paymentData.payer?.name?.given_name || ''} ${paymentData.payer?.name?.surname || ''}`.trim(),
						email: paymentData.payer?.email_address || '',
					},
					captured_at: new Date().toISOString(),
				});
				console.log('Estado de pago actualizado');

				console.log('=== FIN CAPTURE PAYMENT - EXITOSO ===');
				
				// Devolver la respuesta de PayPal original para mantener compatibilidad
				return NextResponse.json({
					...paymentData,
					order_id: order.id,
				});
			} catch (orderError) {
				console.error('Error específico al crear orden:', orderError);
				console.error('Stack trace:', orderError instanceof Error ? orderError.stack : 'No stack trace');
				
				// Intentar reembolsar el pago si falla la creación de la orden
				try {
					console.log('Intentando reembolsar pago debido a error en creación de orden...');
					const captureId = paymentData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
					if (captureId) {
						await PayPalService.refundPayment(captureId);
						console.log('Pago reembolsado exitosamente');
					}
				} catch (refundError) {
					console.error('Error al reembolsar pago:', refundError);
				}
				
				return NextResponse.json(
					{ 
						error: 'Error al crear la orden: ' + (orderError instanceof Error ? orderError.message : 'Error desconocido')
					},
					{ status: 500 }
				);
			}
		} else {
			return NextResponse.json(
				{ error: 'El pago no fue completado exitosamente' },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error('Error completo en capture-payment:', error);
		console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
		return NextResponse.json(
			{ 
				error: 'Error al procesar el pago: ' + (error instanceof Error ? error.message : 'Error desconocido')
			},
			{ status: 500 }
		);
	}
} 