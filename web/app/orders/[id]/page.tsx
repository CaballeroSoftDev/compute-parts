'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { OrderService, Order } from '@/lib/services/order-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  CalendarIcon,
  PackageIcon,
  CreditCardIcon,
  UserIcon,
  MapPinIcon,
  ArrowLeftIcon,
  TruckIcon,
  ReceiptIcon,
} from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = params.id as string;

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await OrderService.getOrder(orderId);
      if (!orderData) {
        toast({
          title: 'Error',
          description: 'Orden no encontrada',
          variant: 'destructive',
        });
        router.push('/orders');
        return;
      }
      setOrder(orderData);
    } catch (error) {
      console.error('Error cargando orden:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la orden',
        variant: 'destructive',
      });
      router.push('/orders');
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
            <h1 className="mb-4 text-2xl font-bold">Detalles de la Orden</h1>
            <p className="mb-4 text-gray-600">Debes iniciar sesión para ver los detalles de la orden</p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Orden no encontrada</h1>
            <p className="mb-6 text-gray-600">La orden que buscas no existe o no tienes permisos para verla</p>
            <Link href="/orders">
              <Button>Volver a Mis Órdenes</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/orders">
            <Button
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Volver a Mis Órdenes
            </Button>
          </Link>
          <h1 className="mb-2 text-3xl font-bold">Orden #{order.order_number}</h1>
          <p className="text-gray-600">Detalles completos de tu pedido</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Información Principal */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageIcon className="h-5 w-5" />
                  Información de la Orden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado de la Orden</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado del Pago</label>
                    <div className="mt-1">
                      <Badge className={getPaymentStatusColor(order.payment_status)}>{order.payment_status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                    <div className="mt-1 text-sm">{formatDate(order.created_at)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Método de Pago</label>
                    <div className="mt-1 text-sm">{order.payment_method}</div>
                  </div>
                </div>

                {order.tracking_number && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número de Seguimiento</label>
                    <div className="mt-1 font-mono text-sm">{order.tracking_number}</div>
                  </div>
                )}

                {order.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notas</label>
                    <div className="mt-1 rounded-lg bg-blue-50 p-3 text-sm">{order.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Productos */}
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        {item.product_image_url && (
                          <img
                            src={item.product_image_url}
                            alt={item.product_name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{item.product_name}</h4>
                          <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Precio unitario: {formatCurrency(item.unit_price)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.total_price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Servicios Adicionales */}
            {order.services && order.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Servicios Adicionales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <span className="font-medium">{service.service_name}</span>
                        <span className="font-medium">{formatCurrency(service.price)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumen y Dirección */}
          <div className="space-y-6">
            {/* Resumen de Costos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ReceiptIcon className="h-5 w-5" />
                  Resumen de Costos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>{formatCurrency(order.shipping_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos:</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuentos:</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Información de Envío */}
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    Dirección de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {typeof order.shipping_address === 'string' ? (
                    <p className="text-sm">{order.shipping_address}</p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Nombre:</strong> {order.shipping_address.first_name} {order.shipping_address.last_name}
                      </p>
                      <p>
                        <strong>Dirección:</strong> {order.shipping_address.address_line_1}
                        {order.shipping_address.address_line_2 && <>, {order.shipping_address.address_line_2}</>}
                      </p>
                      <p>
                        <strong>Ciudad:</strong> {order.shipping_address.city}
                      </p>
                      <p>
                        <strong>Estado:</strong> {order.shipping_address.state}
                      </p>
                      <p>
                        <strong>Código Postal:</strong> {order.shipping_address.postal_code}
                      </p>
                      {order.shipping_address.phone && (
                        <p>
                          <strong>Teléfono:</strong> {order.shipping_address.phone}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
