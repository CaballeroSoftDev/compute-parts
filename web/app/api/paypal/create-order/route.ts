import { NextRequest, NextResponse } from 'next/server';
import { PayPalService } from '@/lib/services/paypal-service';

export async function POST(request: NextRequest) {
	try {
		const { amount, currency = 'MXN', description, cartItems = [] } = await request.json();

		console.log('=== INICIO CREATE ORDER ===');
		console.log('Datos recibidos:', { amount, currency, description, cartItems });

		if (!amount || amount <= 0) {
			return NextResponse.json(
				{ error: 'Monto inválido' },
				{ status: 400 }
			);
		}

		if (!PayPalService.isConfigured()) {
			return NextResponse.json(
				{ error: 'PayPal no está configurado. Verifica las variables de entorno.' },
				{ status: 500 }
			);
		}

		console.log('Creando orden en PayPal...');
		const paypalOrder = await PayPalService.createPayPalOrder({
			amount,
			currency,
			description,
			cartItems,
		});

		console.log('Orden creada exitosamente:', paypalOrder.paypal_order_id);
		console.log('=== FIN CREATE ORDER - EXITOSO ===');

		return NextResponse.json({
			id: paypalOrder.paypal_order_id,
			approval_url: paypalOrder.approval_url,
		});
	} catch (error) {
		console.error('Error en create-order:', error);
		return NextResponse.json(
			{ 
				error: 'Error al crear la orden: ' + (error instanceof Error ? error.message : 'Error desconocido')
			},
			{ status: 500 }
		);
	}
} 