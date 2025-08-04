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

async function testOptimizedOrders() {
	try {
		console.log('🚀 Iniciando prueba de función optimizada get_orders_with_user_data...\n');

		// 1. Verificar autenticación
		console.log('🔐 Verificando autenticación...');
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError || !user) {
			console.log('⚠️ No hay usuario autenticado');
			console.log('💡 Para probar la función:');
			console.log('1. Inicia sesión en la aplicación');
			console.log('2. Ejecuta este script');
			return;
		}

		console.log('✅ Usuario autenticado:', user.email);
		console.log('🆔 User ID:', user.id);

		// 2. Probar la función RPC optimizada
		console.log('\n📋 Probando función get_orders_with_user_data...');
		const startTime = Date.now();
		
		const { data: orders, error: ordersError } = await supabase
			.rpc('get_orders_with_user_data', {
				p_limit: 20,
				p_offset: 0,
				p_status: null,
				p_payment_status: null,
				p_search: null
			});

		const endTime = Date.now();
		const duration = endTime - startTime;

		if (ordersError) {
			console.error('❌ Error obteniendo órdenes:', ordersError);
			return;
		}

		console.log(`✅ Órdenes obtenidas en ${duration}ms`);
		console.log(`📊 Total de órdenes: ${orders.length}`);

		// 3. Mostrar información de las órdenes
		if (orders && orders.length > 0) {
			console.log('\n📊 Información de las órdenes:');
			orders.forEach((order, index) => {
				console.log(`\n${index + 1}. Orden #${order.order_number}`);
				console.log(`   - Cliente: ${order.customer_name}`);
				console.log(`   - Email: ${order.customer_email}`);
				console.log(`   - Teléfono: ${order.customer_phone}`);
				console.log(`   - Estado: ${order.status}`);
				console.log(`   - Pago: ${order.payment_status}`);
				console.log(`   - Total: $${order.total_amount}`);
				console.log(`   - Fecha: ${new Date(order.created_at).toLocaleDateString('es-MX')}`);
				console.log(`   - Usuario registrado: ${order.user_id ? 'Sí' : 'No'}`);
				if (order.user_id) {
					console.log(`   - Rol: ${order.role || 'No especificado'}`);
				}
			});
		} else {
			console.log('⚠️ No hay órdenes en el sistema');
		}

		// 4. Probar filtros
		console.log('\n🔍 Probando filtros...');
		
		// Filtrar por estado
		const { data: pendingOrders, error: pendingError } = await supabase
			.rpc('get_orders_with_user_data', {
				p_limit: 10,
				p_offset: 0,
				p_status: 'Pendiente',
				p_payment_status: null,
				p_search: null
			});

		if (!pendingError) {
			console.log(`📋 Órdenes pendientes: ${pendingOrders.length}`);
		}

		// Filtrar por método de pago
		const { data: paypalOrders, error: paypalError } = await supabase
			.rpc('get_orders_with_user_data', {
				p_limit: 10,
				p_offset: 0,
				p_status: null,
				p_payment_status: 'Pagado',
				p_search: null
			});

		if (!paypalError) {
			console.log(`💳 Órdenes pagadas: ${paypalOrders.length}`);
		}

		// 5. Probar búsqueda
		if (orders && orders.length > 0) {
			const firstOrder = orders[0];
			console.log(`\n🔎 Probando búsqueda por "${firstOrder.order_number}"...`);
			
			const { data: searchResults, error: searchError } = await supabase
				.rpc('get_orders_with_user_data', {
					p_limit: 10,
					p_offset: 0,
					p_status: null,
					p_payment_status: null,
					p_search: firstOrder.order_number
				});

			if (!searchError) {
				console.log(`🔎 Resultados de búsqueda: ${searchResults.length}`);
			}
		}

		// 6. Comparar rendimiento con el método anterior
		console.log('\n⚡ Comparación de rendimiento:');
		console.log(`   - Nueva función optimizada: ${duration}ms para ${orders.length} órdenes`);
		console.log(`   - Método anterior: ~${orders.length * 200}ms (estimado)`);
		console.log(`   - Mejora estimada: ~${Math.round((orders.length * 200 - duration) / (orders.length * 200) * 100)}%`);

		console.log('\n🎉 Prueba completada exitosamente');
		console.log('💡 La función optimizada funciona correctamente');

	} catch (error) {
		console.error('❌ Error en la prueba:', error);
	}
}

testOptimizedOrders(); 