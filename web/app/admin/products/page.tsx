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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Package, AlertTriangle, Loader2, RefreshCw, TrendingUp, TrendingDown, CheckCircle, XCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminProducts } from '@/lib/hooks/use-admin-products';
import { useAdminCategories } from '@/lib/hooks/use-admin-categories';
import { useAdminBrands } from '@/lib/hooks/use-admin-brands';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { AdminService } from '@/lib/services/admin-service';
import type { AdminProduct, AdminFilters } from '@/lib/types/admin';
import { Label } from '@/components/ui/label';

export default function ProductsPage() {
  const { toast } = useToast();
  const {
    products,
    loading,
    error,
    pagination,
    filters,
    refreshProducts,
    setFilters,
    setPage,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    getLowStockProducts,
    getOutOfStockProducts,
    clearError,
  } = useAdminProducts();

  const { categories } = useAdminCategories();
  const { brands } = useAdminBrands();

  // Estados para los diálogos
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [newStockQuantity, setNewStockQuantity] = useState(0);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Estados para estadísticas adicionales
  const [lowStockProducts, setLowStockProducts] = useState<AdminProduct[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<AdminProduct[]>([]);

  // Cargar estadísticas adicionales
  useEffect(() => {
    const loadAdditionalStats = async () => {
      try {
        const [lowStock, outOfStock] = await Promise.all([
          getLowStockProducts(),
          getOutOfStockProducts(),
        ]);
        setLowStockProducts(lowStock);
        setOutOfStockProducts(outOfStock);
      } catch (error) {
        console.error('Error loading additional stats:', error);
      }
    };

    if (!loading) {
      loadAdditionalStats();
    }
  }, [loading, getLowStockProducts, getOutOfStockProducts]);

  // Limpiar error cuando se desmonte el componente
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Aplicar filtros
  const applyFilters = () => {
    const newFilters: AdminFilters = {};

    if (searchTerm) {
      newFilters.search = searchTerm;
    }

    if (categoryFilter !== 'all') {
      newFilters.category_id = categoryFilter;
    }

    if (statusFilter !== 'all') {
      newFilters.is_active = statusFilter === 'active';
    }

    if (stockFilter !== 'all') {
      if (stockFilter === 'low') {
        newFilters.stock_min = 1;
        newFilters.stock_max = 10;
      } else if (stockFilter === 'out') {
        newFilters.stock_min = 0;
        newFilters.stock_max = 0;
      }
    }

    setFilters(newFilters);
    setPage(1);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setStockFilter('all');
    setFilters({});
    setPage(1);
  };

  // Manejadores de formularios
  const handleCreateProduct = async (data: any) => {
    setFormLoading(true);
    try {
      await createProduct(data);
      setIsAddDialogOpen(false);
      toast({
        title: 'Producto creado',
        description: 'El producto se ha creado exitosamente',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear el producto',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async (data: any) => {
    if (!selectedProduct) return;

    setFormLoading(true);
    try {
      await updateProduct(selectedProduct.id, data);
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: 'Producto actualizado',
        description: 'El producto se ha actualizado exitosamente',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar el producto',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: 'Producto eliminado',
        description: 'El producto se ha eliminado exitosamente',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al eliminar el producto',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;

    setStockLoading(true);
    try {
      await updateProductStock(selectedProduct.id, newStockQuantity);
      setIsStockDialogOpen(false);
      setSelectedProduct(null);
      setNewStockQuantity(0);
      toast({
        title: 'Stock actualizado',
        description: 'El stock del producto se ha actualizado exitosamente',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar el stock',
        variant: 'destructive',
      });
    } finally {
      setStockLoading(false);
    }
  };

  // Abrir diálogos
  const openEditDialog = async (product: AdminProduct) => {
    clearError(); // Limpiar errores previos
    
    try {
      // Obtener el producto completo con imágenes y relaciones
      const completeProduct = await AdminService.getProduct(product.id);
      
      if (completeProduct) {
        setSelectedProduct(completeProduct);
        setIsEditDialogOpen(true);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información del producto',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading product for edit:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar el producto para edición',
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const openStockDialog = (product: AdminProduct) => {
    setSelectedProduct(product);
    setNewStockQuantity(product.stock_quantity || 0);
    setIsStockDialogOpen(true);
  };

  // Utilidades para mostrar datos
  const getStatusBadge = (product: AdminProduct) => {
    if (!product.is_active) {
      return <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>;
    }
    if ((product.stock_quantity || 0) === 0) {
      return <Badge className="bg-red-100 text-red-800">Agotado</Badge>;
    }
    if ((product.stock_quantity || 0) <= (product.low_stock_threshold || 5)) {
      return <Badge className="bg-yellow-100 text-yellow-800">Stock Bajo</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPrimaryImage = (product: AdminProduct) => {
    const primaryImage = product.images?.find((img) => img.is_primary);
    return primaryImage?.image_url || '/placeholder.svg';
  };

  const handleRefresh = async () => {
    clearError(); // Limpiar errores previos
    try {
      await refreshProducts();
      toast({
        title: 'Datos actualizados',
        description: 'La lista de productos se ha actualizado',
        variant: 'info',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la lista de productos',
        variant: 'destructive',
      });
    }
  };

  if (error && !loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Error al cargar productos</h3>
          <p className="text-gray-500">{error}</p>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">
              Ha ocurrido un error al cargar los productos. Esto puede deberse a problemas de conexión o del servidor.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleRefresh}
                className="flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Reintentando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Reintentar</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Admin</span>
        <span>/</span>
        <span className="font-medium text-gray-900">Productos</span>
      </div>

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
          <p className="text-gray-500">Administra el catálogo de productos de tu tienda</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agotados</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra productos</CardDescription>
        </CardHeader>
        <CardContent>
                     <div className="space-y-4">
             {/* Barra de búsqueda - Siempre arriba en móvil, en línea en desktop */}
             <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
               <div className="relative w-full lg:flex-1">
                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                 <Input
                   placeholder="Buscar productos..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 w-full"
                 />
               </div>
               
               {/* Filtros - Abajo en móvil, en línea en desktop */}
               <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap lg:gap-3">
                 <Select
                   value={categoryFilter}
                   onValueChange={setCategoryFilter}
                 >
                   <SelectTrigger className="w-full sm:w-[200px]">
                     <SelectValue placeholder="Todas las categorías" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Todas las categorías</SelectItem>
                     {categories.map((category) => (
                       <SelectItem
                         key={category.id}
                         value={category.id}
                       >
                         {category.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 
                 <Select
                   value={statusFilter}
                   onValueChange={setStatusFilter}
                 >
                   <SelectTrigger className="w-full sm:w-[150px]">
                     <SelectValue placeholder="Todos" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Todos</SelectItem>
                     <SelectItem value="active">Activo</SelectItem>
                     <SelectItem value="inactive">Inactivo</SelectItem>
                   </SelectContent>
                 </Select>
                 
                 <Select
                   value={stockFilter}
                   onValueChange={setStockFilter}
                 >
                   <SelectTrigger className="w-full sm:w-[150px]">
                     <SelectValue placeholder="Todo el stock" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Todo el stock</SelectItem>
                     <SelectItem value="low">Stock bajo</SelectItem>
                     <SelectItem value="out">Agotados</SelectItem>
                   </SelectContent>
                 </Select>
                 
                 <div className="flex gap-2 w-full sm:w-auto">
                   <Button 
                     onClick={applyFilters}
                     className="flex-1 sm:flex-none"
                   >
                     Aplicar Filtros
                   </Button>
                   <Button
                     variant="outline"
                     onClick={clearFilters}
                     className="flex-1 sm:flex-none"
                   >
                     Limpiar
                   </Button>
                 </div>
               </div>
             </div>
           </div>
        </CardContent>
      </Card>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{products.length > 0 ? 'Actualizando datos...' : 'Cargando productos...'}</span>
              </div>
            ) : (
              `${products.length} productos encontrados`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getPrimaryImage(product)}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                          {product.is_featured && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                            >
                              Destacado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category?.name || 'Sin categoría'}</TableCell>
                    <TableCell>{product.brand?.name || 'Sin marca'}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={getStockColor(product.stock_quantity || 0)}>
                        {product.stock_quantity || 0} unidades
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(product)}</TableCell>
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
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => openViewDialog(product)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => openStockDialog(product)}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Actualizar stock
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => openDeleteDialog(product)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
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

      {/* Paginación */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Diálogo Agregar Producto */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>Completa la información del nuevo producto.</DialogDescription>
          </DialogHeader>
          <ProductForm
            categories={categories}
            brands={brands}
            onSubmit={handleCreateProduct}
            onCancel={() => setIsAddDialogOpen(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Producto */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Modifica la información del producto.</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              categories={categories}
              brands={brands}
              onSubmit={handleUpdateProduct}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo Ver Producto */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={getPrimaryImage(selectedProduct)}
                  alt={selectedProduct.name}
                  className="h-20 w-20 rounded-md object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500">{selectedProduct.sku}</p>
                  {selectedProduct.is_featured && (
                    <Badge
                      variant="secondary"
                      className="mt-1"
                    >
                      Destacado
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <p className="text-sm">{selectedProduct.category?.name || 'Sin categoría'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Marca</label>
                  <p className="text-sm">{selectedProduct.brand?.name || 'Sin marca'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Precio</label>
                  <p className="text-sm">${selectedProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <p className={`text-sm ${getStockColor(selectedProduct.stock_quantity || 0)}`}>
                    {selectedProduct.stock_quantity || 0} unidades
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <div className="mt-1">{getStatusBadge(selectedProduct)}</div>
              </div>
              {selectedProduct.description && (
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <p className="mt-1 text-sm text-gray-600">{selectedProduct.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Fecha de creación</label>
                <p className="text-sm">{new Date(selectedProduct.created_at).toLocaleDateString()}</p>
              </div>
            </div>
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
                if (selectedProduct) openEditDialog(selectedProduct);
              }}
            >
              Editar Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Eliminar Producto */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="flex items-center space-x-3 py-4">
              <img
                src={getPrimaryImage(selectedProduct)}
                alt={selectedProduct.name}
                className="h-12 w-12 rounded-md object-cover"
              />
              <div>
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">{selectedProduct.sku}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Actualizar Stock */}
      <Dialog
        open={isStockDialogOpen}
        onOpenChange={setIsStockDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Actualizar Stock</DialogTitle>
            <DialogDescription>
              Actualiza la cantidad de stock disponible para este producto.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src={getPrimaryImage(selectedProduct)}
                  alt={selectedProduct.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div>
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">Stock actual: {selectedProduct.stock_quantity || 0}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-stock">Nueva cantidad de stock</Label>
                <Input
                  id="new-stock"
                  type="number"
                  value={newStockQuantity}
                  onChange={(e) => setNewStockQuantity(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStockDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateStock}
              disabled={stockLoading}
            >
              {stockLoading ? 'Actualizando...' : 'Actualizar Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
