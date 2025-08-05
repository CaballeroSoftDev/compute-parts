'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  Package,
  Clock,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { formatShippingAddress, getAddressName, getAddressLocation, getAddressPhone } from '@/lib/utils/address-formatter';

// Tipos de datos
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  status: 'Pendiente' | 'Procesando' | 'Enviado' | 'Completado' | 'Cancelado';
  paymentStatus: 'Pendiente' | 'Pagado' | 'Reembolsado' | 'Fallido';
  paymentMethod: 'Tarjeta' | 'PayPal' | 'Transferencia' | 'Efectivo';
  shippingAddress: string;
  trackingNumber?: string;
  date: string;
  notes?: string;
}

// Datos iniciales
const initialOrders: Order[] = [
  {
    id: '#3210',
    customer: {
      name: 'Ana García',
      email: 'ana.garcia@email.com',
      phone: '+52 999 123 4567',
    },
    items: [
      {
        id: 1,
        name: 'NVIDIA GeForce RTX 4080',
        price: 1199.99,
        quantity: 1,
        image: '/placeholder.svg?height=50&width=50',
      },
    ],
    total: 1249.99,
    status: 'Completado',
    paymentStatus: 'Pagado',
    paymentMethod: 'Tarjeta',
    shippingAddress: 'Calle 60 #123, Centro, Mérida, Yucatán',
    trackingNumber: 'TRK123456789',
    date: '2024-01-15',
    notes: 'Entrega rápida solicitada',
  },
  {
    id: '#3209',
    customer: {
      name: 'Carlos López',
      email: 'carlos.lopez@email.com',
      phone: '+52 999 234 5678',
    },
    items: [
      {
        id: 2,
        name: 'Intel Core i7-13700K',
        price: 399.99,
        quantity: 1,
        image: '/placeholder.svg?height=50&width=50',
      },
      {
        id: 3,
        name: 'ASUS ROG Strix B650-E',
        price: 299.99,
        quantity: 1,
        image: '/placeholder.svg?height=50&width=50',
      },
    ],
    total: 749.98,
    status: 'Procesando',
    paymentStatus: 'Pagado',
    paymentMethod: 'PayPal',
    shippingAddress: 'Av. Colón #456, García Ginerés, Mérida, Yucatán',
    date: '2024-01-14',
  },
  {
    id: '#3208',
    customer: {
      name: 'María Rodríguez',
      email: 'maria.rodriguez@email.com',
      phone: '+52 999 345 6789',
    },
    items: [
      {
        id: 4,
        name: 'Samsung 980 PRO 1TB',
        price: 199.99,
        quantity: 2,
        image: '/placeholder.svg?height=50&width=50',
      },
    ],
    total: 419.98,
    status: 'Enviado',
    paymentStatus: 'Pagado',
    paymentMethod: 'Tarjeta',
    shippingAddress: 'Calle 42 #789, Fraccionamiento del Norte, Mérida, Yucatán',
    trackingNumber: 'TRK987654321',
    date: '2024-01-13',
  },
  {
    id: '#3207',
    customer: {
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      phone: '+52 999 456 7890',
    },
    items: [
      {
        id: 5,
        name: 'Corsair Vengeance LPX 32GB',
        price: 149.99,
        quantity: 2,
        image: '/placeholder.svg?height=50&width=50',
      },
    ],
    total: 319.98,
    status: 'Pendiente',
    paymentStatus: 'Pendiente',
    paymentMethod: 'Transferencia',
    shippingAddress: 'Calle 21 #321, Centro, Mérida, Yucatán',
    date: '2024-01-12',
  },
  {
    id: '#3206',
    customer: {
      name: 'Laura Martínez',
      email: 'laura.martinez@email.com',
      phone: '+52 999 567 8901',
    },
    items: [
      {
        id: 1,
        name: 'NVIDIA GeForce RTX 4080',
        price: 1199.99,
        quantity: 1,
        image: '/placeholder.svg?height=50&width=50',
      },
    ],
    total: 1249.99,
    status: 'Cancelado',
    paymentStatus: 'Reembolsado',
    paymentMethod: 'Tarjeta',
    shippingAddress: 'Av. Itzaes #654, Santa Ana, Mérida, Yucatán',
    date: '2024-01-11',
    notes: 'Cliente canceló por cambio de opinión',
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Cargar pedidos desde Supabase
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);

        // Usar la función RPC optimizada en lugar de múltiples consultas
        const { data, error } = await supabase.rpc('get_orders_with_user_data', {
          p_limit: 100,
          p_offset: 0,
          p_status: null,
          p_payment_status: null,
          p_search: null,
        });

        if (error) {
          throw error;
        }

        // Transformar los datos al formato esperado por la interfaz
        const formattedOrders = data.map((order: any) => ({
          id: order.order_number,
          customer: {
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
          },
          items: [], // Los items se cargarán por separado si es necesario
          total: order.total_amount,
          status: order.status,
          paymentStatus: order.payment_status,
          paymentMethod: order.payment_method,
          shippingAddress: order.shipping_amount === 0 
            ? 'Recoger en tienda' 
            : order.shipping_address_data
              ? order.shipping_address_data
              : order.shipping_address
                ? typeof order.shipping_address === 'string'
                  ? order.shipping_address
                  : JSON.stringify(order.shipping_address)
                : 'Sin dirección',
          trackingNumber: order.tracking_number,
          date: new Date(order.created_at).toLocaleDateString('es-MX'),
          notes: order.notes,
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los pedidos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [toast]);

  // Filtrar pedidos
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Actualizar estado del pedido
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un estado',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Buscar el ID real del pedido en Supabase usando el order_number
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', selectedOrder.id)
        .single();

      if (orderError || !orderData) {
        throw new Error('No se pudo encontrar el pedido');
      }

      // Actualizar el pedido en Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          tracking_number: trackingNumber || undefined,
        })
        .eq('id', orderData.id);

      if (updateError) {
        throw updateError;
      }

      // Actualizar el estado local
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              status: newStatus as Order['status'],
              trackingNumber: trackingNumber || order.trackingNumber,
            }
          : order
      );

      setOrders(updatedOrders);
      setIsEditDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
      setTrackingNumber('');
      toast({
        title: 'Pedido actualizado',
        description: 'El estado del pedido se ha actualizado exitosamente',
      });
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido',
        variant: 'destructive',
      });
    }
  };

  // Abrir diálogos
  const openViewDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completado':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'Procesando':
        return <Badge className="bg-blue-100 text-blue-800">Procesando</Badge>;
      case 'Enviado':
        return <Badge className="bg-purple-100 text-purple-800">Enviado</Badge>;
      case 'Pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'Cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Pagado':
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case 'Pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'Reembolsado':
        return <Badge className="bg-blue-100 text-blue-800">Reembolsado</Badge>;
      case 'Fallido':
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Estadísticas
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pendiente').length,
    processing: orders.filter((o) => o.status === 'Procesando').length,
    completed: orders.filter((o) => o.status === 'Completado').length,
    revenue: orders.filter((o) => o.paymentStatus === 'Pagado').reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Admin</span>
        <span>/</span>
        <span className="font-medium text-gray-900">Pedidos</span>
      </div>

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
          <p className="text-gray-500">Administra y actualiza el estado de los pedidos</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra pedidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Buscar por ID, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Procesando">Procesando</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={paymentFilter}
              onValueChange={setPaymentFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Pagado">Pagado</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Reembolsado">Reembolsado</SelectItem>
                <SelectItem value="Fallido">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>{filteredOrders.length} pedidos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No se encontraron pedidos</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openViewDialog(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(order)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Actualizar estado
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Truck className="mr-2 h-4 w-4" />
                            Marcar como enviado
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como completado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Diálogo Ver Pedido */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido {selectedOrder?.id}</DialogTitle>
            <DialogDescription>Información completa del pedido</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <Tabs
              defaultValue="details"
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="customer">Cliente</TabsTrigger>
                <TabsTrigger value="shipping">Envío</TabsTrigger>
              </TabsList>

              <TabsContent
                value="details"
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Estado del Pedido</Label>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado del Pago</Label>
                    <div className="mt-1">{getPaymentStatusBadge(selectedOrder.paymentStatus)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Método de Pago</Label>
                    <p className="text-sm">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha</Label>
                    <p className="text-sm">{selectedOrder.date}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Productos</Label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} c/u</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t pt-4 font-medium">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notas</Label>
                    <p className="mt-1 text-sm text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="customer"
                className="space-y-4"
              >
                <div>
                  <Label className="text-sm font-medium">Información del Cliente</Label>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">Nombre:</span> {selectedOrder.customer.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedOrder.customer.email}
                    </p>
                    <p>
                      <span className="font-medium">Teléfono:</span> {selectedOrder.customer.phone}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="shipping"
                className="space-y-4"
              >
                <div>
                  <Label className="text-sm font-medium">Información de Envío</Label>
                  {selectedOrder.shippingAddress === 'Recoger en tienda' ? (
                    <div className="mt-2 rounded-lg bg-blue-50 p-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Recoger en tienda</span>
                      </div>
                      <p className="mt-1 text-xs text-blue-600">
                        El cliente recogerá su pedido en la tienda física
                      </p>
                    </div>
                  ) : selectedOrder.shippingAddress === 'Sin dirección' ? (
                    <div className="mt-2 rounded-lg bg-yellow-50 p-3">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Sin dirección de envío</span>
                      </div>
                      <p className="mt-1 text-xs text-yellow-600">
                        No se ha proporcionado dirección de envío
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg bg-green-50 p-3">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Envío a domicilio</span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-green-700">
                        {typeof selectedOrder.shippingAddress === 'object' && selectedOrder.shippingAddress ? (
                          <>
                            <p className="font-medium">{getAddressName(selectedOrder.shippingAddress)}</p>
                            <p>{getAddressLocation(selectedOrder.shippingAddress)}</p>
                            {getAddressPhone(selectedOrder.shippingAddress) && (
                              <p>📞 {getAddressPhone(selectedOrder.shippingAddress)}</p>
                            )}
                          </>
                        ) : (
                          <p>{selectedOrder.shippingAddress}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedOrder.trackingNumber && (
                  <div>
                    <Label className="text-sm font-medium">Número de Seguimiento</Label>
                    <p className="mt-1 font-mono text-sm">{selectedOrder.trackingNumber}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedOrder) openEditDialog(selectedOrder);
              }}
            >
              Actualizar Estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Estado */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Actualizar Estado del Pedido</DialogTitle>
            <DialogDescription>Actualiza el estado del pedido {selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Estado Actual</Label>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-status">Nuevo Estado</Label>
                <Select
                  value={newStatus}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nuevo estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Procesando">Procesando</SelectItem>
                    <SelectItem value="Enviado">Enviado</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newStatus === 'Enviado' || selectedOrder.status === 'Enviado') && (
                <div className="space-y-2">
                  <Label htmlFor="tracking">Número de Seguimiento</Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ingresa el número de seguimiento"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateOrderStatus}>Actualizar Estado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
