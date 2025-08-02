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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Building2, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminBrands } from '@/lib/hooks/use-admin-brands';
import { ImageUpload } from '@/components/ui/image-upload';
import type { AdminBrand, CreateBrandForm, UpdateBrandForm } from '@/lib/types/admin';

export default function BrandsPage() {
  const { toast } = useToast();
  const { brands, loading, error, createBrand, updateBrand, deleteBrand, refreshBrands, clearError } = useAdminBrands();

  // Limpiar estados al desmontar el componente
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Estados para los diálogos
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<AdminBrand | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estados para el formulario
  const [formData, setFormData] = useState<CreateBrandForm>({
    name: '',
    description: '',
    website: '',
    is_active: true,
  });

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar marcas
  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Manejadores de formularios
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await createBrand(formData);
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        website: '',
        is_active: true,
      });
      toast({
        title: 'Marca creada',
        description: 'La marca se ha creado exitosamente',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear la marca',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand) return;

    setFormLoading(true);
    try {
      await updateBrand(selectedBrand.id, formData);
      setIsEditDialogOpen(false);
      setSelectedBrand(null);
      setFormData({
        name: '',
        description: '',
        website: '',
        is_active: true,
      });
      toast({
        title: 'Marca actualizada',
        description: 'La marca se ha actualizado exitosamente',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar la marca',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;

    try {
      await deleteBrand(selectedBrand.id);
      setIsDeleteDialogOpen(false);
      setSelectedBrand(null);
      toast({
        title: 'Marca eliminada',
        description: 'La marca se ha eliminado exitosamente',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al eliminar la marca',
        variant: 'destructive',
      });
    }
  };

  // Manejador para actualizar datos
  const handleRefresh = async () => {
    try {
      clearError(); // Limpiar errores previos
      await refreshBrands();
      toast({
        title: 'Datos actualizados',
        description: 'La lista de marcas se ha actualizado',
        variant: 'info',
      });
    } catch (error) {
      console.error('Error refreshing brands:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar la lista de marcas',
        variant: 'destructive',
      });
    }
  };

  // Abrir diálogos
  const openEditDialog = (brand: AdminBrand) => {
    clearError(); // Limpiar errores previos
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      website: brand.website || '',
      is_active: brand.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (brand: AdminBrand) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (brand: AdminBrand) => {
    setSelectedBrand(brand);
    setIsViewDialogOpen(true);
  };

  if (error && !loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Error al cargar marcas</h3>
          <p className="text-gray-500 max-w-md">{error}</p>
          <div className="mt-4 space-x-2">
            <Button
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reintentando...
                </>
              ) : (
                'Reintentar'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearError();
                window.location.reload();
              }}
            >
              Recargar página
            </Button>
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
        <span className="font-medium text-gray-900">Marcas</span>
      </div>

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Marcas</h1>
          <p className="text-gray-500">Administra las marcas de productos</p>
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
          <Button onClick={() => { clearError(); setIsAddDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Marca
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Marcas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marcas Activas</CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.filter((b) => b.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marcas Inactivas</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.filter((b) => !b.is_active).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca marcas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Buscar marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de marcas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Marcas</CardTitle>
          <CardDescription>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando marcas...</span>
              </div>
            ) : (
              `${filteredBrands.length} marcas encontradas`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {brands.length === 0 ? 'Cargando marcas...' : 'Actualizando datos...'}
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Sitio Web</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">{brand.name}</div>
                          {brand.products_count !== undefined && (
                            <div className="text-sm text-gray-500">{brand.products_count} productos</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {brand.description ? (
                        <div className="max-w-xs truncate">{brand.description}</div>
                      ) : (
                        <span className="text-gray-400">Sin descripción</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Visitar sitio
                        </a>
                      ) : (
                        <span className="text-gray-400">Sin sitio web</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {brand.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Activa</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactiva</Badge>
                      )}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => openViewDialog(brand)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(brand)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => openDeleteDialog(brand)}
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

      {/* Diálogo Agregar Marca */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Marca</DialogTitle>
            <DialogDescription>Completa la información de la nueva marca.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreateBrand}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la marca"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la marca"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.marca.com"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="is_active">Marca activa</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
              >
                {formLoading ? 'Guardando...' : 'Crear Marca'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Marca */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Marca</DialogTitle>
            <DialogDescription>Modifica la información de la marca.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleUpdateBrand}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website">Sitio Web</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="edit-is_active">Marca activa</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
              >
                {formLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo Ver Marca */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Marca</DialogTitle>
          </DialogHeader>
          {selectedBrand && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-lg font-medium">{selectedBrand.name}</h3>
                  {selectedBrand.products_count !== undefined && (
                    <p className="text-sm text-gray-500">{selectedBrand.products_count} productos</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <div className="mt-1">
                    {selectedBrand.is_active ? (
                      <Badge className="bg-green-100 text-green-800">Activa</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactiva</Badge>
                    )}
                  </div>
                </div>

              </div>
              {selectedBrand.description && (
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <p className="mt-1 text-sm text-gray-600">{selectedBrand.description}</p>
                </div>
              )}

              {selectedBrand.website && (
                <div>
                  <label className="text-sm font-medium">Sitio Web</label>
                  <a
                    href={selectedBrand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm text-blue-600 hover:underline"
                  >
                    {selectedBrand.website}
                  </a>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Fecha de creación</label>
                <p className="text-sm">{new Date(selectedBrand.created_at).toLocaleDateString()}</p>
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
                if (selectedBrand) openEditDialog(selectedBrand);
              }}
            >
              Editar Marca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Eliminar Marca */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar Marca</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta marca? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedBrand && (
            <div className="flex items-center space-x-3 py-4">
              <div>
                <p className="font-medium">{selectedBrand.name}</p>
                {selectedBrand.products_count !== undefined && (
                  <p className="text-sm text-gray-500">{selectedBrand.products_count} productos</p>
                )}
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
              onClick={handleDeleteBrand}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
