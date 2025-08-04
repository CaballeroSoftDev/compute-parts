'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';
import { supabase } from '@/lib/supabase';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  disabled?: boolean;
  className?: string;
  cartItems?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
  }>;
  orderData?: any;
  onSuccess?: (data: any) => void;
}

export function PayPalButton({
  amount,
  currency = 'MXN',
  disabled = false,
  className = '',
  cartItems = [],
  orderData = {},
  onSuccess,
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const createOrder = async () => {
    try {
      console.log('Creando orden en PayPal usando Edge Function...');
      
      // Usar la Edge Function para crear la orden de PayPal
      const { data: paypalOrderData, error } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          amount,
          currency,
          description: 'Compra en ComputeParts',
          cartItems,
        },
      });

      if (error) {
        console.error('Error en Edge Function:', error);
        throw new Error(`Error en Edge Function: ${error.message}`);
      }

      if (paypalOrderData.error) {
        throw new Error(paypalOrderData.error);
      }

      if (paypalOrderData.id) {
        console.log('Orden creada exitosamente:', paypalOrderData.id);
        return paypalOrderData.id;
      } else {
        const errorDetail = paypalOrderData?.details?.[0];
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${paypalOrderData.debug_id})`
          : JSON.stringify(paypalOrderData);

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creando orden:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear la orden',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      setIsLoading(true);
      console.log('Procesando pago con PayPal usando Edge Function...');

      // Llamar a la Edge Function para capturar el pago
      const { data: paymentResult, error } = await supabase.functions.invoke('capture-payment', {
        body: {
          paypal_order_id: data.orderID,
          orderData: {
            ...orderData,
            user_id: user?.id || null,
          },
        },
      });

      if (error) {
        console.error('Error en Edge Function:', error);
        throw new Error(`Error en Edge Function: ${error.message}`);
      }

      if (paymentResult.error) {
        throw new Error(paymentResult.error);
      }

      console.log('Pago procesado exitosamente:', paymentResult);

      toast({
        title: '¡Pago exitoso!',
        description: 'Tu orden ha sido procesada correctamente',
        variant: 'default',
      });

      if (onSuccess) {
        onSuccess(paymentResult);
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      toast({
        title: 'Error en el pago',
        description: error instanceof Error ? error.message : 'Error al procesar el pago',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (err: any) => {
    console.error('Error de PayPal:', err);
    toast({
      title: 'Error de PayPal',
      description: 'Hubo un problema con PayPal. Intenta nuevamente.',
      variant: 'destructive',
    });
  };

  return (
    <div className={className}>
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        disabled={disabled || isLoading}
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
        }}
      />
    </div>
  );
}
