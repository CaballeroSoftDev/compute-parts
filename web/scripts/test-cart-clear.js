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

async function testCartClear() {
	try {
		console.log('🚀 Iniciando prueba de limpieza de carrito...\n');

		// 1. Verificar autenticación
		console.log('🔐 Verificando autenticación...');
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError || !user) {
			console.log('⚠️ No hay usuario autenticado');
			console.log('💡 Para probar la limpieza del carrito:');
			console.log('1. Inicia sesión en la aplicación web');
			console.log('2. Agrega productos al carrito');
			console.log('3. Completa un pago');
			console.log('4. Verifica que el carrito esté vacío');
			return;
		}

		console.log('✅ Usuario autenticado:', user.email);
		console.log('🆔 User ID:', user.id);

		// 2. Verificar carrito actual
		console.log('\n🛒 Verificando carrito actual...');
		const { data: cartItems, error: cartError } = await supabase
			.from('cart_items')
			.select('*')
			.eq('user_id', user.id);

		if (cartError) {
			console.error('❌ Error obteniendo carrito:', cartError);
			return;
		}

		console.log(`📊 Items en carrito: ${cartItems.length}`);
		if (cartItems.length > 0) {
			console.log('📋 Items:');
			cartItems.forEach((item, index) => {
				console.log(`  ${index + 1}. Product ID: ${item.product_id}, Quantity: ${item.quantity}`);
			});
		} else {
			console.log('✅ Carrito vacío');
		}

		// 3. Simular limpieza de carrito
		console.log('\n🧹 Simulando limpieza de carrito...');
		
		try {
			// Eliminar todos los items del carrito
			const { error: deleteError } = await supabase
				.from('cart_items')
				.delete()
				.eq('user_id', user.id);

			if (deleteError) {
				console.error('❌ Error limpiando carrito:', deleteError);
				return;
			}

			console.log('✅ Carrito limpiado exitosamente');

			// 4. Verificar que el carrito esté vacío
			console.log('\n🔍 Verificando que el carrito esté vacío...');
			const { data: cartItemsAfter, error: cartAfterError } = await supabase
				.from('cart_items')
				.select('*')
				.eq('user_id', user.id);

			if (cartAfterError) {
				console.error('❌ Error verificando carrito después de limpiar:', cartAfterError);
				return;
			}

			if (cartItemsAfter.length === 0) {
				console.log('✅ Carrito confirmado vacío');
			} else {
				console.log('⚠️ Carrito no se limpió completamente');
				console.log(`📊 Items restantes: ${cartItemsAfter.length}`);
			}

		} catch (clearError) {
			console.error('❌ Error en proceso de limpieza:', clearError);
		}

		console.log('\n🎉 Prueba completada');
		console.log('💡 Verifica los resultados arriba para confirmar que el carrito se limpia correctamente');

	} catch (error) {
		console.error('❌ Error en la prueba:', error);
	}
}

testCartClear(); 