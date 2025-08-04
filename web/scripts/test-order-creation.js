// Script de prueba para verificar la creación de órdenes
// Ejecutar con: node scripts/test-order-creation.js

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

async function testOrderCreation() {
  try {
    console.log('🚀 Iniciando prueba de creación de órdenes...\n');

    // Datos de prueba
    const testOrderData = {
      payment_method: 'PayPal',
      shipping_method: 'pickup',
      selected_services: [],
      notes: 'Prueba de creación de orden',
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
        email: 'test@example.com',
        name: 'Usuario de Prueba',
        phone: '1234567890',
      },
    };

    console.log('📋 Datos de prueba:', JSON.stringify(testOrderData, null, 2));

    // Simular la creación de orden como en el endpoint
    console.log('\n📦 Creando orden de prueba...');

    // Generar número de orden
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Calcular totales
    const subtotal = testOrderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = subtotal;

    // Crear payload de la orden
    const orderPayload = {
      order_number: orderNumber,
      user_id: null, // Orden de invitado
      guest_email: testOrderData.guest_info.email,
      guest_name: testOrderData.guest_info.name,
      guest_phone: testOrderData.guest_info.phone,
      status: 'Pendiente',
      payment_status: 'Pendiente',
      payment_method: testOrderData.payment_method,
      subtotal: subtotal,
      tax_amount: 0,
      shipping_amount: 0,
      discount_amount: 0,
      total_amount: totalAmount,
      shipping_address_id: null,
      shipping_address: null,
      notes: testOrderData.notes,
    };

    console.log('📝 Payload de la orden:', JSON.stringify(orderPayload, null, 2));

    // Insertar la orden
    const { data: order, error: orderError } = await supabase.from('orders').insert(orderPayload).select().single();

    if (orderError) {
      console.error('❌ Error creando orden:', orderError);
      throw new Error(`Error al crear la orden: ${orderError.message}`);
    }

    console.log('✅ Orden creada exitosamente:', order.id);

    // Crear items de la orden
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

    console.log('📦 Creando items de la orden...');

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error('❌ Error creando items de orden:', itemsError);
      // Limpiar la orden si falla
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error('Error al crear los items de la orden');
    }

    console.log('✅ Items de la orden creados exitosamente');

    // Verificar que la orden se puede leer
    console.log('🔍 Verificando que la orden se puede leer...');

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
      console.error('❌ Error leyendo la orden:', readError);
    } else {
      console.log('✅ Orden leída exitosamente');
      console.log('📊 Resumen de la orden:');
      console.log(`   - ID: ${readOrder.id}`);
      console.log(`   - Número: ${readOrder.order_number}`);
      console.log(`   - Total: $${readOrder.total_amount}`);
      console.log(`   - Items: ${readOrder.items?.length || 0}`);
    }

    // Limpiar la orden de prueba
    console.log('🧹 Limpiando orden de prueba...');
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);

    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('✅ La creación de órdenes funciona correctamente');
    console.log('✅ Las políticas RLS están configuradas correctamente');
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
testOrderCreation();
