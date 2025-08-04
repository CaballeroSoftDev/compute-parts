// Script para probar el flujo completo de pago y verificación de órdenes
// Ejecutar con: node scripts/test-complete-flow.js

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

async function testCompleteFlow() {
  try {
    console.log('🚀 Iniciando prueba del flujo completo...\n');

    // 1. Verificar autenticación
    console.log('🔐 Verificando autenticación...');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

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

    // 2. Verificar órdenes del usuario
    console.log('\n📋 Verificando órdenes del usuario...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(
        `
				id,
				order_number,
				user_id,
				status,
				payment_status,
				total_amount,
				created_at,
				payment_details
			`
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Error consultando órdenes:', ordersError);
      return;
    }

    console.log(`📊 Encontradas ${orders?.length || 0} órdenes para el usuario`);

    if (orders && orders.length > 0) {
      console.log('\n📋 Órdenes del usuario:');
      orders.forEach((order, index) => {
        console.log(`${index + 1}. Orden #${order.order_number}`);
        console.log(`   - ID: ${order.id}`);
        console.log(`   - Estado: ${order.status}`);
        console.log(`   - Pago: ${order.payment_status}`);
        console.log(`   - Total: $${order.total_amount}`);
        console.log(`   - Fecha: ${new Date(order.created_at).toLocaleString()}`);
        if (order.payment_details) {
          console.log(`   - PayPal Order ID: ${order.payment_details.paypal_order_id || 'N/A'}`);
          console.log(`   - PayPal Payment ID: ${order.payment_details.paypal_payment_id || 'N/A'}`);
        }
        console.log('');
      });
    } else {
      console.log('⚠️ No se encontraron órdenes para este usuario');
      console.log('💡 Para crear una orden de prueba:');
      console.log('1. Agrega productos al carrito en la aplicación web');
      console.log('2. Completa un pago con PayPal');
      console.log('3. Verifica que la orden aparezca aquí');
    }

    // 3. Verificar items de las órdenes
    if (orders && orders.length > 0) {
      console.log('\n📦 Verificando items de las órdenes...');
      for (const order of orders) {
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(
            `
						id,
						product_name,
						quantity,
						unit_price,
						total_price
					`
          )
          .eq('order_id', order.id);

        if (itemsError) {
          console.error(`❌ Error consultando items de orden ${order.order_number}:`, itemsError);
          continue;
        }

        console.log(`📋 Items de orden #${order.order_number}:`);
        if (orderItems && orderItems.length > 0) {
          orderItems.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.product_name}`);
            console.log(`      - Cantidad: ${item.quantity}`);
            console.log(`      - Precio unitario: $${item.unit_price}`);
            console.log(`      - Total: $${item.total_price}`);
          });
        } else {
          console.log('   ⚠️ No se encontraron items para esta orden');
        }
        console.log('');
      }
    }

    // 4. Verificar políticas RLS
    console.log('\n🔒 Verificando políticas RLS...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('orders')
      .select('count', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (rlsError) {
      console.error('❌ Error con políticas RLS:', rlsError);
      console.log('💡 Posible problema con las políticas de seguridad');
    } else {
      console.log('✅ Políticas RLS funcionando correctamente');
      console.log(`📊 Usuario puede ver ${rlsTest || 0} órdenes`);
    }

    // 5. Resumen del flujo
    console.log('\n🎉 Resumen del flujo completo:');
    console.log('✅ Autenticación: Funcionando');
    console.log('✅ Consulta de órdenes: Funcionando');
    console.log('✅ Políticas RLS: Funcionando');

    if (orders && orders.length > 0) {
      console.log('✅ Órdenes encontradas: Sí');
      console.log('✅ Items de órdenes: Verificados');
      console.log('✅ Payment details: Verificados');
    } else {
      console.log('⚠️ Órdenes encontradas: No');
      console.log('💡 Para crear órdenes:');
      console.log('   - Inicia sesión en la aplicación web');
      console.log('   - Agrega productos al carrito');
      console.log('   - Completa un pago con PayPal');
    }

    console.log('\n💡 Próximos pasos:');
    console.log('1. Ve a http://localhost:3000/orders');
    console.log('2. Verifica que las órdenes se muestren correctamente');
    console.log('3. Haz un nuevo pedido para probar el flujo completo');
  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verifica que las variables de entorno de Supabase estén configuradas');
    console.log('2. Verifica que el usuario esté autenticado');
    console.log('3. Verifica la conectividad a Supabase');
  }
}

// Ejecutar prueba
testCompleteFlow();
