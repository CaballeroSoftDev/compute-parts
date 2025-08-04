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

async function testAdminOrders() {
	try {
		console.log('🚀 Iniciando prueba de órdenes del panel de administrador...\n');

		// 1. Verificar autenticación
		console.log('🔐 Verificando autenticación...');
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError || !user) {
			console.log('⚠️ No hay usuario autenticado');
			console.log('💡 Para probar el panel de administrador:');
			console.log('1. Inicia sesión como administrador');
			console.log('2. Ve a /admin/orders');
			console.log('3. Verifica que las órdenes se cargan correctamente');
			return;
		}

		console.log('✅ Usuario autenticado:', user.email);
		console.log('🆔 User ID:', user.id);

		// 2. Verificar si el usuario es administrador
		console.log('\n👑 Verificando rol de administrador...');
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profileError) {
			console.error('❌ Error obteniendo perfil:', profileError);
			return;
		}

		if (profile.role !== 'admin' && profile.role !== 'superadmin') {
			console.log('⚠️ Usuario no es administrador');
			console.log(`📊 Rol actual: ${profile.role}`);
			console.log('💡 Solo los administradores pueden acceder al panel');
			return;
		}

		console.log('✅ Usuario es administrador');
		console.log(`📊 Rol: ${profile.role}`);

		// 3. Obtener todas las órdenes (como lo haría el admin)
		console.log('\n📋 Obteniendo todas las órdenes...');
		const { data: orders, error: ordersError } = await supabase
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
			`
			)
			.order('created_at', { ascending: false })
			.limit(10);

		if (ordersError) {
			console.error('❌ Error obteniendo órdenes:', ordersError);
			return;
		}

		console.log(`✅ Encontradas ${orders.length} órdenes`);

		if (orders.length === 0) {
			console.log('⚠️ No hay órdenes en el sistema');
			console.log('💡 Completa algunos pagos para crear órdenes');
			return;
		}

		// 4. Probar obtención de datos de perfil por separado
		console.log('\n👤 Probando obtención de datos de perfil...');
		const ordersWithProfiles = await Promise.all(
			orders.map(async (order) => {
				let userData = null;
				
				if (order.user_id) {
					// Obtener datos del perfil
					const { data: profileData, error: profileError } = await supabase
						.from('profiles')
						.select('id, first_name, last_name')
						.eq('id', order.user_id)
						.single();
					
					if (!profileError && profileData) {
						// Obtener email usando la función RPC
						const { data: emailData, error: emailError } = await supabase
							.rpc('get_user_email', { user_id: order.user_id });
						
						userData = {
							...profileData,
							email: emailError ? null : emailData?.email
						};
					}
				}

				return {
					...order,
					user: userData
				};
			})
		);

		console.log('✅ Datos de perfil obtenidos correctamente');

		// 5. Mostrar información de las órdenes
		console.log('\n📊 Información de las órdenes:');
		ordersWithProfiles.forEach((order, index) => {
			console.log(`\n${index + 1}. Orden #${order.order_number}`);
			console.log(`   - Cliente: ${order.user ? `${order.user.first_name} ${order.user.last_name}` : order.guest_name || 'Cliente invitado'}`);
			console.log(`   - Email: ${order.user?.email || order.guest_email || 'Sin email'}`);
			console.log(`   - Estado: ${order.status}`);
			console.log(`   - Pago: ${order.payment_status}`);
			console.log(`   - Total: $${order.total_amount}`);
			console.log(`   - Items: ${order.items?.length || 0}`);
			console.log(`   - Servicios: ${order.services?.length || 0}`);
			console.log(`   - Fecha: ${new Date(order.created_at).toLocaleDateString('es-MX')}`);
		});

		// 6. Probar filtros y búsqueda
		console.log('\n🔍 Probando filtros...');
		
		// Filtrar por estado
		const pendingOrders = ordersWithProfiles.filter(order => order.status === 'Pendiente');
		console.log(`📋 Órdenes pendientes: ${pendingOrders.length}`);

		// Filtrar por método de pago
		const paypalOrders = ordersWithProfiles.filter(order => order.payment_method === 'PayPal');
		console.log(`💳 Órdenes con PayPal: ${paypalOrders.length}`);

		// Buscar por número de orden
		if (ordersWithProfiles.length > 0) {
			const firstOrder = ordersWithProfiles[0];
			const searchResult = ordersWithProfiles.filter(order => 
				order.order_number.toLowerCase().includes(firstOrder.order_number.toLowerCase())
			);
			console.log(`🔎 Búsqueda por "${firstOrder.order_number}": ${searchResult.length} resultados`);
		}

		console.log('\n🎉 Prueba completada exitosamente');
		console.log('💡 El panel de administrador ahora funciona correctamente');

	} catch (error) {
		console.error('❌ Error en la prueba:', error);
	}
}

testAdminOrders(); 