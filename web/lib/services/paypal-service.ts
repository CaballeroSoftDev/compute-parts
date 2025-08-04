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
      console.log('🔄 Creando orden de PayPal...');

      // Usar EdgeFunctionService para consistencia
      const result = await EdgeFunctionService.createPayPalOrder(orderData);

      console.log('✅ Orden de PayPal creada exitosamente:', result.id);
      return result;
    } catch (error) {
      console.error('❌ Error creando orden de PayPal:', error);
      throw error;
    }
  }

  // Capturar pago usando Edge Function
  static async capturePayPalPayment(paypalOrderId: string, orderData: any): Promise<any> {
    try {
      console.log('🔄 Capturando pago con Edge Function...');

      // Usar EdgeFunctionService para consistencia
      const result = await EdgeFunctionService.capturePayment(paypalOrderId, orderData);

      console.log('✅ Pago capturado exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error capturando pago:', error);
      throw error;
    }
  }

  // Verificar estado de las Edge Functions de PayPal
  static async checkPayPalFunctionsStatus(): Promise<{
    createOrder: boolean;
    capturePayment: boolean;
  }> {
    try {
      console.log('🔍 Verificando estado de Edge Functions de PayPal...');

      const [createOrderStatus, capturePaymentStatus] = await Promise.all([
        EdgeFunctionService.checkEdgeFunctionStatus('create-paypal-order'),
        EdgeFunctionService.checkEdgeFunctionStatus('capture-payment'),
      ]);

      const status = {
        createOrder: createOrderStatus,
        capturePayment: capturePaymentStatus,
      };

      console.log('📊 Estado de Edge Functions de PayPal:', status);
      return status;
    } catch (error) {
      console.error('❌ Error verificando estado de Edge Functions de PayPal:', error);
      return {
        createOrder: false,
        capturePayment: false,
      };
    }
  }

  // Probar Edge Functions de PayPal
  static async testPayPalFunctions(): Promise<any> {
    try {
      console.log('🧪 Probando Edge Functions de PayPal...');

      const testData = {
        amount: 100,
        currency: 'MXN',
        description: 'Prueba de Edge Function',
        cartItems: [
          {
            name: 'Producto de prueba',
            quantity: 1,
            unit_amount: {
              currency_code: 'MXN',
              value: '100.00',
            },
          },
        ],
      };

      const result = await EdgeFunctionService.testEdgeFunction('create-paypal-order', testData);
      console.log('✅ Prueba de Edge Functions de PayPal exitosa:', result);
      return result;
    } catch (error) {
      console.error('❌ Error probando Edge Functions de PayPal:', error);
      throw error;
    }
  }

  // Reembolsar pago (método auxiliar para casos de error)
  static async refundPayment(captureId: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('PayPal no está configurado');
    }

    // Nota: Este método podría necesitar una Edge Function específica para reembolsos
    // Por ahora, se mantiene como referencia para futuras implementaciones
    throw new Error('Función de reembolso no implementada. Use el dashboard de PayPal.');
  }
}
