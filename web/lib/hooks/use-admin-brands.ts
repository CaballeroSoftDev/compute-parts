import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminService } from '@/lib/services/admin-service';
import type { AdminBrand, CreateBrandForm, UpdateBrandForm } from '@/lib/types/admin';
import { useAuth } from './use-auth';

interface UseAdminBrandsReturn {
  brands: AdminBrand[];
  loading: boolean;
  error: string | null;
  refreshBrands: () => Promise<void>;
  createBrand: (data: CreateBrandForm) => Promise<AdminBrand>;
  updateBrand: (id: string, data: UpdateBrandForm) => Promise<AdminBrand>;
  deleteBrand: (id: string) => Promise<void>;
  clearError: () => void;
}

export function useAdminBrands(): UseAdminBrandsReturn {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(false); // Cambiado a false para no cargar automáticamente
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { user, profile, loading: authLoading, isAdmin } = useAuth();

  const fetchBrands = useCallback(async () => {
    // Verificar permisos antes de hacer la petición
    if (!user || !isAdmin) {
      console.log('Usuario no autenticado o sin permisos de admin, no se cargan marcas');
      setBrands([]);
      return;
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    try {
      if (!isMountedRef.current) return;

      setLoading(true);
      setError(null);

      // Timeout de 10 segundos para la request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La solicitud tardó demasiado')), 10000);
      });

      const dataPromise = AdminService.getBrands();

      const data = (await Promise.race([dataPromise, timeoutPromise])) as AdminBrand[];

      if (!isMountedRef.current) return;

      setBrands(data);
    } catch (err) {
      if (!isMountedRef.current) return;

      // Ignorar errores de abort
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Error al cargar marcas';
      setError(errorMessage);
      console.error('Error fetching brands:', err);

      // Si es un error de timeout o red, ofrecer reintento automático
      if (errorMessage.includes('Timeout') || errorMessage.includes('fetch')) {
        console.log('Reintentando carga de marcas en 3 segundos...');
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchBrands();
          }
        }, 3000);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, isAdmin]);

  const refreshBrands = useCallback(async () => {
    await fetchBrands();
  }, [fetchBrands]);

  const createBrand = useCallback(
    async (data: CreateBrandForm): Promise<AdminBrand> => {
      if (!user || !isAdmin) {
        throw new Error('No tienes permisos de administrador');
      }
      try {
        setError(null); // Resetear error antes de la operación
        const newBrand = await AdminService.createBrand(data);
        await refreshBrands();
        return newBrand;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear marca';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [refreshBrands, user, isAdmin]
  );

  const updateBrand = useCallback(
    async (id: string, data: UpdateBrandForm): Promise<AdminBrand> => {
      if (!user || !isAdmin) {
        throw new Error('No tienes permisos de administrador');
      }
      try {
        setError(null); // Resetear error antes de la operación
        const updatedBrand = await AdminService.updateBrand(id, data);
        await refreshBrands();
        return updatedBrand;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar marca';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [refreshBrands, user, isAdmin]
  );

  const deleteBrand = useCallback(
    async (id: string): Promise<void> => {
      if (!user || !isAdmin) {
        throw new Error('No tienes permisos de administrador');
      }
      try {
        setError(null); // Resetear error antes de la operación
        await AdminService.deleteBrand(id);
        await refreshBrands();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar marca';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [refreshBrands, user, isAdmin]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Solo cargar marcas si el usuario está autenticado, es admin y no está cargando
    if (user && isAdmin && !authLoading) {
      fetchBrands();
    } else if (!user && !authLoading) {
      // Limpiar marcas si el usuario no está autenticado
      setBrands([]);
      setError(null);
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, isAdmin, authLoading, fetchBrands]);

  return {
    brands,
    loading: loading || authLoading,
    error,
    refreshBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    clearError,
  };
}
