'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useShippingAddresses } from '@/lib/hooks/use-shipping-addresses';
import { CreateShippingAddressData } from '@/lib/services/shipping-address-service';
import { MapPin, Plus, Edit, Trash2, Check } from 'lucide-react';

interface ShippingAddressSelectorProps {
  selectedAddressId?: string;
  onAddressSelect: (addressId: string | null) => void;
  onAddressChange?: (address: any) => void;
  showAddNew?: boolean;
  className?: string;
}

export function ShippingAddressSelector({
  selectedAddressId,
  onAddressSelect,
  onAddressChange,
  showAddNew = true,
  className = '',
}: ShippingAddressSelectorProps) {
  const { addresses, defaultAddress, loading, createAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useShippingAddresses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario para nueva dirección
  const [newAddress, setNewAddress] = useState<CreateShippingAddressData>({
    first_name: '',
    last_name: '',
    phone: '',
    address_line_1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'México',
    is_default: false,
  });

  // Estados para validaciones
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddressSelect = (addressId: string) => {
    onAddressSelect(addressId);
    const selectedAddress = addresses.find((addr) => addr.id === addressId);
    if (selectedAddress && onAddressChange) {
      onAddressChange(selectedAddress);
    }
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setNewAddress({
      first_name: '',
      last_name: '',
      phone: '',
      address_line_1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'México',
      is_default: addresses.length === 0, // Marcar como predeterminada si es la primera
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setNewAddress({
      first_name: address.first_name,
      last_name: address.last_name,
      phone: address.phone || '',
      address_line_1: address.address_line_1,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  // Función de validación
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!newAddress.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    } else if (newAddress.first_name.trim().length < 2) {
      newErrors.first_name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar apellido
    if (!newAddress.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    } else if (newAddress.last_name.trim().length < 2) {
      newErrors.last_name = 'El apellido debe tener al menos 2 caracteres';
    }

    // Validar teléfono (opcional pero si se ingresa debe ser válido)
    if (newAddress.phone && !/^\d{10}$/.test(newAddress.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }

    // Validar dirección
    if (!newAddress.address_line_1.trim()) {
      newErrors.address_line_1 = 'La dirección es requerida';
    } else if (newAddress.address_line_1.trim().length < 5) {
      newErrors.address_line_1 = 'La dirección debe tener al menos 5 caracteres';
    }

    // Validar ciudad
    if (!newAddress.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    } else if (newAddress.city.trim().length < 2) {
      newErrors.city = 'La ciudad debe tener al menos 2 caracteres';
    }

    // Validar estado
    if (!newAddress.state.trim()) {
      newErrors.state = 'El estado es requerido';
    } else if (newAddress.state.trim().length < 2) {
      newErrors.state = 'El estado debe tener al menos 2 caracteres';
    }

    // Validar código postal
    if (!newAddress.postal_code.trim()) {
      newErrors.postal_code = 'El código postal es requerido';
    } else if (!/^\d{5}$/.test(newAddress.postal_code.trim())) {
      newErrors.postal_code = 'El código postal debe tener exactamente 5 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingAddress) {
        await updateAddress({
          id: editingAddress.id,
          ...newAddress,
        });
      } else {
        const createdAddress = await createAddress(newAddress);
        // Seleccionar automáticamente la nueva dirección
        handleAddressSelect(createdAddress.id);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error guardando dirección:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      try {
        await deleteAddress(addressId);
        // Si la dirección eliminada era la seleccionada, deseleccionar
        if (selectedAddressId === addressId) {
          onAddressSelect(null);
        }
      } catch (error) {
        console.error('Error eliminando dirección:', error);
      }
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId);
    } catch (error) {
      console.error('Error estableciendo dirección predeterminada:', error);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-20 rounded bg-gray-200"></div>
            <div className="h-20 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dirección de Envío</h3>
        {showAddNew && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddNewAddress}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Nueva
          </Button>
        )}
      </div>

      {addresses.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-6 text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h4 className="mb-2 text-lg font-medium text-gray-900">No tienes direcciones guardadas</h4>
            <p className="mb-4 text-gray-600">Agrega una dirección de envío para continuar con tu compra</p>
            <Button
              onClick={handleAddNewAddress}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Primera Dirección
            </Button>
          </CardContent>
        </Card>
      ) : (
        <RadioGroup
          value={selectedAddressId || ''}
          onValueChange={handleAddressSelect}
          className="space-y-3"
        >
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAddressId === address.id ? 'border-blue-500 ring-2 ring-blue-500' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-start space-x-3">
                    <RadioGroupItem
                      value={address.id}
                      id={address.id}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Label
                          htmlFor={address.id}
                          className="cursor-pointer text-sm font-medium"
                        >
                          {address.first_name} {address.last_name}
                        </Label>
                        {address.is_default && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            Predeterminada
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{address.address_line_1}</p>
                        <p>
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p>{address.country}</p>
                        {address.phone && <p>Tel: {address.phone}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!address.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSetDefault(address.id);
                        }}
                        className="h-8 w-8 p-0"
                        title="Establecer como predeterminada"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditAddress(address);
                      }}
                      className="h-8 w-8 p-0"
                      title="Editar dirección"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteAddress(address.id);
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      title="Eliminar dirección"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      )}

      {/* Dialog para agregar/editar dirección */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Editar Dirección' : 'Agregar Nueva Dirección'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  value={newAddress.first_name}
                  onChange={(e) => setNewAddress({ ...newAddress, first_name: e.target.value })}
                  className={errors.first_name ? 'border-red-500' : ''}
                  required
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>}
              </div>
              <div>
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  value={newAddress.last_name}
                  onChange={(e) => setNewAddress({ ...newAddress, last_name: e.target.value })}
                  className={errors.last_name ? 'border-red-500' : ''}
                  required
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                placeholder="10 dígitos (opcional)"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="address_line_1">Dirección *</Label>
              <Input
                id="address_line_1"
                value={newAddress.address_line_1}
                onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                placeholder="Calle, número, colonia"
                className={errors.address_line_1 ? 'border-red-500' : ''}
                required
              />
              {errors.address_line_1 && <p className="mt-1 text-sm text-red-500">{errors.address_line_1}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className={errors.city ? 'border-red-500' : ''}
                  required
                />
                {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
              </div>
              <div>
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className={errors.state ? 'border-red-500' : ''}
                  required
                />
                {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postal_code">Código Postal *</Label>
                <Input
                  id="postal_code"
                  value={newAddress.postal_code}
                  onChange={(e) => {
                    // Solo permitir números y máximo 5 dígitos
                    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setNewAddress({ ...newAddress, postal_code: value });
                  }}
                  placeholder="5 dígitos"
                  className={errors.postal_code ? 'border-red-500' : ''}
                  required
                />
                {errors.postal_code && <p className="mt-1 text-sm text-red-500">{errors.postal_code}</p>}
              </div>
              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={newAddress.country}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={newAddress.is_default}
                onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_default">Establecer como dirección predeterminada</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : editingAddress ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
