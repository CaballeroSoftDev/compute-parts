// Configuración centralizada de la aplicación
export const config = {
	// Supabase
	supabase: {
		url: process.env.NEXT_PUBLIC_SUPABASE_URL,
		anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	},
	
	// PayPal
	paypal: {
		clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
		clientSecret: process.env.PAYPAL_CLIENT_SECRET,
		baseUrl: process.env.NODE_ENV === 'production' 
			? 'https://www.paypal.com' 
			: 'https://www.sandbox.paypal.com',
	},
	
	// App
	app: {
		url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
	},
};

// Validar configuración
export function validateConfig() {
	const errors: string[] = [];
	
	// Validar Supabase
	if (!config.supabase.url) {
		errors.push('NEXT_PUBLIC_SUPABASE_URL no está configurado');
	}
	if (!config.supabase.anonKey) {
		errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurado');
	}
	
	// Validar PayPal
	if (!config.paypal.clientId) {
		errors.push('NEXT_PUBLIC_PAYPAL_CLIENT_ID no está configurado');
	}
	if (!config.paypal.clientSecret) {
		errors.push('PAYPAL_CLIENT_SECRET no está configurado');
	}
	
	if (errors.length > 0) {
		console.error('Errores de configuración:', errors);
		return false;
	}
	
	return true;
}

// Verificar si PayPal está configurado
export function isPayPalConfigured(): boolean {
	return !!(config.paypal.clientId && config.paypal.clientSecret);
} 