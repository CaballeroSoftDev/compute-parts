import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderData, userId } = await req.json()

    console.log('=== INICIO CREATE CASH ORDER EDGE FUNCTION ===')
    console.log('Datos recibidos:', { orderData, userId })

    // Verificar que las credenciales de Supabase estén configuradas
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Credenciales de Supabase no configuradas')
      return new Response(
        JSON.stringify({ error: 'Supabase no está configurado. Verifica las variables de entorno.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Crear cliente de Supabase con service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generar número de orden único
    const generateOrderNumber = () => {
      const timestamp = Date.now().toString()
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      return `ORD-${timestamp}-${random}`
    }

    // Crear la orden
    console.log('📋 Creando orden en Supabase...')
    
    const orderNumber = generateOrderNumber()
    const order = {
      id: crypto.randomUUID(),
      order_number: orderNumber,
      user_id: userId || null,
      status: 'Pendiente',
      payment_status: 'Pendiente',
      payment_method: orderData.payment_method,
      subtotal: orderData.subtotal || 0,
      tax_amount: orderData.tax_amount || 0,
      shipping_amount: orderData.shipping_amount || 0,
      discount_amount: orderData.discount_amount || 0,
      total_amount: orderData.total_amount,
      shipping_address_id: orderData.shipping_address_id || null,
      shipping_address: orderData.shipping_address || null,
      notes: orderData.notes || 'Pago en efectivo - QR para tienda',
      payment_details: {
        method: 'cash',
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${orderNumber}`,
        order_number: orderNumber
      }
    }

    console.log('📦 Datos de la orden:', order)

    // Insertar la orden
    const { error: orderError } = await supabase
      .from('orders')
      .insert(order)

    if (orderError) {
      console.error('❌ Error creando orden:', orderError)
      return new Response(
        JSON.stringify({ error: `Error al crear la orden: ${orderError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Crear items de la orden
    const orderItems = orderData.items.map((item: any) => ({
      id: crypto.randomUUID(),
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      product_name: item.name,
      product_sku: item.sku || null,
      product_image_url: item.image_url || null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    console.log('📦 Items de la orden:', orderItems)

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('❌ Error creando items de orden:', itemsError)
      // Intentar eliminar la orden si falla la creación de items
      await supabase.from('orders').delete().eq('id', order.id)
      return new Response(
        JSON.stringify({ error: `Error al crear los items de la orden: ${itemsError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Actualizar is_first_purchase si es usuario registrado
    if (userId) {
      await supabase
        .from('profiles')
        .update({ is_first_purchase: false })
        .eq('id', userId)
    }

    console.log('✅ Orden creada exitosamente:', order.id)
    console.log('=== FIN CREATE CASH ORDER - EXITOSO ===')

    return new Response(
      JSON.stringify({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        qr_code: order.payment_details.qr_code
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error completo en create-cash-order:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error al crear la orden: ' + (error instanceof Error ? error.message : 'Error desconocido')
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 