'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { OrderService, Order } from '@/lib/services/order-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/formatters';
import { CalendarIcon, PackageIcon, CreditCardIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

export default function OrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await OrderService.getUserOrders(currentPage, 10);
      setOrders(result.orders);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las órdenes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Procesando':
        return 'bg-blue-100 text-blue-800';
      case 'Enviado':
        return 'bg-purple-100 text-purple-800';
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pagado':
        return 'bg-green-100 text-green-800';
      case 'Reembolsado':
        return 'bg-orange-100 text-orange-800';
      case 'Fallido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Mis Órdenes</h1>
            <p className="mb-4 text-gray-600">Debes iniciar sesión para ver tus órdenes</p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Mis Órdenes</h1>
          <p className="text-gray-600">Revisa el estado de tus compras y el historial de pedidos</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <PackageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No tienes órdenes aún</h3>
            <p className="mb-6 text-gray-600">Cuando hagas tu primera compra, aparecerá aquí</p>
            <Link href="/catalog">
              <Button>Ver Productos</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <PackageIcon className="h-5 w-5" />
                        Orden #{order.order_number}
                      </CardTitle>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCardIcon className="h-4 w-4" />
                          {order.payment_method}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(order.total_amount)}</div>
                      <div className="text-sm text-gray-500">{order.items?.length || 0} producto(s)</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    <Badge className={getPaymentStatusColor(order.payment_status)}>{order.payment_status}</Badge>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Productos:</h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {item.product_name} x {item.quantity}
                            </span>
                            <span className="font-medium">{formatCurrency(item.total_price)}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-sm text-gray-500">+{order.items.length - 3} producto(s) más</div>
                        )}
                      </div>
                    </div>
                  )}

                  {order.notes && (
                    <div className="mt-4 rounded-lg bg-blue-50 p-3">
                      <div className="text-sm text-blue-700">
                        <strong>Nota:</strong> {order.notes}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Link href={`/orders/${order.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
