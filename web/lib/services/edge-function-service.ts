import { supabase } from '../supabase';

export class EdgeFunctionService {
  /**
   * Invocar la Edge Function para capturar pagos de PayPal
   */
  static async capturePayment(paypalOrderId: string, orderData: any): Promise<any> {
    try {
      console.log('🔄 Invocando Edge Function para capturar pago...');
      console.log('PayPal Order ID:', paypalOrderId);
      console.log('Order Data:', orderData);

      const { data, error } = await supabase.functions.invoke('capture-payment', {
        body: {
          paypal_order_id: paypalOrderId,
          orderData: orderData,
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

      console.log('✅ Edge Function ejecutada exitosamente');
      console.log('📊 Respuesta:', data);

      return data;
    } catch (error) {
      console.error('❌ Error en EdgeFunctionService.capturePayment:', error);
      throw error;
    }
  }

  /**
   * Invocar la Edge Function para crear órdenes de PayPal
   */
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

  /**
   * Invocar la Edge Function para crear órdenes de pago en efectivo
   */
  static async createCashOrder(orderData: any, userId?: string): Promise<any> {
    try {
      console.log('🔄 Creando orden de pago en efectivo...');
      console.log('Order Data:', orderData);
      console.log('User ID:', userId);

      const { data, error } = await supabase.functions.invoke('create-cash-order', {
        body: {
          orderData,
          userId,
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

      console.log('✅ Orden de efectivo creada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creando orden de efectivo:', error);
      throw error;
    }
  }

  /**
   * Verificar el estado de una Edge Function específica
   */
  static async checkEdgeFunctionStatus(functionName: string): Promise<boolean> {
    try {
      console.log(`🔍 Verificando estado de Edge Function: ${functionName}...`);

      // Intentar invocar la función con datos de prueba
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { test: true },
      });

      // Si no hay error de conexión, la función está disponible
      const isAvailable = !error || (error && !error.message.includes('Function not found'));
      console.log(`✅ Edge Function ${functionName} ${isAvailable ? 'disponible' : 'no disponible'}`);

      return isAvailable;
    } catch (error) {
      console.error(`❌ Error verificando estado de Edge Function ${functionName}:`, error);
      return false;
    }
  }

  /**
   * Probar una Edge Function específica con datos de prueba
   */
  static async testEdgeFunction(functionName: string, testData: any): Promise<any> {
    try {
      console.log(`🧪 Probando Edge Function ${functionName} con datos de prueba...`);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: testData,
      });

      if (error) {
        console.error(`❌ Error en prueba de Edge Function ${functionName}:`, error);
        throw error;
      }

      console.log(`✅ Prueba de Edge Function ${functionName} exitosa:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error en testEdgeFunction ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener información de todas las Edge Functions disponibles
   */
  static async getAvailableFunctions(): Promise<string[]> {
    const functions = ['capture-payment', 'create-paypal-order', 'create-cash-order'];

    const availableFunctions: string[] = [];

    for (const funcName of functions) {
      try {
        const isAvailable = await this.checkEdgeFunctionStatus(funcName);
        if (isAvailable) {
          availableFunctions.push(funcName);
        }
      } catch (error) {
        console.error(`Error verificando ${funcName}:`, error);
      }
    }

    console.log('📋 Edge Functions disponibles:', availableFunctions);
    return availableFunctions;
  }
}
