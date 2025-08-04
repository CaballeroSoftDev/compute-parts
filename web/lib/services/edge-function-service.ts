import { supabase } from '../supabase';

export class EdgeFunctionService {
  private static readonly EDGE_FUNCTION_URL = 'https://besyhsyhlpuvhqirifhr.supabase.co/functions/v1/capture-payment';

  /**
   * Invocar la Edge Function para capturar pagos de PayPal
   */
  static async capturePayment(paypalOrderId: string, orderData: any): Promise<any> {
    try {
      console.log('🔄 Invocando Edge Function para capturar pago...');
      console.log('PayPal Order ID:', paypalOrderId);
      console.log('Order Data:', orderData);

      // Método 1: Usando supabase.functions.invoke() (recomendado)
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
   * Método alternativo usando fetch directo (fallback)
   */
  static async capturePaymentWithFetch(paypalOrderId: string, orderData: any): Promise<any> {
    try {
      console.log('🔄 Invocando Edge Function con fetch directo...');

      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          paypal_order_id: paypalOrderId,
          orderData: orderData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error en fetch directo:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Error desconocido'}`);
      }

      const data = await response.json();
      console.log('✅ Fetch directo exitoso:', data);

      return data;
    } catch (error) {
      console.error('❌ Error en capturePaymentWithFetch:', error);
      throw error;
    }
  }

  /**
   * Verificar el estado de la Edge Function
   */
  static async checkEdgeFunctionStatus(): Promise<boolean> {
    try {
      console.log('🔍 Verificando estado de Edge Function...');

      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'OPTIONS',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });

      const isAvailable = response.ok;
      console.log(`✅ Edge Function ${isAvailable ? 'disponible' : 'no disponible'}`);

      return isAvailable;
    } catch (error) {
      console.error('❌ Error verificando estado de Edge Function:', error);
      return false;
    }
  }

  /**
   * Probar la Edge Function con datos de prueba
   */
  static async testEdgeFunction(testData: any): Promise<any> {
    try {
      console.log('🧪 Probando Edge Function con datos de prueba...');

      const { data, error } = await supabase.functions.invoke('capture-payment', {
        body: testData,
      });

      if (error) {
        console.error('❌ Error en prueba de Edge Function:', error);
        throw error;
      }

      console.log('✅ Prueba de Edge Function exitosa:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en testEdgeFunction:', error);
      throw error;
    }
  }
}
