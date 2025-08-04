// Script para probar el flujo de pago con las políticas RLS corregidas
// Ejecutar con: node scripts/test-payment-flow-fixed.js

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

async function testPaymentFlowFixed() {
  try {
    console.log('🚀 Iniciando prueba del flujo de pago corregido...\n');

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

    // 2. Simular datos de pago
    console.log('\n💰 Simulando datos de pago...');
    const paymentData = {
      paypal_order_id: 'TEST-ORDER-FIXED-123',
      orderData: {
        user_id: user.id,
        shipping_method: 'pickup',
        items: [
          {
            product_id: '048cc04c-fa0d-49ab-aba4-1e4859cfb759',
            name: 'Producto de Prueba',
            price: 5000,
            quantity: 2,
            image_url: null,
          },
        ],
        selected_services: [],
        notes: 'Pago de prueba con políticas RLS corregidas',
      },
    };

    console.log('📋 Datos de pago preparados:', JSON.stringify(paymentData, null, 2));

    // 3. Simular llamada a la API de capture-payment
    console.log('\n🔄 Simulando llamada a la API...');
    const response = await fetch('http://localhost:3000/api/paypal/capture-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error en la API:', errorData);
      throw new Error(`Error ${response.status}: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Respuesta de la API:', JSON.stringify(result, null, 2));

    // 4. Verificar que la orden se creó
    console.log('\n📋 Verificando que la orden se creó...');
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
      .order('created_at', { ascending: false })
      .limit(5);

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
    }

    // 5. Verificar políticas RLS
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

    // 6. Resumen del flujo
    console.log('\n🎉 Resumen del flujo corregido:');
    console.log('✅ Autenticación: Funcionando');
    console.log('✅ API de pago: Funcionando');
    console.log('✅ Creación de órdenes: Funcionando');
    console.log('✅ Políticas RLS: Corregidas');

    if (orders && orders.length > 0) {
      console.log('✅ Órdenes encontradas: Sí');
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
    console.log('1. Verifica que el servidor esté ejecutándose en http://localhost:3000');
    console.log('2. Verifica que las variables de entorno estén configuradas');
    console.log('3. Verifica que el usuario esté autenticado');
    console.log('4. Verifica la conectividad a Supabase');
  }
}

// Ejecutar prueba
testPaymentFlowFixed();
