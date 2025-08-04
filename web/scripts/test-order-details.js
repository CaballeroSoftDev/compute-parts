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

async function testOrderDetails() {
	try {
		console.log('🚀 Iniciando prueba de detalles de órdenes...\n');

		// 1. Verificar autenticación
		console.log('🔐 Verificando autenticación...');
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError || !user) {
			console.log('⚠️ No hay usuario autenticado');
			console.log('💡 Para probar los detalles de órdenes:');
			console.log('1. Inicia sesión en la aplicación web');
			console.log('2. Completa un pago');
			console.log('3. Ve a la página de órdenes');
			console.log('4. Haz clic en "Ver detalles"');
			return;
		}

		console.log('✅ Usuario autenticado:', user.email);
		console.log('🆔 User ID:', user.id);

		// 2. Obtener órdenes del usuario
		console.log('\n📋 Obteniendo órdenes del usuario...');
		const { data: orders, error: ordersError } = await supabase
			.from('orders')
			.select('id, order_number, status, payment_status, total_amount, created_at')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(5);

		if (ordersError) {
			console.error('❌ Error obteniendo órdenes:', ordersError);
			return;
		}

		if (!orders || orders.length === 0) {
			console.log('⚠️ No hay órdenes para este usuario');
			console.log('💡 Completa un pago para crear una orden');
			return;
		}

		console.log(`✅ Encontradas ${orders.length} órdenes`);
		orders.forEach((order, index) => {
			console.log(`  ${index + 1}. ${order.order_number} - ${order.status} - $${order.total_amount}`);
		});

		// 3. Probar obtención de detalles de la primera orden
		const firstOrder = orders[0];
		console.log(`\n🔍 Probando detalles de orden: ${firstOrder.order_number}`);

		// Consulta corregida sin join directo a profiles
		const { data: orderDetails, error: detailsError } = await supabase
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
			.eq('id', firstOrder.id)
			.single();

		if (detailsError) {
			console.error('❌ Error obteniendo detalles de orden:', detailsError);
			return;
		}

		console.log('✅ Detalles de orden obtenidos exitosamente');
		console.log('📊 Información de la orden:');
		console.log(`  - Número: ${orderDetails.order_number}`);
		console.log(`  - Estado: ${orderDetails.status}`);
		console.log(`  - Pago: ${orderDetails.payment_status}`);
		console.log(`  - Total: $${orderDetails.total_amount}`);
		console.log(`  - Items: ${orderDetails.items?.length || 0}`);
		console.log(`  - Servicios: ${orderDetails.services?.length || 0}`);

		// 4. Obtener datos del perfil por separado
		if (orderDetails.user_id) {
			console.log('\n👤 Obteniendo datos del perfil...');
			const { data: profileData, error: profileError } = await supabase
				.from('profiles')
				.select('id, first_name, last_name')
				.eq('id', orderDetails.user_id)
				.single();

			if (profileError) {
				console.error('❌ Error obteniendo perfil:', profileError);
			} else {
				console.log('✅ Datos del perfil obtenidos:');
				console.log(`  - Nombre: ${profileData.first_name} ${profileData.last_name}`);
				console.log(`  - ID: ${profileData.id}`);
			}
		}

		// 5. Mostrar items de la orden
		if (orderDetails.items && orderDetails.items.length > 0) {
			console.log('\n📦 Items de la orden:');
			orderDetails.items.forEach((item, index) => {
				console.log(`  ${index + 1}. ${item.product_name} - Cantidad: ${item.quantity} - Precio: $${item.unit_price}`);
			});
		}

		// 6. Mostrar servicios de la orden
		if (orderDetails.services && orderDetails.services.length > 0) {
			console.log('\n🔧 Servicios de la orden:');
			orderDetails.services.forEach((service, index) => {
				console.log(`  ${index + 1}. ${service.service_name} - Precio: $${service.price}`);
			});
		}

		console.log('\n🎉 Prueba completada exitosamente');
		console.log('💡 La consulta de detalles de órdenes ahora funciona correctamente');

	} catch (error) {
		console.error('❌ Error en la prueba:', error);
	}
}

testOrderDetails(); 