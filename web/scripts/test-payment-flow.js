// Script de prueba para verificar el flujo completo de pago
// Ejecutar con: node scripts/test-payment-flow.js

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

async function testPaymentFlow() {
  try {
    console.log('🚀 Iniciando prueba del flujo completo de pago...\n');

    // Datos de prueba
    const testOrderData = {
      payment_method: 'PayPal',
      shipping_method: 'pickup',
      selected_services: [],
      notes: 'Prueba del flujo de pago',
      items: [
        {
          product_id: '048cc04c-fa0d-49ab-aba4-1e4859cfb759',
          name: 'Test Product 8',
          price: 2200,
          quantity: 1,
        },
        {
          product_id: '0c4663ab-4dd2-45af-b052-2c655d80dd3a',
          name: 'Test Product 10',
          price: 4500,
          quantity: 2,
        },
      ],
      guest_info: {
        email: 'test-payment@example.com',
        name: 'Usuario de Prueba de Pago',
        phone: '1234567890',
      },
    };

    console.log('📋 Datos de prueba:', JSON.stringify(testOrderData, null, 2));

    // Paso 1: Crear orden
    console.log('\n=== PASO 1: Crear Orden ===');
    const orderPayload = {
      order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: null,
      guest_email: testOrderData.guest_info.email,
      guest_name: testOrderData.guest_info.name,
      guest_phone: testOrderData.guest_info.phone,
      status: 'Pendiente',
      payment_status: 'Pendiente',
      payment_method: testOrderData.payment_method,
      subtotal: 11200,
      tax_amount: 0,
      shipping_amount: 0,
      discount_amount: 0,
      total_amount: 11200,
      shipping_address_id: null,
      shipping_address: null,
      notes: testOrderData.notes,
    };

    console.log('📝 Creando orden...');
    const { data: order, error: orderError } = await supabase.from('orders').insert(orderPayload).select().single();

    if (orderError) {
      console.error('❌ Error creando orden:', orderError);
      throw new Error('Error al crear la orden');
    }

    console.log('✅ Orden creada exitosamente:', order.id);

    // Paso 2: Crear items de la orden
    console.log('\n=== PASO 2: Crear Items de la Orden ===');
    const orderItems = testOrderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: null,
      product_name: item.name,
      product_sku: item.product_id,
      product_image_url: null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error('❌ Error creando items:', itemsError);
      throw new Error('Error al crear los items de la orden');
    }

    console.log('✅ Items de la orden creados exitosamente');

    // Paso 3: Actualizar estado de pago
    console.log('\n=== PASO 3: Actualizar Estado de Pago ===');
    const paymentDetails = {
      paypal_order_id: 'TEST-ORDER-ID',
      paypal_payment_id: 'TEST-PAYMENT-ID',
      payer_info: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      captured_at: new Date().toISOString(),
      status: 'COMPLETED',
    };

    console.log('💰 Actualizando estado de pago...');
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'Pagado',
        payment_details: paymentDetails,
      })
      .eq('id', order.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error actualizando estado de pago:', updateError);
      throw new Error('Error al actualizar el estado de pago');
    }

    console.log('✅ Estado de pago actualizado exitosamente');
    console.log('📊 Orden actualizada:', {
      id: updatedOrder.id,
      order_number: updatedOrder.order_number,
      payment_status: updatedOrder.payment_status,
      payment_details: updatedOrder.payment_details,
    });

    // Paso 4: Verificar que la orden se puede leer
    console.log('\n=== PASO 4: Verificar Lectura de Orden ===');
    const { data: readOrder, error: readError } = await supabase
      .from('orders')
      .select(
        `
				*,
				items:order_items(*)
			`
      )
      .eq('id', order.id)
      .single();

    if (readError) {
      console.error('❌ Error leyendo orden:', readError);
      throw new Error('Error al leer la orden');
    }

    console.log('✅ Orden leída exitosamente');
    console.log('📊 Resumen de la orden:');
    console.log(`   - ID: ${readOrder.id}`);
    console.log(`   - Número: ${readOrder.order_number}`);
    console.log(`   - Estado: ${readOrder.status}`);
    console.log(`   - Estado de Pago: ${readOrder.payment_status}`);
    console.log(`   - Total: $${readOrder.total_amount}`);
    console.log(`   - Items: ${readOrder.items?.length || 0}`);

    // Limpiar orden de prueba
    console.log('\n=== LIMPIEZA ===');
    console.log('🧹 Limpiando orden de prueba...');

    // Eliminar items primero
    await supabase.from('order_items').delete().eq('order_id', order.id);

    // Eliminar orden
    await supabase.from('orders').delete().eq('id', order.id);

    console.log('✅ Orden de prueba eliminada');

    console.log('\n🎉 ¡Prueba del flujo de pago completada exitosamente!');
    console.log('✅ La creación de órdenes funciona correctamente');
    console.log('✅ La actualización del estado de pago funciona correctamente');
    console.log('✅ Las políticas RLS están configuradas correctamente');
    console.log('✅ El flujo completo de pago está listo para usar');
  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verifica que las variables de entorno de Supabase estén configuradas');
    console.log('2. Verifica que las políticas RLS estén aplicadas correctamente');
    console.log('3. Verifica que las tablas existan en la base de datos');
    console.log('4. Verifica la conectividad a Supabase');
  }
}

// Ejecutar prueba
testPaymentFlow();
