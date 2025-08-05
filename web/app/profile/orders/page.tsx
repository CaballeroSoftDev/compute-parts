'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';
import { useOrders } from '@/lib/hooks/use-orders';
import { useToast } from '@/hooks/use-toast';
import { getAddressName, getAddressLocation, getAddressPhone } from '@/lib/utils/address-formatter';
import {
  ChevronLeft,
  Package,
  CreditCard,
  Wallet,
  QrCode,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Phone,
} from 'lucide-react';

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

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'Tarjeta':
      return <CreditCard className="h-4 w-4" />;
    case 'PayPal':
      return <Wallet className="h-4 w-4" />;
    case 'Efectivo':
      return <QrCode className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pendiente':
      return <Clock className="h-4 w-4" />;
    case 'Procesando':
      return <Loader2 className="h-4 w-4 animate-spin" />;
    case 'Enviado':
      return <Truck className="h-4 w-4" />;
    case 'Completado':
      return <CheckCircle className="h-4 w-4" />;
    case 'Cancelado':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function OrdersPage() {
  const { orders, loading, getOrderStats } = useOrders();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const orderStats = await getOrderStats();
        setStats(orderStats);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };

    loadStats();
  }, [getOrderStats]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-6 md:py-10">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando órdenes...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6 md:py-10">
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center text-sm text-[#007BFF] hover:underline"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver al perfil
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Mis Órdenes</h1>
          <p className="text-gray-600">Revisa el estado de tus pedidos</p>
        </div>

        {/* Estadísticas */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Procesando</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                </div>
                <Loader2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enviados</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
                </div>
                <Truck className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelados</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de órdenes */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="mb-4 h-16 w-16 text-gray-400" />
            <p className="mb-2 text-lg font-medium">No tienes órdenes</p>
            <p className="mb-4 text-gray-500">Realiza tu primera compra para ver tus órdenes aquí</p>
            <Link href="/catalog">
              <Button className="bg-[#007BFF] hover:bg-[#0056b3]">Ver Catálogo</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden"
              >
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Orden #{order.order_number}</CardTitle>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(order.payment_method)}
                          <span className="text-sm text-gray-600">{order.payment_method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">MX${order.total_amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('es-MX')}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Items de la orden */}
                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                          <Image
                            src={item.product_image_url || '/placeholder.svg'}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product_name}</h4>
                          <p className="text-sm text-gray-500">
                            Cantidad: {item.quantity} × MX${item.unit_price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">MX${item.total_price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Información de envío */}
                  {order.shipping_amount === 0 ? (
                    <>
                      <Separator className="my-4" />
                      <div className="rounded-lg bg-blue-50 p-3">
                        <div className="flex items-start gap-2">
                          <Package className="mt-0.5 h-4 w-4 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-blue-800">Recoger en tienda</h4>
                            <p className="text-sm text-blue-600">
                              Tu pedido estará listo para recoger en 2 días hábiles
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : order.shipping_address_data ? (
                    <>
                      <Separator className="my-4" />
                      <div className="rounded-lg bg-green-50 p-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-green-600" />
                          <div className="flex-1">
                            <h4 className="font-medium text-green-800">Envío a domicilio</h4>
                            <div className="mt-1 space-y-1 text-sm text-green-700">
                              <p className="font-medium">{getAddressName(order.shipping_address_data)}</p>
                              <p>{getAddressLocation(order.shipping_address_data)}</p>
                              {getAddressPhone(order.shipping_address_data) && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{getAddressPhone(order.shipping_address_data)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Separator className="my-4" />
                      <div className="rounded-lg bg-yellow-50 p-3">
                        <div className="flex items-start gap-2">
                          <Truck className="mt-0.5 h-4 w-4 text-yellow-600" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Sin dirección de envío</h4>
                            <p className="text-sm text-yellow-600">No se ha proporcionado dirección de envío</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Tracking */}
                  {order.tracking_number && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-500" />
                        <div>
                          <h4 className="font-medium">Número de seguimiento:</h4>
                          <p className="text-sm text-gray-600">{order.tracking_number}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Acciones */}
                  <div className="mt-6 flex gap-2">
                    <Link href={`/orders/${order.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Ver detalles
                      </Button>
                    </Link>
                    {order.status === 'Pendiente' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          // Implementar cancelación
                          toast({
                            title: 'Función en desarrollo',
                            description: 'La cancelación de órdenes estará disponible pronto',
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
