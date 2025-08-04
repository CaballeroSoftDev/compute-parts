import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { amount, currency = 'MXN', description, cartItems = [] } = await req.json()

    console.log('=== INICIO CREATE PAYPAL ORDER EDGE FUNCTION ===')
    console.log('Datos recibidos:', { amount, currency, description, cartItems })

    // Log detallado de los items
    console.log('📦 Items del carrito:')
    cartItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      })
    })

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Monto inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar que las credenciales de PayPal estén configuradas
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')

    if (!paypalClientId || !paypalClientSecret) {
      console.error('❌ Credenciales de PayPal no configuradas')
      return new Response(
        JSON.stringify({ error: 'PayPal no está configurado. Verifica las variables de entorno.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Obtener token de acceso de PayPal
    console.log('🔑 Obteniendo token de acceso de PayPal...')
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('❌ Error obteniendo token de PayPal:', errorData)
      return new Response(
        JSON.stringify({ error: `Error obteniendo token de PayPal: ${JSON.stringify(errorData)}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    console.log('✅ Token de acceso obtenido')

    // Crear orden en PayPal
    console.log('📋 Creando orden en PayPal...')
    
    // Preparar los items para PayPal
    const paypalItems = cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity.toString(),
      unit_amount: {
        currency_code: currency,
        value: item.price.toFixed(2), // Los precios ya vienen en pesos
      },
    }))

    // Si no hay items específicos, crear un item genérico
    if (paypalItems.length === 0) {
      paypalItems.push({
        name: description || 'Compra en ComputeParts',
        quantity: '1',
        unit_amount: {
          currency_code: currency,
          value: amount.toFixed(2), // El amount ya viene en pesos
        },
      })
    }

    // Calcular el item_total exacto sumando todos los items
    const itemTotal = paypalItems.reduce((total, item) => {
      const itemValue = parseFloat(item.unit_amount.value) * parseInt(item.quantity)
      return total + itemValue
    }, 0)

    console.log('💰 Cálculo del item_total:')
    console.log('Item total calculado:', itemTotal)
    console.log('Amount recibido:', amount)

    const paypalOrderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2), // El amount ya viene en pesos
            breakdown: {
              item_total: {
                currency_code: currency,
                value: itemTotal.toFixed(2),
              },
            },
          },
          items: paypalItems,
          description: description || 'Compra en ComputeParts',
        },
      ],
      application_context: {
        return_url: `${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/orders`,
        cancel_url: `${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/cart`,
      },
    }

    console.log('📤 Enviando datos a PayPal:', JSON.stringify(paypalOrderData, null, 2))

    const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paypalOrderData),
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      console.error('❌ Error creando orden en PayPal:', errorData)
      return new Response(
        JSON.stringify({ error: `Error creando orden en PayPal: ${JSON.stringify(errorData)}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const paypalOrder = await orderResponse.json()

    console.log('✅ Orden creada exitosamente:', paypalOrder.id)
    console.log('=== FIN CREATE PAYPAL ORDER - EXITOSO ===')

    return new Response(
      JSON.stringify({
        id: paypalOrder.id,
        status: paypalOrder.status,
        links: paypalOrder.links,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error completo en create-paypal-order:', error)
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