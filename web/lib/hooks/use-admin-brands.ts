import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminService } from '@/lib/services/admin-service';
import type { AdminBrand, CreateBrandForm, UpdateBrandForm } from '@/lib/types/admin';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBrands = useCallback(async () => {
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
  }, []);

  const refreshBrands = useCallback(async () => {
    await fetchBrands();
  }, [fetchBrands]);

  const createBrand = useCallback(
    async (data: CreateBrandForm): Promise<AdminBrand> => {
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
    [refreshBrands]
  );

  const updateBrand = useCallback(
    async (id: string, data: UpdateBrandForm): Promise<AdminBrand> => {
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
    [refreshBrands]
  );

  const deleteBrand = useCallback(
    async (id: string): Promise<void> => {
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
    [refreshBrands]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchBrands();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Dependencias vacías para evitar loops infinitos

  return {
    brands,
    loading,
    error,
    refreshBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    clearError,
  };
}
