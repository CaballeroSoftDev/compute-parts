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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Users,
  Shield,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Tipos de datos
interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'Cliente' | 'Administrador' | 'Moderador';
  status: 'Activo' | 'Inactivo' | 'Suspendido';
  joinDate: string;
  lastLogin: string;
  orders: number;
  totalSpent: number;
  avatar?: string;
  address?: string;
  notes?: string;
  emailVerified: boolean;
  notifications: boolean;
}

// Datos iniciales
const initialUsers: AdminUser[] = [
  {
    id: 1,
    name: 'Ana García',
    email: 'ana.garcia@email.com',
    phone: '+52 999 123 4567',
    role: 'Cliente',
    status: 'Activo',
    joinDate: '2024-01-15',
    lastLogin: '2024-01-20',
    orders: 12,
    totalSpent: 2499.99,
    address: 'Calle 60 #123, Centro, Mérida, Yucatán',
    emailVerified: true,
    notifications: true,
  },
  {
    id: 2,
    name: 'Carlos López',
    email: 'carlos.lopez@email.com',
    phone: '+52 999 234 5678',
    role: 'Cliente',
    status: 'Activo',
    joinDate: '2024-01-10',
    lastLogin: '2024-01-19',
    orders: 8,
    totalSpent: 1899.99,
    address: 'Av. Colón #456, García Ginerés, Mérida, Yucatán',
    emailVerified: true,
    notifications: false,
  },
  {
    id: 3,
    name: 'María Rodríguez',
    email: 'maria.rodriguez@email.com',
    phone: '+52 999 345 6789',
    role: 'Administrador',
    status: 'Activo',
    joinDate: '2023-12-01',
    lastLogin: '2024-01-20',
    orders: 0,
    totalSpent: 0,
    notes: 'Administradora principal del sistema',
    emailVerified: true,
    notifications: true,
  },
  {
    id: 4,
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+52 999 456 7890',
    role: 'Cliente',
    status: 'Inactivo',
    joinDate: '2024-01-05',
    lastLogin: '2024-01-12',
    orders: 3,
    totalSpent: 599.99,
    address: 'Calle 21 #321, Centro, Mérida, Yucatán',
    notes: 'Usuario inactivo por solicitud propia',
    emailVerified: false,
    notifications: false,
  },
  {
    id: 5,
    name: 'Laura Martínez',
    email: 'laura.martinez@email.com',
    phone: '+52 999 567 8901',
    role: 'Moderador',
    status: 'Activo',
    joinDate: '2023-11-15',
    lastLogin: '2024-01-18',
    orders: 2,
    totalSpent: 899.98,
    notes: 'Moderadora de contenido y soporte',
    emailVerified: true,
    notifications: true,
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<Partial<AdminUser>>({});
  const { toast } = useToast();

  // Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Crear usuario
  const handleCreateUser = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    const newUser: AdminUser = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone || '',
      role: formData.role!,
      status: 'Activo',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Nunca',
      orders: 0,
      totalSpent: 0,
      address: formData.address || '',
      notes: formData.notes || '',
      emailVerified: false,
      notifications: formData.notifications || true,
    };

    setUsers([...users, newUser]);
    setFormData({});
    setIsAddDialogOpen(false);
    toast({
      title: 'Usuario creado',
      description: 'El usuario se ha creado exitosamente',
    });
  };

  // Editar usuario
  const handleEditUser = () => {
    if (!selectedUser || !formData.name || !formData.email) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    const updatedUsers = users.map((user) => (user.id === selectedUser.id ? { ...user, ...formData } : user));

    setUsers(updatedUsers);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    setFormData({});
    toast({
      title: 'Usuario actualizado',
      description: 'El usuario se ha actualizado exitosamente',
    });
  };

  // Eliminar usuario
  const handleDeleteUser = () => {
    if (!selectedUser) return;

    setUsers(users.filter((user) => user.id !== selectedUser.id));
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    toast({
      title: 'Usuario eliminado',
      description: 'El usuario se ha eliminado exitosamente',
    });
  };

  // Cambiar estado del usuario
  const toggleUserStatus = (user: AdminUser) => {
    const newStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
    const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u));
    setUsers(updatedUsers);
    toast({
      title: 'Estado actualizado',
      description: `Usuario ${newStatus.toLowerCase()}`,
    });
  };

  // Abrir diálogos
  const openEditDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData(user);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Administrador':
        return <Badge className="bg-red-100 text-red-800">Administrador</Badge>;
      case 'Moderador':
        return <Badge className="bg-blue-100 text-blue-800">Moderador</Badge>;
      case 'Cliente':
        return <Badge className="bg-gray-100 text-gray-800">Cliente</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Activo':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case 'Inactivo':
        return <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>;
      case 'Suspendido':
        return <Badge className="bg-red-100 text-red-800">Suspendido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Estadísticas
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'Activo').length,
    customers: users.filter((u) => u.role === 'Cliente').length,
    admins: users.filter((u) => u.role === 'Administrador').length,
    newThisMonth: users.filter((u) => new Date(u.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Admin</span>
        <span>/</span>
        <span className="font-medium text-gray-900">Usuarios</span>
      </div>

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra las cuentas de usuario y permisos</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="Cliente">Cliente</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Moderador">Moderador</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
                <SelectItem value="Suspendido">Suspendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>{filteredUsers.length} usuarios encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Total Gastado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                        <Mail className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>{user.orders}</TableCell>
                  <TableCell>${user.totalSpent.toFixed(2)}</TableCell>
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
                        <DropdownMenuItem onClick={() => openViewDialog(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar usuario
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                          {user.status === 'Activo' ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteDialog(user)}
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

      {/* Diálogo Agregar Usuario */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription>Completa la información del nuevo usuario.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+52 999 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select
                  value={formData.role || ''}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      role: value as AdminUser['role'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cliente">Cliente</SelectItem>
                    <SelectItem value="Moderador">Moderador</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección completa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre el usuario"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="notifications"
                checked={formData.notifications || true}
                onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })}
              />
              <Label htmlFor="notifications">Habilitar notificaciones por email</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>Crear Usuario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Usuario */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica la información del usuario.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre completo *</Label>
                <Input
                  id="edit-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select
                  value={formData.role || ''}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      role: value as AdminUser['role'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cliente">Cliente</SelectItem>
                    <SelectItem value="Moderador">Moderador</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Estado</Label>
              <Select
                value={formData.status || ''}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as AdminUser['status'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Input
                id="edit-address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notas</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email verificado</Label>
                  <p className="text-sm text-gray-500">Marcar email como verificado</p>
                </div>
                <Switch
                  checked={formData.emailVerified || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, emailVerified: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones</Label>
                  <p className="text-sm text-gray-500">Habilitar notificaciones por email</p>
                </div>
                <Switch
                  checked={formData.notifications || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Ver Usuario */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Perfil del Usuario</DialogTitle>
            <DialogDescription>Información completa del usuario</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Tabs
              defaultValue="profile"
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
                <TabsTrigger value="settings">Configuración</TabsTrigger>
              </TabsList>

              <TabsContent
                value="profile"
                className="space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                    <Mail className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {getRoleBadge(selectedUser.role)}
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center text-sm font-medium">
                      <Phone className="mr-1 h-4 w-4" />
                      Teléfono
                    </Label>
                    <p className="text-sm">{selectedUser.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="flex items-center text-sm font-medium">
                      <Calendar className="mr-1 h-4 w-4" />
                      Fecha de registro
                    </Label>
                    <p className="text-sm">{selectedUser.joinDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Último acceso</Label>
                    <p className="text-sm">{selectedUser.lastLogin}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total de pedidos</Label>
                    <p className="text-sm">{selectedUser.orders}</p>
                  </div>
                </div>

                {selectedUser.address && (
                  <div>
                    <Label className="text-sm font-medium">Dirección</Label>
                    <p className="text-sm text-gray-600">{selectedUser.address}</p>
                  </div>
                )}

                {selectedUser.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notas</Label>
                    <p className="text-sm text-gray-600">{selectedUser.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="activity"
                className="space-y-4"
              >
                <div>
                  <Label className="text-sm font-medium">Estadísticas de compras</Label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-gray-500">Total de pedidos</p>
                      <p className="text-2xl font-bold">{selectedUser.orders}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-gray-500">Total gastado</p>
                      <p className="text-2xl font-bold">${selectedUser.totalSpent.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Actividad reciente</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Último acceso: {selectedUser.lastLogin}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>Cuenta creada: {selectedUser.joinDate}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="settings"
                className="space-y-4"
              >
                <div>
                  <Label className="text-sm font-medium">Configuración de cuenta</Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Email verificado</p>
                        <p className="text-xs text-gray-500">El email del usuario está verificado</p>
                      </div>
                      <Badge variant={selectedUser.emailVerified ? 'default' : 'secondary'}>
                        {selectedUser.emailVerified ? 'Verificado' : 'No verificado'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Notificaciones</p>
                        <p className="text-xs text-gray-500">Recibe notificaciones por email</p>
                      </div>
                      <Badge variant={selectedUser.notifications ? 'default' : 'secondary'}>
                        {selectedUser.notifications ? 'Habilitadas' : 'Deshabilitadas'}
                      </Badge>
                    </div>
                  </div>
                </div>
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
                if (selectedUser) openEditDialog(selectedUser);
              }}
            >
              Editar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Eliminar Usuario */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="flex items-center space-x-3 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                <Mail className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
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
              onClick={handleDeleteUser}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
