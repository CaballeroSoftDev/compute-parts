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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Tags, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminCategories } from '@/lib/hooks/use-admin-categories';
import { ImageUpload } from '@/components/ui/image-upload';
import type { AdminCategory, CreateCategoryForm, UpdateCategoryForm } from '@/lib/types/admin';

export default function CategoriesPage() {
  const { toast } = useToast();
  const { categories, loading, error, createCategory, updateCategory, deleteCategory, refreshCategories, clearError } =
    useAdminCategories();

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
  const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estados para el formulario
  const [formData, setFormData] = useState<CreateCategoryForm>({
    name: '',
    description: '',
    slug: '',
    image_url: '',
    is_active: true,
  });

  // Estados para archivos temporales
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar categorías
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Manejadores de formularios
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Pasar el archivo temporal al servicio
      await createCategory(formData, tempImageFile || undefined);
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        slug: '',
        image_url: '',
        is_active: true,
      });
      setTempImageFile(null);
      toast({
        title: 'Categoría creada',
        description: 'La categoría se ha creado exitosamente',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear la categoría',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setFormLoading(true);
    try {
      // Pasar el archivo temporal al servicio
      await updateCategory(selectedCategory.id, formData, tempImageFile || undefined);
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: '',
        slug: '',
        image_url: '',
        is_active: true,
      });
      setTempImageFile(null);
      toast({
        title: 'Categoría actualizada',
        description: 'La categoría se ha actualizado exitosamente',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar la categoría',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await deleteCategory(selectedCategory.id);
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: 'Categoría eliminada',
        description: 'La categoría se ha eliminado exitosamente',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al eliminar la categoría',
        variant: 'destructive',
      });
    }
  };

  // Abrir diálogos
  const openEditDialog = (category: AdminCategory) => {
    clearError(); // Limpiar errores previos
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
    });
    setTempImageFile(null);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: AdminCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (category: AdminCategory) => {
    setSelectedCategory(category);
    setIsViewDialogOpen(true);
  };

  const handleRefresh = async () => {
    try {
      clearError(); // Limpiar errores previos
      await refreshCategories();
      toast({
        title: 'Datos actualizados',
        description: 'La lista de categorías se ha actualizado',
        variant: 'info',
      });
    } catch (error) {
      console.error('Error refreshing categories:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar la lista de categorías',
        variant: 'destructive',
      });
    }
  };

  // Manejador para cambios de archivo temporal
  const handleImageFileChange = (file: File | null) => {
    setTempImageFile(file);
  };

  if (error && !loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Tags className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Error al cargar categorías</h3>
          <p className="max-w-md text-gray-500">{error}</p>
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
        <span className="font-medium text-gray-900">Categorías</span>
      </div>

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
          <p className="text-gray-500">Administra las categorías de productos</p>
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
          <Button
            onClick={() => {
              clearError();
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Categoría
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categorías</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías Activas</CardTitle>
            <Tags className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.filter((c) => c.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías Inactivas</CardTitle>
            <Tags className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.filter((c) => !c.is_active).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca categorías</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
          <CardDescription>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando categorías...</span>
              </div>
            ) : (
              `${filteredCategories.length} categorías encontradas`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                <p className="text-sm text-gray-500">
                  {categories.length === 0 ? 'Cargando categorías...' : 'Actualizando datos...'}
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {category.image_url && (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.products_count !== undefined && (
                            <div className="text-sm text-gray-500">{category.products_count} productos</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.description ? (
                        <div className="max-w-xs truncate">{category.description}</div>
                      ) : (
                        <span className="text-gray-400">Sin descripción</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {category.slug ? (
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs">{category.slug}</code>
                      ) : (
                        <span className="text-gray-400">Sin slug</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {category.is_active ? (
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
                          <DropdownMenuItem onClick={() => openViewDialog(category)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => openDeleteDialog(category)}
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

      {/* Diálogo Agregar Categoría */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Categoría</DialogTitle>
            <DialogDescription>Completa la información de la nueva categoría.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreateCategory}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la categoría"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la categoría"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="slug-de-la-categoria"
              />
            </div>
            <ImageUpload
              label="Imagen de la categoría"
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              uploadType="category"
              showOptimization={true}
              optimizeImage={true}
              maxWidth={800}
              maxHeight={600}
              showPreview={true}
              previewSize="md"
              uploadOnSelect={false} // No subir inmediatamente
              selectedFile={tempImageFile}
              onFileChange={handleImageFileChange}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="is_active">Categoría activa</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setTempImageFile(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
              >
                {formLoading ? 'Guardando...' : 'Crear Categoría'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Categoría */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>Modifica la información de la categoría.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleUpdateCategory}
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
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <ImageUpload
              label="Imagen de la categoría"
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              uploadType="category"
              showOptimization={true}
              optimizeImage={true}
              maxWidth={800}
              maxHeight={600}
              showPreview={true}
              previewSize="md"
              uploadOnSelect={false} // No subir inmediatamente
              selectedFile={tempImageFile}
              onFileChange={handleImageFileChange}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="edit-is_active">Categoría activa</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setTempImageFile(null);
                }}
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

      {/* Diálogo Ver Categoría */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Categoría</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedCategory.image_url && (
                  <img
                    src={selectedCategory.image_url}
                    alt={selectedCategory.name}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium">{selectedCategory.name}</h3>
                  {selectedCategory.products_count !== undefined && (
                    <p className="text-sm text-gray-500">{selectedCategory.products_count} productos</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <div className="mt-1">
                    {selectedCategory.is_active ? (
                      <Badge className="bg-green-100 text-green-800">Activa</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactiva</Badge>
                    )}
                  </div>
                </div>
              </div>
              {selectedCategory.description && (
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <p className="mt-1 text-sm text-gray-600">{selectedCategory.description}</p>
                </div>
              )}
              {selectedCategory.slug && (
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <code className="mt-1 block rounded bg-gray-100 px-2 py-1 text-sm">{selectedCategory.slug}</code>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Fecha de creación</label>
                <p className="text-sm">{new Date(selectedCategory.created_at).toLocaleDateString()}</p>
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
                if (selectedCategory) openEditDialog(selectedCategory);
              }}
            >
              Editar Categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Eliminar Categoría */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="flex items-center space-x-3 py-4">
              {selectedCategory.image_url && (
                <img
                  src={selectedCategory.image_url}
                  alt={selectedCategory.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
              )}
              <div>
                <p className="font-medium">{selectedCategory.name}</p>
                {selectedCategory.products_count !== undefined && (
                  <p className="text-sm text-gray-500">{selectedCategory.products_count} productos</p>
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
              onClick={handleDeleteCategory}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
