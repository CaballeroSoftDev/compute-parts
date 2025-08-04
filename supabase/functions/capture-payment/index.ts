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
    // Crear cliente Supabase con service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { paypal_order_id, orderData } = await req.json()

    console.log('=== INICIO CAPTURE PAYMENT EDGE FUNCTION ===')
    console.log('Datos recibidos:', { paypal_order_id, orderData })

    if (!paypal_order_id) {
      return new Response(
        JSON.stringify({ error: 'ID de orden de PayPal requerido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Capturar el pago en PayPal
    console.log('Capturando pago en PayPal...')
    let paymentData
    try {
      paymentData = await capturePayPalPayment(paypal_order_id)
      console.log('Pago capturado exitosamente:', paymentData.status)
    } catch (paypalError) {
      console.error('Error capturando pago en PayPal:', paypalError)
      return new Response(
        JSON.stringify({ 
          error: 'Error al capturar el pago en PayPal: ' + (paypalError instanceof Error ? paypalError.message : 'Error desconocido')
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Si el pago fue exitoso, crear la orden en Supabase
    if (paymentData.status === 'COMPLETED') {
      console.log('Preparando datos para crear orden...')
      
      // Preparar los datos de la orden para Supabase
      const createOrderData = {
        payment_method: 'PayPal' as const,
        shipping_method: orderData?.shipping_method || 'pickup',
        shipping_address: orderData?.shipping_address,
        selected_services: orderData?.selected_services || [],
        notes: 'Pago procesado con PayPal',
        items: orderData?.items || [],
      }

      console.log('Datos de orden preparados:', JSON.stringify(createOrderData, null, 2))

      try {
        console.log('Creando orden en Supabase...')
        const order = await createOrder(supabase, createOrderData, orderData?.user_id)
        console.log('Orden creada exitosamente:', order.id)

        // Actualizar el estado de pago a pagado
        console.log('Actualizando estado de pago...')
        await updatePaymentStatus(supabase, order.id, 'Pagado', {
          paypal_order_id: paymentData.id,
          paypal_payment_id: paymentData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
          payer_info: {
            name: `${paymentData.payer?.name?.given_name || ''} ${paymentData.payer?.name?.surname || ''}`.trim(),
            email: paymentData.payer?.email_address || '',
          },
          captured_at: new Date().toISOString(),
        })
        console.log('Estado de pago actualizado')

        console.log('=== FIN CAPTURE PAYMENT - EXITOSO ===')
        
        return new Response(
          JSON.stringify({
            ...paymentData,
            order_id: order.id,
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } catch (orderError) {
        console.error('Error específico al crear orden:', orderError)
        
        // Intentar reembolsar el pago si falla la creación de la orden
        try {
          console.log('Intentando reembolsar pago debido a error en creación de orden...')
          const captureId = paymentData.purchase_units?.[0]?.payments?.captures?.[0]?.id
          if (captureId) {
            await refundPayPalPayment(captureId)
            console.log('Pago reembolsado exitosamente')
          }
        } catch (refundError) {
          console.error('Error al reembolsar pago:', refundError)
        }
        
        return new Response(
          JSON.stringify({ 
            error: 'Error al crear la orden: ' + (orderError instanceof Error ? orderError.message : 'Error desconocido')
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'El pago no fue completado exitosamente' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error completo en capture-payment:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error al procesar el pago: ' + (error instanceof Error ? error.message : 'Error desconocido')
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Función para capturar pago en PayPal
async function capturePayPalPayment(orderId: string) {
  const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')!
  const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')!
  
  // Obtener token de acceso
  const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  // Capturar el pago
  const captureResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!captureResponse.ok) {
    const errorData = await captureResponse.json()
    throw new Error(`PayPal error: ${JSON.stringify(errorData)}`)
  }

  return await captureResponse.json()
}

// Función para reembolsar pago en PayPal
async function refundPayPalPayment(captureId: string) {
  const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')!
  const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')!
  
  // Obtener token de acceso
  const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  // Reembolsar el pago
  const refundResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })

  if (!refundResponse.ok) {
    const errorData = await refundResponse.json()
    throw new Error(`PayPal refund error: ${JSON.stringify(errorData)}`)
  }

  return await refundResponse.json()
}

// Función para generar número de orden único
function generateOrderNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORD-${timestamp}-${random}`
}

// Función para crear orden en Supabase
async function createOrder(supabase: any, orderData: any, userId?: string) {
  // Usar items proporcionados o obtener del carrito
  let items = orderData.items
  let subtotal = 0
  
  if (!items || items.length === 0) {
    throw new Error('No se proporcionaron items para la orden')
  }
  
  // Calcular subtotal
  subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
  
  // Obtener servicios seleccionados
  let servicesTotal = 0
  let selectedServices: any[] = []
  if (orderData.selected_services && orderData.selected_services.length > 0) {
    const { data: services } = await supabase
      .from('additional_services')
      .select('*')
      .in('id', orderData.selected_services)
    
    selectedServices = services || []
    servicesTotal = selectedServices.reduce((sum: number, service: any) => sum + service.price, 0)
  }

  // Calcular envío
  const shippingAmount = orderData.shipping_method === 'delivery' ? 150 : 0

  // Verificar si es primera compra para envío gratis
  let finalShippingAmount = shippingAmount
  if (userId && orderData.shipping_method === 'delivery') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_first_purchase')
      .eq('id', userId)
      .single()
    
    if (profile?.is_first_purchase) {
      finalShippingAmount = 0
    }
  }

  const totalAmount = subtotal + servicesTotal + finalShippingAmount

  // Crear dirección de envío si es necesario
  let shippingAddressId: string | undefined
  if (orderData.shipping_address && orderData.shipping_method === 'delivery') {
    if (userId) {
      const { data: address, error: addressError } = await supabase
        .from('shipping_addresses')
        .insert({
          user_id: userId,
          ...orderData.shipping_address,
        })
        .select()
        .single()

      if (addressError) {
        console.error('Error creando dirección:', addressError)
      } else {
        shippingAddressId = address.id
      }
    }
  }

  // Crear la orden
  const orderNumber = generateOrderNumber()
  const orderPayload = {
    order_number: orderNumber,
    user_id: userId || null,
    guest_email: orderData.guest_info?.email,
    guest_name: orderData.guest_info?.name,
    guest_phone: orderData.guest_info?.phone,
    status: 'Pendiente',
    payment_status: 'Pendiente',
    payment_method: orderData.payment_method,
    subtotal: subtotal,
    tax_amount: 0,
    shipping_amount: finalShippingAmount,
    discount_amount: 0,
    total_amount: totalAmount,
    shipping_address_id: shippingAddressId,
    shipping_address: orderData.shipping_address ? JSON.stringify(orderData.shipping_address) : null,
    notes: orderData.notes,
  }

  console.log('Creando orden con payload:', JSON.stringify(orderPayload, null, 2))

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select()
    .single()

  if (orderError) {
    console.error('Error creando orden:', orderError)
    throw new Error(`Error al crear la orden: ${orderError.message}`)
  }

  // Crear items de la orden
  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: undefined,
    product_name: item.name,
    product_sku: item.product_id,
    product_image_url: item.image_url,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Error creando items de orden:', itemsError)
    // Intentar eliminar la orden si falla la creación de items
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Error al crear los items de la orden')
  }

  // Crear servicios de la orden
  if (selectedServices.length > 0) {
    const orderServices = selectedServices.map((service: any) => ({
      order_id: order.id,
      service_id: service.id,
      service_name: service.name,
      price: service.price,
    }))

    const { error: servicesError } = await supabase
      .from('order_services')
      .insert(orderServices)

    if (servicesError) {
      console.error('Error creando servicios de orden:', servicesError)
    }
  }

  // Actualizar is_first_purchase si es usuario registrado
  if (userId) {
    await supabase
      .from('profiles')
      .update({ is_first_purchase: false })
      .eq('id', userId)
  }

  return order
}

// Función para actualizar estado de pago
async function updatePaymentStatus(supabase: any, orderId: string, paymentStatus: string, paymentDetails?: any) {
  console.log('Actualizando estado de pago para orden:', orderId)
  console.log('Nuevo estado:', paymentStatus)
  console.log('Detalles del pago:', paymentDetails)

  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status: paymentStatus,
      ...(paymentDetails && { payment_details: paymentDetails }),
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    console.error('Error actualizando estado de pago:', error)
    throw new Error('Error al actualizar el estado de pago')
  }

  console.log('Estado de pago actualizado exitosamente:', data)
  return data
} 