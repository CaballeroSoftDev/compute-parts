import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, Eye, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

// Datos de ejemplo para el dashboard
const stats = [
  {
    title: 'Ventas Totales',
    value: '$45,231.89',
    change: '+20.1%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    title: 'Pedidos',
    value: '2,350',
    change: '+180.1%',
    trend: 'up',
    icon: ShoppingCart,
  },
  {
    title: 'Productos',
    value: '12,234',
    change: '+19%',
    trend: 'up',
    icon: Package,
  },
  {
    title: 'Usuarios Activos',
    value: '573',
    change: '+201',
    trend: 'up',
    icon: Users,
  },
];

const recentOrders = [
  {
    id: '#3210',
    customer: 'Ana García',
    email: 'ana.garcia@email.com',
    amount: '$1,249.99',
    status: 'Completado',
  },
  {
    id: '#3209',
    customer: 'Carlos López',
    email: 'carlos.lopez@email.com',
    amount: '$899.99',
    status: 'Procesando',
  },
  {
    id: '#3208',
    customer: 'María Rodríguez',
    email: 'maria.rodriguez@email.com',
    amount: '$1,599.99',
    status: 'Enviado',
  },
  {
    id: '#3207',
    customer: 'Juan Pérez',
    email: 'juan.perez@email.com',
    amount: '$299.99',
    status: 'Pendiente',
  },
];

const topProducts = [
  {
    name: 'NVIDIA GeForce RTX 4080',
    sales: 89,
    revenue: '$106,711',
    trend: 'up',
  },
  {
    name: 'Intel Core i7-13700K',
    sales: 67,
    revenue: '$26,799',
    trend: 'up',
  },
  {
    name: 'Corsair Vengeance LPX 32GB',
    sales: 45,
    revenue: '$6,749',
    trend: 'down',
  },
  {
    name: 'Samsung 980 PRO 1TB',
    sales: 38,
    revenue: '$7,599',
    trend: 'up',
  },
];

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
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span className="font-medium text-gray-900">Dashboard</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-gray-500">Resumen general de tu tienda CompuParts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendIcon className={`mr-1 h-3 w-3 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>{stat.change}</span>
                  <span className="ml-1">desde el mes pasado</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pedidos Recientes</CardTitle>
              <CardDescription>Últimos pedidos realizados</CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button
                variant="outline"
                size="sm"
              >
                Ver todos
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-gray-500">{order.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{order.amount}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Productos Más Vendidos</CardTitle>
              <CardDescription>Productos con mejor rendimiento</CardDescription>
            </div>
            <Link href="/admin/products">
              <Button
                variant="outline"
                size="sm"
              >
                Ver todos
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => {
                const TrendIcon = product.trend === 'up' ? TrendingUp : TrendingDown;
                return (
                  <div
                    key={product.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.sales} ventas</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{product.revenue}</div>
                      <div className="flex items-center text-xs">
                        <TrendIcon
                          className={`mr-1 h-3 w-3 ${product.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
                        />
                        <span className={product.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                          {product.trend === 'up' ? '+12%' : '-5%'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
