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

async function testEdgeFunction() {
  try {
    console.log('🚀 Iniciando prueba de Edge Function...\n');

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

    // 2. Probar Edge Function con datos de prueba
    console.log('\n📋 Probando Edge Function...');

    const testData = {
      paypal_order_id: 'TEST_ORDER_ID_' + Date.now(),
      orderData: {
        user_id: user.id,
        payment_method: 'PayPal',
        shipping_method: 'pickup',
        items: [
          {
            product_id: 'test-product-1',
            name: 'Producto de Prueba 1',
            price: 1000,
            quantity: 1,
            image_url: 'https://example.com/image1.jpg',
          },
          {
            product_id: 'test-product-2',
            name: 'Producto de Prueba 2',
            price: 500,
            quantity: 2,
            image_url: 'https://example.com/image2.jpg',
          },
        ],
        selected_services: [],
        notes: 'Orden de prueba para Edge Function',
      },
    };

    console.log('📤 Enviando datos de prueba:', JSON.stringify(testData, null, 2));

    const { data, error } = await supabase.functions.invoke('capture-payment', {
      body: testData,
    });

    if (error) {
      console.error('❌ Error llamando Edge Function:', error);
      console.log('💡 Posibles causas:');
      console.log('1. Edge Function no está desplegada');
      console.log('2. Variables de entorno no configuradas');
      console.log('3. PayPal credentials no válidas');
      return;
    }

    if (data.error) {
      console.error('❌ Error en Edge Function:', data.error);
      console.log('💡 Verificar logs de la Edge Function');
      return;
    }

    console.log('✅ Edge Function ejecutada exitosamente');
    console.log('📊 Respuesta:', JSON.stringify(data, null, 2));

    // 3. Verificar que la orden se creó
    if (data.order_id) {
      console.log('\n📋 Verificando orden creada...');
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', data.order_id)
        .single();

      if (orderError) {
        console.error('❌ Error obteniendo orden:', orderError);
      } else {
        console.log('✅ Orden encontrada:', order.order_number);
        console.log('💰 Total:', order.total_amount);
        console.log('📊 Estado:', order.payment_status);
      }
    }

    console.log('\n🎉 Prueba completada exitosamente');
    console.log('💡 La Edge Function está funcionando correctamente');
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testEdgeFunction();
