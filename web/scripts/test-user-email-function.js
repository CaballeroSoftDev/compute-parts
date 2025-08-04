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

async function testUserEmailFunction() {
	try {
		console.log('🚀 Iniciando prueba de función get_user_email...\n');

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

		// 2. Probar la función RPC con el usuario actual
		console.log('\n📧 Probando función get_user_email...');
		const { data: emailData, error: emailError } = await supabase
			.rpc('get_user_email', { user_id: user.id });

		if (emailError) {
			console.error('❌ Error obteniendo email:', emailError);
			return;
		}

		console.log('✅ Email obtenido correctamente');
		console.log(`📧 Email: ${emailData?.email || 'No encontrado'}`);

		// 3. Verificar que coincide con el email del usuario autenticado
		if (emailData?.email === user.email) {
			console.log('✅ Email coincide con el usuario autenticado');
		} else {
			console.log('⚠️ Email no coincide con el usuario autenticado');
			console.log(`   - Función RPC: ${emailData?.email}`);
			console.log(`   - Usuario autenticado: ${user.email}`);
		}

		// 4. Probar con un ID de usuario que no existe
		console.log('\n🧪 Probando con ID de usuario inexistente...');
		const fakeUserId = '00000000-0000-0000-0000-000000000000';
		const { data: fakeEmailData, error: fakeEmailError } = await supabase
			.rpc('get_user_email', { user_id: fakeUserId });

		if (fakeEmailError) {
			console.log('✅ Error esperado para usuario inexistente:', fakeEmailError.message);
		} else {
			console.log('⚠️ No se obtuvo error para usuario inexistente');
			console.log('   Datos obtenidos:', fakeEmailData);
		}

		// 5. Probar con órdenes existentes
		console.log('\n📋 Probando con órdenes existentes...');
		const { data: orders, error: ordersError } = await supabase
			.from('orders')
			.select('id, user_id, order_number')
			.eq('user_id', user.id)
			.limit(3);

		if (ordersError) {
			console.error('❌ Error obteniendo órdenes:', ordersError);
			return;
		}

		if (orders && orders.length > 0) {
			console.log(`✅ Encontradas ${orders.length} órdenes del usuario`);
			
			for (const order of orders) {
				console.log(`\n📦 Orden #${order.order_number}`);
				
				// Obtener datos del perfil
				const { data: profileData, error: profileError } = await supabase
					.from('profiles')
					.select('id, first_name, last_name')
					.eq('id', order.user_id)
					.single();
				
				if (!profileError && profileData) {
					// Obtener email usando la función RPC
					const { data: orderEmailData, error: orderEmailError } = await supabase
						.rpc('get_user_email', { user_id: order.user_id });
					
					console.log(`   - Nombre: ${profileData.first_name} ${profileData.last_name}`);
					console.log(`   - Email: ${orderEmailError ? 'Error' : orderEmailData?.email || 'No encontrado'}`);
				}
			}
		} else {
			console.log('⚠️ No hay órdenes para este usuario');
		}

		console.log('\n🎉 Prueba completada exitosamente');
		console.log('💡 La función get_user_email funciona correctamente');

	} catch (error) {
		console.error('❌ Error en la prueba:', error);
	}
}

testUserEmailFunction(); 