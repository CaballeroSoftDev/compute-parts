// Script de prueba para verificar la configuración de PayPal
// Ejecutar con: npm run test:paypal

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Configuración de prueba
const config = {
	paypal: {
		clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
		clientSecret: process.env.PAYPAL_CLIENT_SECRET,
		baseUrl: process.env.NODE_ENV === 'production' 
			? 'https://www.paypal.com' 
			: 'https://www.sandbox.paypal.com',
	},
};

async function getAccessToken() {
	console.log('🔑 Obteniendo token de acceso...');
	
	if (!config.paypal.clientId || !config.paypal.clientSecret) {
		throw new Error('❌ Variables de entorno de PayPal no configuradas');
	}

	const auth = Buffer.from(`${config.paypal.clientId}:${config.paypal.clientSecret}`).toString('base64');
	
	const response = await fetch(`${config.paypal.baseUrl}/v1/oauth2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${auth}`,
		},
		body: 'grant_type=client_credentials',
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		console.error('❌ Error obteniendo token:', errorData);
		throw new Error(`Error ${response.status}: ${response.statusText}`);
	}

	const data = await response.json();
	console.log('✅ Token obtenido exitosamente');
	return data.access_token;
}

async function createTestOrder(accessToken) {
	console.log('📦 Creando orden de prueba...');
	
	const orderPayload = {
		intent: 'CAPTURE',
		purchase_units: [
			{
				reference_id: `test_${Date.now()}`,
				description: 'Prueba de integración PayPal',
				amount: {
					currency_code: 'MXN',
					value: '100.00',
					breakdown: {
						item_total: {
							currency_code: 'MXN',
							value: '100.00',
						},
					},
				},
				items: [
					{
						name: 'Producto de Prueba',
						unit_amount: {
							currency_code: 'MXN',
							value: '100.00',
						},
						quantity: '1',
						description: 'Producto de prueba para integración',
						sku: 'TEST-001',
					},
				],
			},
		],
		application_context: {
			shipping_preference: 'NO_SHIPPING',
		},
	};

	const response = await fetch(`${config.paypal.baseUrl}/v2/checkout/orders`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${accessToken}`,
		},
		body: JSON.stringify(orderPayload),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		console.error('❌ Error creando orden:', errorData);
		throw new Error(`Error ${response.status}: ${response.statusText}`);
	}

	const data = await response.json();
	console.log('✅ Orden creada exitosamente:', data.id);
	return data;
}

async function testPayPalIntegration() {
	try {
		console.log('🚀 Iniciando prueba de integración de PayPal...\n');
		
		// Verificar configuración
		console.log('📋 Configuración:');
		console.log(`   - Client ID: ${config.paypal.clientId ? '✅ Configurado' : '❌ No configurado'}`);
		console.log(`   - Client Secret: ${config.paypal.clientSecret ? '✅ Configurado' : '❌ No configurado'}`);
		console.log(`   - Base URL: ${config.paypal.baseUrl}`);
		console.log(`   - Entorno: ${process.env.NODE_ENV || 'development'}\n`);

		if (!config.paypal.clientId || !config.paypal.clientSecret) {
			throw new Error('Variables de entorno de PayPal no configuradas');
		}

		// Obtener token
		const accessToken = await getAccessToken();
		
		// Crear orden de prueba
		const order = await createTestOrder(accessToken);
		
		console.log('\n🎉 ¡Prueba completada exitosamente!');
		console.log('✅ PayPal está configurado correctamente');
		console.log(`📦 Orden de prueba creada: ${order.id}`);
		
	} catch (error) {
		console.error('\n❌ Error en la prueba:', error.message);
		console.log('\n💡 Soluciones:');
		console.log('1. Verifica que las variables de entorno estén configuradas en .env.local');
		console.log('2. Verifica que las credenciales de PayPal sean correctas');
		console.log('3. Verifica que estés usando el entorno correcto (Sandbox/Live)');
		console.log('4. Verifica la conectividad a internet');
		console.log('5. Ejecuta: npm install para instalar las dependencias');
	}
}

// Ejecutar prueba
testPayPalIntegration(); 