'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, Eye, ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Tipos de datos
interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Array<{
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Obtener todas las estadísticas del dashboard con una sola llamada
      const { data: dashboardData, error } = await supabase.rpc('get_dashboard_stats');

      if (error) throw error;

      if (!dashboardData || dashboardData.length === 0) {
        throw new Error('No se pudieron obtener los datos del dashboard');
      }

      const stats = dashboardData[0];

      setStats({
        totalSales: Number(stats.total_sales),
        totalOrders: Number(stats.total_orders),
        totalProducts: Number(stats.total_products),
        totalUsers: Number(stats.total_users),
        recentOrders: stats.recent_orders || [],
        topProducts: stats.top_products || []
      });

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No se pudieron cargar los datos del dashboard</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: 'Ventas Totales',
      value: `$${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '+20.1%',
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      title: 'Pedidos',
      value: stats.totalOrders.toString(),
      change: '+180.1%',
      trend: 'up' as const,
      icon: ShoppingCart,
    },
    {
      title: 'Productos',
      value: stats.totalProducts.toString(),
      change: '+19%',
      trend: 'up' as const,
      icon: Package,
    },
    {
      title: 'Usuarios Registrados',
      value: stats.totalUsers.toString(),
      change: '+201',
      trend: 'up' as const,
      icon: Users,
    },
  ];

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
        {dashboardStats.map((stat) => {
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
            {stats.recentOrders.length > 0 ? (
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
                  {stats.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-gray-500">{order.order_number}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${Number(order.total_amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <Link href={`/admin/orders`}>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay pedidos recientes
              </div>
            )}
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
              {stats.topProducts.map((product, index) => {
                const TrendIcon = TrendingUp; // Por ahora siempre up
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
                      <div className="text-sm font-medium">
                        ${product.revenue.toLocaleString('es-MX')}
                      </div>
                      <div className="flex items-center text-xs">
                        <TrendIcon className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500">+12%</span>
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
