import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  ShippingAddressService,
  ShippingAddress,
  CreateShippingAddressData,
  UpdateShippingAddressData,
} from '@/lib/services/shipping-address-service';
import { useAuth } from '@/lib/hooks/use-auth';

interface UseShippingAddressesReturn {
  addresses: ShippingAddress[];
  defaultAddress: ShippingAddress | null;
  loading: boolean;
  error: string | null;
  hasAddresses: boolean;
  createAddress: (addressData: CreateShippingAddressData) => Promise<ShippingAddress>;
  updateAddress: (addressData: UpdateShippingAddressData) => Promise<ShippingAddress>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  refreshAddresses: () => Promise<void>;
  clearError: () => void;
}

export function useShippingAddresses(): UseShippingAddressesReturn {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<ShippingAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAddresses, setHasAddresses] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const loadAddresses = useCallback(async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      setError(null);

      const [addressesData, defaultAddressData] = await Promise.all([
        ShippingAddressService.getShippingAddresses(),
        ShippingAddressService.getDefaultAddress(),
      ]);

      setAddresses(addressesData);
      setDefaultAddress(defaultAddressData);
      setHasAddresses(addressesData.length > 0);
    } catch (error) {
      console.error('Error cargando direcciones:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar direcciones');
      setAddresses([]);
      setDefaultAddress(null);
      setHasAddresses(false);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  const createAddress = useCallback(
    async (addressData: CreateShippingAddressData): Promise<ShippingAddress> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      try {
        setError(null);

        // Validar datos de dirección
        const validation = ShippingAddressService.validateAddressData(addressData);
        if (!validation.isValid) {
          throw new Error(`Datos de dirección inválidos: ${validation.errors.join(', ')}`);
        }

        const newAddress = await ShippingAddressService.createShippingAddress(addressData);

        // Recargar direcciones
        await loadAddresses();

        toast({
          title: 'Dirección creada',
          description: 'La dirección de envío se ha creado exitosamente',
        });

        return newAddress;
      } catch (error) {
        console.error('Error creando dirección:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al crear la dirección';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw error;
      }
    },
    [user, loadAddresses, toast]
  );

  const updateAddress = useCallback(
    async (addressData: UpdateShippingAddressData): Promise<ShippingAddress> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      try {
        setError(null);

        const updatedAddress = await ShippingAddressService.updateShippingAddress(addressData);

        // Recargar direcciones
        await loadAddresses();

        toast({
          title: 'Dirección actualizada',
          description: 'La dirección de envío se ha actualizado exitosamente',
        });

        return updatedAddress;
      } catch (error) {
        console.error('Error actualizando dirección:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la dirección';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw error;
      }
    },
    [user, loadAddresses, toast]
  );

  const deleteAddress = useCallback(
    async (addressId: string): Promise<void> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      try {
        setError(null);

        await ShippingAddressService.deleteShippingAddress(addressId);

        // Recargar direcciones
        await loadAddresses();

        toast({
          title: 'Dirección eliminada',
          description: 'La dirección de envío se ha eliminado exitosamente',
        });
      } catch (error) {
        console.error('Error eliminando dirección:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la dirección';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw error;
      }
    },
    [user, loadAddresses, toast]
  );

  const setDefaultAddressHandler = useCallback(
    async (addressId: string): Promise<void> => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      try {
        setError(null);

        await ShippingAddressService.setDefaultAddress(addressId);

        // Recargar direcciones
        await loadAddresses();

        toast({
          title: 'Dirección predeterminada',
          description: 'La dirección se ha establecido como predeterminada',
        });
      } catch (error) {
        console.error('Error estableciendo dirección predeterminada:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al establecer la dirección predeterminada';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw error;
      }
    },
    [user, loadAddresses, toast]
  );

  const refreshAddresses = useCallback(async () => {
    await loadAddresses();
  }, [loadAddresses]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar direcciones cuando el usuario cambie
  useEffect(() => {
    if (user && !authLoading) {
      loadAddresses();
    } else if (!user && !authLoading) {
      // Limpiar datos si no hay usuario
      setAddresses([]);
      setDefaultAddress(null);
      setHasAddresses(false);
      setError(null);
    }
  }, [user, authLoading, loadAddresses]);

  return {
    addresses,
    defaultAddress,
    loading,
    error,
    hasAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress: setDefaultAddressHandler,
    refreshAddresses,
    clearError,
  };
}
