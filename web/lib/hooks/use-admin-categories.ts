import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminService } from '@/lib/services/admin-service';
import type { AdminCategory, CreateCategoryForm, UpdateCategoryForm } from '@/lib/types/admin';

interface UseAdminCategoriesReturn {
  categories: AdminCategory[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryForm, imageFile?: File) => Promise<AdminCategory>;
  updateCategory: (id: string, data: UpdateCategoryForm, imageFile?: File) => Promise<AdminCategory>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export function useAdminCategories(): UseAdminCategoriesReturn {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCategories = useCallback(async () => {
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

      const dataPromise = AdminService.getCategories();

      const data = (await Promise.race([dataPromise, timeoutPromise])) as AdminCategory[];

      if (!isMountedRef.current) return;

      setCategories(data);
    } catch (err) {
      if (!isMountedRef.current) return;

      // Ignorar errores de abort
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Error al cargar categorías';
      setError(errorMessage);
      console.error('Error fetching categories:', err);

      // Si es un error de timeout o red, ofrecer reintento automático
      if (errorMessage.includes('Timeout') || errorMessage.includes('fetch')) {
        console.log('Reintentando carga de categorías en 3 segundos...');
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchCategories();
          }
        }, 3000);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(
    async (data: CreateCategoryForm, imageFile?: File): Promise<AdminCategory> => {
      try {
        setError(null); // Resetear error antes de la operación
        const newCategory = await AdminService.createCategory(data, imageFile);
        await refreshCategories();
        return newCategory;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear categoría';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [refreshCategories]
  );

  const updateCategory = useCallback(
    async (id: string, data: UpdateCategoryForm, imageFile?: File): Promise<AdminCategory> => {
      try {
        setError(null); // Resetear error antes de la operación
        const updatedCategory = await AdminService.updateCategory(id, data, imageFile);
        await refreshCategories();
        return updatedCategory;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar categoría';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [refreshCategories]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null); // Resetear error antes de la operación
        await AdminService.deleteCategory(id);
        await refreshCategories();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [refreshCategories]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchCategories();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Dependencias vacías para evitar loops infinitos

  return {
    categories,
    loading,
    error,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  };
}
