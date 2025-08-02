'use client';

import { useState } from 'react';
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Building2, Package, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/lib/admin-context';

export default function BrandsPage() {
  const { brands, addBrand, updateBrand, deleteBrand } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    website: string;
  }>({
    name: '',
    description: '',
    website: '',
  });
  const { toast } = useToast();

  // Filtrar marcas
  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crear marca
  const handleCreateBrand = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la marca es requerido',
        variant: 'destructive',
      });
      return;
    }

    addBrand({
      name: formData.name.trim(),
      description: formData.description.trim(),
      website: formData.website.trim() || undefined,
    });

    setFormData({ name: '', description: '', website: '' });
    setIsAddDialogOpen(false);
    toast({
      title: 'Marca creada',
      description: 'La marca se ha creado exitosamente',
    });
  };

  // Editar marca
  const handleEditBrand = () => {
    if (!selectedBrand || !formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la marca es requerido',
        variant: 'destructive',
      });
      return;
    }

    updateBrand(selectedBrand.id, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      website: formData.website.trim() || undefined,
    });

    setIsEditDialogOpen(false);
    setSelectedBrand(null);
    setFormData({ name: '', description: '', website: '' });
    toast({
      title: 'Marca actualizada',
      description: 'La marca se ha actualizado exitosamente',
    });
  };

  // Eliminar marca
  const handleDeleteBrand = () => {
    if (!selectedBrand) return;

    deleteBrand(selectedBrand.id);
    setIsDeleteDialogOpen(false);
    setSelectedBrand(null);
    toast({
      title: 'Marca eliminada',
      description: 'La marca se ha eliminado exitosamente',
    });
  };

  // Abrir diálogos
  const openEditDialog = (brand: any) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description,
      website: brand.website || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (brand: any) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (brand: any) => {
    setSelectedBrand(brand);
    setIsViewDialogOpen(true);
  };

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
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Marca
        </Button>
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
            <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.reduce((sum, brand) => sum + brand.productCount, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Sitio Web</CardTitle>
            <ExternalLink className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.filter((brand) => brand.website).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Marcas</CardTitle>
          <CardDescription>Encuentra marcas por nombre o descripción</CardDescription>
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
          <CardDescription>{filteredBrands.length} marcas encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Sitio Web</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{brand.description}</TableCell>
                  <TableCell>
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Sitio web
                      </a>
                    ) : (
                      <span className="text-gray-400">Sin sitio web</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{brand.productCount} productos</Badge>
                  </TableCell>
                  <TableCell>{brand.createdAt}</TableCell>
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
                          disabled={brand.productCount > 0}
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
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la marca"
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
                placeholder="https://ejemplo.com"
                type="url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateBrand}>Crear Marca</Button>
          </DialogFooter>
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
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                type="url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditBrand}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Ver Marca */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Marca</DialogTitle>
          </DialogHeader>
          {selectedBrand && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nombre</Label>
                <p className="mt-1 text-sm">{selectedBrand.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Descripción</Label>
                <p className="mt-1 text-sm text-gray-600">{selectedBrand.description || 'Sin descripción'}</p>
              </div>
              {selectedBrand.website && (
                <div>
                  <Label className="text-sm font-medium">Sitio Web</Label>
                  <a
                    href={selectedBrand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {selectedBrand.website}
                  </a>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Productos</Label>
                <p className="mt-1 text-sm">{selectedBrand.productCount} productos</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha de creación</Label>
                <p className="mt-1 text-sm">{selectedBrand.createdAt}</p>
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
            <div className="py-4">
              <p className="font-medium">{selectedBrand.name}</p>
              <p className="text-sm text-gray-500">{selectedBrand.description}</p>
              {selectedBrand.productCount > 0 && (
                <p className="mt-2 text-sm text-red-600">
                  No se puede eliminar: tiene {selectedBrand.productCount} productos asociados
                </p>
              )}
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
              disabled={selectedBrand?.productCount > 0}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
