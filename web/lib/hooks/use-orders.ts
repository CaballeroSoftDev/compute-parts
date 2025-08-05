'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OrderService, Order, CreateOrderData } from '@/lib/services/order-service';
import { supabase } from '@/lib/supabase';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  // Cargar órdenes del usuario
  const loadOrders = useCallback(
    async (page = 1, limit = 10) => {
      try {
        // Verificar autenticación antes de intentar cargar órdenes
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          console.log('Usuario no autenticado, no se cargan órdenes');
          setOrders([]);
          return { orders: [], total: 0, totalPages: 0 };
        }

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
    [toast]
  );

  // Crear nueva orden
  const createOrder = useCallback(
    async (orderData: CreateOrderData) => {
      try {
        setCreating(true);
        const newOrder = await OrderService.createOrder(orderData);
        setCurrentOrder(newOrder);
        toast({
          title: 'Orden creada',
          description: 'Tu orden se ha creado exitosamente',
        });
        return newOrder;
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
    [toast]
  );

  // Obtener orden por ID
  const getOrder = useCallback(
    async (orderId: string) => {
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
    [toast]
  );

  // Cancelar orden
  const cancelOrder = useCallback(
    async (orderId: string, reason?: string) => {
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
    [currentOrder, toast]
  );

  // Obtener estadísticas de órdenes
  const getOrderStats = useCallback(async () => {
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
  }, []);

  // Limpiar orden actual
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
  }, []);

  // Cargar órdenes al montar el componente solo si el usuario está autenticado
  useEffect(() => {
    // Verificar autenticación antes de cargar órdenes
    const checkAuthAndLoadOrders = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (!error && user) {
          loadOrders();
        }
      } catch (error) {
        console.log('Usuario no autenticado, no se cargan órdenes');
      }
    };

    checkAuthAndLoadOrders();
  }, [loadOrders]);

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
  };
}
