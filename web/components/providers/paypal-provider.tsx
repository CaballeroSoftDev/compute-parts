'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PayPalProviderProps {
  children: React.ReactNode;
}

export function PayPalProvider({ children }: PayPalProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Validar que el client ID esté configurado
  if (!clientId) {
    console.error('PayPal Client ID no está configurado. Verifica NEXT_PUBLIC_PAYPAL_CLIENT_ID');
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Error: PayPal no está configurado correctamente</p>
      </div>
    );
  }

  const initialOptions = {
    'client-id': clientId,
    'enable-funding': 'venmo',
    'disable-funding': '',
    'buyer-country': 'MX',
    currency: 'MXN',
    'data-page-type': 'product-details',
    components: 'buttons',
    'data-sdk-integration-source': 'developer-studio',
  };

  return <PayPalScriptProvider options={initialOptions}>{children}</PayPalScriptProvider>;
}
