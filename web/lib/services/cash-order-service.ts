import { EdgeFunctionService } from './edge-function-service';

export class CashOrderService {
  /**
   * Crear una orden de pago en efectivo
   */
  static async createCashOrder(
    orderData: {
      payment_method: 'Efectivo';
      shipping_method: 'pickup' | 'delivery';
      shipping_address?: any;
      shipping_address_id?: string;
      subtotal: number;
      shipping_amount: number;
      total_amount: number;
      notes?: string;
      items: Array<{
        product_id: string;
        name: string;
        price: number;
        quantity: number;
        image_url?: string;
        sku?: string;
      }>;
    },
    userId?: string
  ): Promise<{
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    qr_code: string;
  }> {
    try {
      console.log('🔄 Creando orden de pago en efectivo...');

      // Usar EdgeFunctionService para consistencia
      const result = await EdgeFunctionService.createCashOrder(orderData, userId);

      console.log('✅ Orden de efectivo creada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creando orden de efectivo:', error);
      throw error;
    }
  }

  /**
   * Verificar estado de la Edge Function de efectivo
   */
  static async checkCashOrderFunctionStatus(): Promise<boolean> {
    try {
      console.log('🔍 Verificando estado de Edge Function de efectivo...');

      const isAvailable = await EdgeFunctionService.checkEdgeFunctionStatus('create-cash-order');

      console.log(`✅ Edge Function de efectivo ${isAvailable ? 'disponible' : 'no disponible'}`);
      return isAvailable;
    } catch (error) {
      console.error('❌ Error verificando estado de Edge Function de efectivo:', error);
      return false;
    }
  }

  /**
   * Probar la Edge Function de efectivo
   */
  static async testCashOrderFunction(): Promise<any> {
    try {
      console.log('🧪 Probando Edge Function de efectivo...');

      const testData = {
        orderData: {
          payment_method: 'Efectivo',
          shipping_method: 'pickup',
          subtotal: 100,
          shipping_amount: 0,
          total_amount: 100,
          notes: 'Prueba de Edge Function',
          items: [
            {
              product_id: 'test-product-id',
              name: 'Producto de prueba',
              price: 100,
              quantity: 1,
              image_url: 'https://example.com/image.jpg',
              sku: 'TEST-001',
            },
          ],
        },
        userId: 'test-user-id',
      };

      const result = await EdgeFunctionService.testEdgeFunction('create-cash-order', testData);
      console.log('✅ Prueba de Edge Function de efectivo exitosa:', result);
      return result;
    } catch (error) {
      console.error('❌ Error probando Edge Function de efectivo:', error);
      throw error;
    }
  }

  /**
   * Validar datos de orden antes de crear
   */
  static validateOrderData(orderData: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validar campos requeridos
    if (!orderData.payment_method || orderData.payment_method !== 'Efectivo') {
      errors.push('Método de pago debe ser "Efectivo"');
    }

    if (!orderData.shipping_method || !['pickup', 'delivery'].includes(orderData.shipping_method)) {
      errors.push('Método de envío debe ser "pickup" o "delivery"');
    }

    if (!orderData.total_amount || orderData.total_amount <= 0) {
      errors.push('Monto total debe ser mayor a 0');
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      errors.push('La orden debe tener al menos un item');
    }

    // Validar items
    if (orderData.items) {
      orderData.items.forEach((item: any, index: number) => {
        if (!item.product_id) {
          errors.push(`Item ${index + 1}: ID de producto requerido`);
        }
        if (!item.name) {
          errors.push(`Item ${index + 1}: Nombre requerido`);
        }
        if (!item.price || item.price <= 0) {
          errors.push(`Item ${index + 1}: Precio debe ser mayor a 0`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Cantidad debe ser mayor a 0`);
        }
      });
    }

    // Validar dirección de envío si es delivery
    if (orderData.shipping_method === 'delivery') {
      if (!orderData.shipping_address && !orderData.shipping_address_id) {
        errors.push('Dirección de envío requerida para envío a domicilio');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
