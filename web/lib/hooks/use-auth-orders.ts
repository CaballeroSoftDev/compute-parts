'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OrderService, Order, CreateOrderData } from '@/lib/services/order-service';
import { CashOrderService } from '@/lib/services/cash-order-service';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export function useAuthOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Cargar órdenes del usuario solo si está autenticado
  const loadOrders = useCallback(
    async (page = 1, limit = 10) => {
      // No cargar órdenes si el usuario no está autenticado
      if (!user) {
        console.log('Usuario no autenticado, no se cargan órdenes');
        setOrders([]);
        return { orders: [], total: 0, totalPages: 0 };
      }

      try {
        setLoading(true);
        const result = await OrderService.getUserOrders(page, limit);
        setOrders(result.orders);
        return result;
      } catch (error) {
        console.error('Error cargando órdenes:', error);
        // Solo mostrar toast si no es un error de autenticación
        if (error instanceof Error && !error.message.includes('Usuario no autenticado')) {
          toast({
            title: 'Error',
            description: 'No se pudieron cargar las órdenes',
            variant: 'destructive',
          });
        }
        return { orders: [], total: 0, totalPages: 0 };
      } finally {
        setLoading(false);
      }
    },
    [user, toast]
  );

  // Crear nueva orden
  const createOrder = useCallback(
    async (orderData: CreateOrderData) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      try {
        setCreating(true);

        // Determinar el tipo de orden y usar el servicio apropiado
        if (orderData.payment_method === 'Efectivo') {
          // Validar datos de orden de efectivo
          const validation = CashOrderService.validateOrderData(orderData as any);
          if (!validation.isValid) {
            throw new Error(`Datos de orden inválidos: ${validation.errors.join(', ')}`);
          }

          // Usar CashOrderService para órdenes de efectivo
          const newOrder = await CashOrderService.createCashOrder(orderData as any, user.id);
          
          // Convertir el resultado al tipo Order
          const orderResult: Order = {
            id: newOrder.id,
            order_number: newOrder.order_number,
            user_id: user.id,
            status: newOrder.status as any,
            payment_status: newOrder.payment_status as any,
            payment_method: 'Efectivo',
            subtotal: orderData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
            tax_amount: 0,
            shipping_amount: orderData.shipping_method === 'delivery' ? 150 : 0, // Valor por defecto
            discount_amount: 0,
            total_amount: orderData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
            shipping_address_id: undefined, // No está en CreateOrderData
            shipping_address: orderData.shipping_address,
            notes: orderData.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            payment_details: {
              qr_code: newOrder.qr_code,
              method: 'cash',
            },
          };
          
          setCurrentOrder(orderResult);
          toast({
            title: 'Orden creada',
            description: 'Tu orden se ha creado exitosamente. Paga en tienda con el QR.',
          });
          return orderResult;
        } else {
          // Para otros métodos de pago, usar el servicio original
          const newOrder = await OrderService.createOrder(orderData);
          setCurrentOrder(newOrder);
          toast({
            title: 'Orden creada',
            description: 'Tu orden se ha creado exitosamente',
          });
          return newOrder;
        }
      } catch (error) {
        console.error('Error creando orden:', error);
        toast({
          title: 'Error',
          description: 'No se pudo crear la orden',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setCreating(false);
      }
    },
    [user, toast]
  );

  // Obtener orden por ID
  const getOrder = useCallback(
    async (orderId: string) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      try {
        setLoading(true);
        const order = await OrderService.getOrder(orderId);
        setCurrentOrder(order);
        return order;
      } catch (error) {
        console.error('Error obteniendo orden:', error);
        toast({
          title: 'Error',
          description: 'No se pudo obtener la orden',
          variant: 'destructive',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, toast]
  );

  // Cancelar orden
  const cancelOrder = useCallback(
    async (orderId: string, reason?: string) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      try {
        setLoading(true);
        const updatedOrder = await OrderService.cancelOrder(orderId, reason);

        // Actualizar la orden en la lista si existe
        setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));

        // Actualizar orden actual si es la misma
        if (currentOrder?.id === orderId) {
          setCurrentOrder(updatedOrder);
        }

        toast({
          title: 'Orden cancelada',
          description: 'La orden se ha cancelado exitosamente',
        });

        return updatedOrder;
      } catch (error) {
        console.error('Error cancelando orden:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cancelar la orden',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user, currentOrder, toast]
  );

  // Obtener estadísticas de órdenes
  const getOrderStats = useCallback(async () => {
    if (!user) {
      return {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        completed: 0,
        cancelled: 0,
      };
    }

    try {
      const stats = await OrderService.getOrderStats();
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        completed: 0,
        cancelled: 0,
      };
    }
  }, [user]);

  // Limpiar orden actual
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
  }, []);

  // Cargar órdenes al montar el componente
  useEffect(() => {
    if (user && !authLoading) {
      loadOrders();
    }
  }, [user, authLoading, loadOrders]);

  return {
    orders,
    currentOrder,
    loading,
    creating,
    loadOrders,
    createOrder,
    getOrder,
    cancelOrder,
    getOrderStats,
    clearCurrentOrder,
    isAuthenticated: !!user,
  };
}
