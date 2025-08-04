// Script para probar la consulta de órdenes y verificar la autenticación
// Ejecutar con: node scripts/test-orders-query.js

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

async function testOrdersQuery() {
  try {
    console.log('🚀 Iniciando prueba de consulta de órdenes...\n');

    // 1. Verificar autenticación
    console.log('🔐 Verificando autenticación...');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('❌ Error de autenticación:', authError);
      console.log('💡 El usuario no está autenticado');
      console.log('💡 Para probar, necesitas iniciar sesión en la aplicación web');
      return;
    }

    if (!user) {
      console.log('⚠️ No hay usuario autenticado');
      console.log('💡 Para probar, necesitas iniciar sesión en la aplicación web');
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
				created_at
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
        console.log('');
      });
    } else {
      console.log('⚠️ No se encontraron órdenes para este usuario');
    }

    // 3. Verificar todas las órdenes en la BD
    console.log('\n🔍 Verificando todas las órdenes en la BD...');
    const { data: allOrders, error: allOrdersError } = await supabase
      .from('orders')
      .select(
        `
				id,
				order_number,
				user_id,
				guest_email,
				status,
				payment_status,
				total_amount,
				created_at
			`
      )
      .order('created_at', { ascending: false })
      .limit(10);

    if (allOrdersError) {
      console.error('❌ Error consultando todas las órdenes:', allOrdersError);
      return;
    }

    console.log(`📊 Total de órdenes en BD: ${allOrders?.length || 0}`);
    console.log('\n📋 Últimas 10 órdenes:');
    allOrders?.forEach((order, index) => {
      console.log(`${index + 1}. Orden #${order.order_number}`);
      console.log(`   - ID: ${order.id}`);
      console.log(`   - User ID: ${order.user_id || 'null (guest)'}`);
      console.log(`   - Guest Email: ${order.guest_email || 'null'}`);
      console.log(`   - Estado: ${order.status}`);
      console.log(`   - Pago: ${order.payment_status}`);
      console.log(`   - Total: $${order.total_amount}`);
      console.log(`   - Fecha: ${new Date(order.created_at).toLocaleString()}`);
      console.log('');
    });

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

    console.log('\n🎉 Prueba completada');
    console.log('\n💡 Si no ves órdenes:');
    console.log('1. Verifica que hayas iniciado sesión en la aplicación web');
    console.log('2. Verifica que hayas hecho un pedido mientras estabas autenticado');
    console.log('3. Verifica que el pedido se haya completado exitosamente');
  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verifica que las variables de entorno de Supabase estén configuradas');
    console.log('2. Verifica que el usuario esté autenticado');
    console.log('3. Verifica la conectividad a Supabase');
  }
}

// Ejecutar prueba
testOrdersQuery();
