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

async function testCompleteEdgeFunction() {
  try {
    console.log('🚀 Iniciando prueba completa de Edge Function...\n');

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

    // 2. Verificar estado de la Edge Function
    console.log('\n🔍 Verificando estado de Edge Function...');
    const edgeFunctionUrl = 'https://besyhsyhlpuvhqirifhr.supabase.co/functions/v1/capture-payment';

    try {
      const statusResponse = await fetch(edgeFunctionUrl, {
        method: 'OPTIONS',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (statusResponse.ok) {
        console.log('✅ Edge Function disponible');
      } else {
        console.log('⚠️ Edge Function no disponible');
        console.log('Status:', statusResponse.status);
      }
    } catch (statusError) {
      console.error('❌ Error verificando estado:', statusError);
    }

    // 3. Probar Edge Function con datos de prueba
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

    // Método 1: Usando supabase.functions.invoke()
    console.log('\n🔧 Método 1: Usando supabase.functions.invoke()');
    try {
      const { data: invokeData, error: invokeError } = await supabase.functions.invoke('capture-payment', {
        body: testData,
      });

      if (invokeError) {
        console.error('❌ Error con invoke():', invokeError);
      } else {
        console.log('✅ invoke() exitoso:', invokeData);

        // Verificar que la orden se creó
        if (invokeData.order_id) {
          console.log('\n📋 Verificando orden creada...');
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', invokeData.order_id)
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
    } catch (invokeError) {
      console.error('❌ Error en invoke():', invokeError);
    }

    // Método 2: Usando fetch directo
    console.log('\n🔧 Método 2: Usando fetch directo');
    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(testData),
      });

      const fetchData = await response.json();

      if (!response.ok) {
        console.error('❌ Error con fetch directo:', fetchData);
      } else {
        console.log('✅ fetch directo exitoso:', fetchData);
      }
    } catch (fetchError) {
      console.error('❌ Error en fetch directo:', fetchError);
    }

    console.log('\n🎉 Prueba completada');
    console.log('💡 Verifica los resultados arriba para determinar el mejor método');
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testCompleteEdgeFunction();
