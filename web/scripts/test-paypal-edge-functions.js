import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.error('❌ Variables de entorno de Supabase no configuradas');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPayPalEdgeFunctions() {
	try {
		console.log('🚀 Iniciando prueba de Edge Functions de PayPal...\n');

		// 1. Verificar autenticación
		console.log('🔐 Verificando autenticación...');
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError || !user) {
			console.log('⚠️ No hay usuario autenticado');
			console.log('💡 Para probar el flujo completo:');
			console.log('1. Inicia sesión en la aplicación web');
			console.log('2. Agrega productos al carrito');
			console.log('3. Completa un pago con PayPal');
			console.log('4. Verifica que las órdenes aparezcan en /orders');
			return;
		}

		console.log('✅ Usuario autenticado:', user.email);
		console.log('🆔 User ID:', user.id);

		// 2. Probar Edge Function create-paypal-order
		console.log('\n📋 Probando Edge Function create-paypal-order...');
		
		const testOrderData = {
			amount: 6700, // $67.00 MXN
			currency: 'MXN',
			description: 'Compra de prueba en ComputeParts',
			cartItems: [
				{
					name: 'Producto de Prueba 1',
					quantity: 1,
					price: 5000, // $50.00 MXN
				},
				{
					name: 'Producto de Prueba 2',
					quantity: 2,
					price: 850, // $8.50 MXN cada uno
				},
			],
		};

		console.log('📤 Enviando datos de prueba:', JSON.stringify(testOrderData, null, 2));

		try {
			const { data: createOrderData, error: createOrderError } = await supabase.functions.invoke('create-paypal-order', {
				body: testOrderData,
			});

			if (createOrderError) {
				console.error('❌ Error con create-paypal-order:', createOrderError);
				console.log('💡 Posibles causas:');
				console.log('1. Edge Function no está desplegada');
				console.log('2. Variables de entorno no configuradas');
				console.log('3. PayPal credentials no válidas');
				return;
			}

			if (createOrderData.error) {
				console.error('❌ Error en create-paypal-order:', createOrderData.error);
				return;
			}

			console.log('✅ create-paypal-order exitoso:', createOrderData);
			console.log('🆔 PayPal Order ID:', createOrderData.id);

			// 3. Probar Edge Function capture-payment (simulado)
			console.log('\n📋 Probando Edge Function capture-payment (simulado)...');
			
			const testCaptureData = {
				paypal_order_id: createOrderData.id,
				orderData: {
					user_id: user.id,
					payment_method: 'PayPal',
					shipping_method: 'pickup',
					items: testOrderData.cartItems,
					selected_services: [],
					notes: 'Orden de prueba para Edge Function',
				},
			};

			console.log('📤 Enviando datos de captura:', JSON.stringify(testCaptureData, null, 2));

			try {
				const { data: captureData, error: captureError } = await supabase.functions.invoke('capture-payment', {
					body: testCaptureData,
				});

				if (captureError) {
					console.error('❌ Error con capture-payment:', captureError);
				} else if (captureData.error) {
					console.error('❌ Error en capture-payment:', captureData.error);
				} else {
					console.log('✅ capture-payment exitoso:', captureData);
					
					// Verificar que la orden se creó
					if (captureData.order_id) {
						console.log('\n📋 Verificando orden creada...');
						const { data: order, error: orderError } = await supabase
							.from('orders')
							.select('*')
							.eq('id', captureData.order_id)
							.single();

						if (orderError) {
							console.error('❌ Error obteniendo orden:', orderError);
						} else {
							console.log('✅ Orden encontrada:', order.order_number);
							console.log('💰 Total:', order.total_amount);
							console.log('📊 Estado:', order.payment_status);
						}
					}
				}
			} catch (captureError) {
				console.error('❌ Error en capture-payment:', captureError);
			}

		} catch (createOrderError) {
			console.error('❌ Error en create-paypal-order:', createOrderError);
		}

		console.log('\n🎉 Prueba completada');
		console.log('💡 Verifica los resultados arriba para determinar el estado de las Edge Functions');

	} catch (error) {
		console.error('❌ Error en la prueba:', error);
	}
}

testPayPalEdgeFunctions(); 