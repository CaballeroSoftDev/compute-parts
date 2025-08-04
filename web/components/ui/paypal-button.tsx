'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';
import { useShippingAddresses } from '@/lib/hooks/use-shipping-addresses';
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
  requireShippingAddress?: boolean;
  selectedShippingAddressId?: string;
}

export function PayPalButton({
  amount,
  currency = 'MXN',
  disabled = false,
  className = '',
  cartItems = [],
  orderData = {},
  onSuccess,
  requireShippingAddress = false,
  selectedShippingAddressId,
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { hasAddresses, addresses } = useShippingAddresses();

  const validateShippingAddress = () => {
    if (!requireShippingAddress) return true;

    if (!hasAddresses) {
      toast({
        title: 'Dirección de envío requerida',
        description: 'Debes agregar una dirección de envío para continuar con el pago',
        variant: 'destructive',
      });
      return false;
    }

    if (!selectedShippingAddressId) {
      toast({
        title: 'Dirección de envío requerida',
        description: 'Debes seleccionar una dirección de envío para continuar con el pago',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const createOrder = async () => {
    try {
      // Validar dirección de envío si es requerida
      if (!validateShippingAddress()) {
        throw new Error('Dirección de envío requerida');
      }

      console.log('Creando orden en PayPal usando Edge Function...');

      // Obtener la dirección seleccionada si es requerida
      let shippingAddress = null;
      if (requireShippingAddress && selectedShippingAddressId) {
        const selectedAddress = addresses.find((addr) => addr.id === selectedShippingAddressId);
        if (selectedAddress) {
          shippingAddress = {
            first_name: selectedAddress.first_name,
            last_name: selectedAddress.last_name,
            phone: selectedAddress.phone,
            address_line_1: selectedAddress.address_line_1,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postal_code: selectedAddress.postal_code,
            country: selectedAddress.country,
          };
        }
      }

      // Usar la Edge Function para crear la orden de PayPal
      const { data: paypalOrderData, error } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          amount,
          currency,
          description: 'Compra en ComputeParts',
          cartItems,
          shippingAddress, // Incluir dirección de envío si está disponible
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

      // Obtener la dirección seleccionada si es requerida
      let shippingAddress = null;
      if (requireShippingAddress && selectedShippingAddressId) {
        const selectedAddress = addresses.find((addr) => addr.id === selectedShippingAddressId);
        if (selectedAddress) {
          shippingAddress = {
            first_name: selectedAddress.first_name,
            last_name: selectedAddress.last_name,
            phone: selectedAddress.phone,
            address_line_1: selectedAddress.address_line_1,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postal_code: selectedAddress.postal_code,
            country: selectedAddress.country,
          };
        }
      }

      // Llamar a la Edge Function para capturar el pago
      const { data: paymentResult, error } = await supabase.functions.invoke('capture-payment', {
        body: {
          paypal_order_id: data.orderID,
          orderData: {
            ...orderData,
            user_id: user?.id || null,
            shipping_address: shippingAddress, // Incluir dirección de envío
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
      });

      if (onSuccess) {
        onSuccess(paymentResult);
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al procesar el pago',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (err: any) => {
    console.error('Error en PayPal:', err);
    toast({
      title: 'Error en PayPal',
      description: 'Hubo un problema con el procesamiento del pago',
      variant: 'destructive',
    });
  };

  // Si se requiere dirección de envío pero no hay direcciones, mostrar mensaje
  if (requireShippingAddress && !hasAddresses) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <p className="mb-2 text-sm text-gray-600">
          Para continuar con el pago, necesitas agregar una dirección de envío
        </p>
        <button
          disabled
          className="w-full cursor-not-allowed rounded-md bg-gray-300 px-4 py-2 text-gray-500"
        >
          Agregar Dirección de Envío Primero
        </button>
      </div>
    );
  }

  // Si se requiere dirección de envío pero no hay una seleccionada
  if (requireShippingAddress && hasAddresses && !selectedShippingAddressId) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <p className="mb-2 text-sm text-gray-600">Selecciona una dirección de envío para continuar con el pago</p>
        <button
          disabled
          className="w-full cursor-not-allowed rounded-md bg-gray-300 px-4 py-2 text-gray-500"
        >
          Seleccionar Dirección de Envío
        </button>
      </div>
    );
  }

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
          label: 'pay',
        }}
      />
    </div>
  );
}
