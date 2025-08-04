import { supabase } from '../supabase';
import { EdgeFunctionService } from './edge-function-service';

export class PayPalService {
  private static isConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  }

  // Crear orden en PayPal usando Edge Function
  static async createPayPalOrder(orderData: {
    amount: number;
    currency?: string;
    description?: string;
    cartItems?: Array<{
      name: string;
      quantity: number;
      unit_amount: {
        currency_code: string;
        value: string;
      };
    }>;
  }): Promise<{ id: string; status: string; links?: any[] }> {
    try {
      console.log('🔄 Creando orden de PayPal usando Edge Function...');

      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          amount: orderData.amount,
          currency: orderData.currency || 'MXN',
          description: orderData.description || 'Compra en ComputeParts',
          cartItems: orderData.cartItems || [],
        },
      });

      if (error) {
        console.error('❌ Error invocando Edge Function:', error);
        throw new Error(`Error en Edge Function: ${error.message}`);
      }

      if (data.error) {
        console.error('❌ Error en respuesta de Edge Function:', data.error);
        throw new Error(data.error);
      }

      console.log('✅ Orden de PayPal creada exitosamente:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error creando orden de PayPal:', error);
      throw error;
    }
  }

  // Capturar pago usando Edge Function
  static async capturePayPalPayment(paypalOrderId: string, orderData: any): Promise<any> {
    try {
      console.log('🔄 Capturando pago con Edge Function...');

      // Usar el EdgeFunctionService para invocar la Edge Function
      const result = await EdgeFunctionService.capturePayment(paypalOrderId, orderData);

      console.log('✅ Pago capturado exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error capturando pago:', error);

      // Intentar método alternativo si falla el principal
      try {
        console.log('🔄 Intentando método alternativo...');
        const fallbackResult = await EdgeFunctionService.capturePaymentWithFetch(paypalOrderId, orderData);
        console.log('✅ Método alternativo exitoso');
        return fallbackResult;
      } catch (fallbackError) {
        console.error('❌ Error en método alternativo:', fallbackError);
        throw error; // Lanzar el error original
      }
    }
  }

  // Verificar estado de la Edge Function
  static async checkEdgeFunctionStatus(): Promise<boolean> {
    return await EdgeFunctionService.checkEdgeFunctionStatus();
  }

  // Probar Edge Function
  static async testEdgeFunction(testData: any): Promise<any> {
    return await EdgeFunctionService.testEdgeFunction(testData);
  }

  // Reembolsar pago (método auxiliar para casos de error)
  static async refundPayment(captureId: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('PayPal no está configurado');
    }

    const response = await fetch('/api/paypal/refund-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ capture_id: captureId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al reembolsar pago');
    }

    return await response.json();
  }
}
