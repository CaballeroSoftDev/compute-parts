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
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Estados para estadísticas adicionales
  const [lowStockProducts, setLowStockProducts] = useState<AdminProduct[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<AdminProduct[]>([]);

  // Cargar estadísticas adicionales
  useEffect(() => {
    const loadAdditionalStats = async () => {
      try {
        const [lowStock, outOfStock] = await Promise.all([getLowStockProducts(), getOutOfStockProducts()]);
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
  useEffect(() => {
    const newFilters: AdminFilters = {};
    
    if (searchTerm) newFilters.search = searchTerm;
    if (selectedCategory && selectedCategory !== 'all') newFilters.category_id = selectedCategory;
    if (selectedBrand && selectedBrand !== 'all') newFilters.brand_id = selectedBrand;
    if (selectedStatus && selectedStatus !== 'all') {
      if (selectedStatus === 'active') newFilters.is_active = true;
      else if (selectedStatus === 'inactive') newFilters.is_active = false;
    }

    setFilters(newFilters);
  }, [searchTerm, selectedCategory, selectedBrand, selectedStatus, setFilters]);

  // Filtrar productos localmente para búsqueda en tiempo real
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category?.name && product.category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand?.name && product.brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  // Funciones de paginación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setPage(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(pagination.total_pages);
  const goToPreviousPage = () => goToPage(pagination.page - 1);
  const goToNextPage = () => goToPage(pagination.page + 1);

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.total_pages;
    const currentPage = pagination.page;
    
    // Mostrar máximo 5 páginas
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Ajustar si estamos cerca del inicio o final
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
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
            <div className="text-2xl font-bold">{filteredProducts.filter((p) => p.is_active).length}</div>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las marcas</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
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
              `${pagination.total} productos encontrados`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="h-[600px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-[300px]">Producto</TableHead>
                      <TableHead className="w-[150px]">Categoría</TableHead>
                      <TableHead className="w-[150px]">Marca</TableHead>
                      <TableHead className="w-[100px]">Precio</TableHead>
                      <TableHead className="w-[100px]">Stock</TableHead>
                      <TableHead className="w-[120px]">Estado</TableHead>
                      <TableHead className="w-[100px] text-right">Acciones</TableHead>
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
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{product.name}</div>
                              <div className="text-sm text-gray-500 truncate">{product.sku}</div>
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
                        <TableCell className="truncate">{product.category?.name || 'Sin categoría'}</TableCell>
                        <TableCell className="truncate">{product.brand?.name || 'Sin marca'}</TableCell>
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
                                className="cursor-pointer text-red-600"
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación mejorada */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={pagination.page <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {getPageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pagination.page >= pagination.total_pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={pagination.page >= pagination.total_pages}
            >
              <ChevronsRight className="h-4 w-4" />
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
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Etiquetas</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedProduct.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
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
            <DialogDescription>Actualiza la cantidad de stock disponible para este producto.</DialogDescription>
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
