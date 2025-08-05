import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminService } from '@/lib/services/admin-service';
import type { AdminProduct, AdminFilters, CreateProductForm, UpdateProductForm } from '@/lib/types/admin';
import { useAuth } from './use-auth';

interface UseAdminProductsReturn {
  products: AdminProduct[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  filters: AdminFilters;
  refreshProducts: () => Promise<void>;
  setFilters: (filters: AdminFilters) => void;
  setPage: (page: number) => void;
  createProduct: (data: CreateProductForm) => Promise<AdminProduct>;
  updateProduct: (id: string, data: UpdateProductForm) => Promise<AdminProduct>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStock: (id: string, quantity: number) => Promise<AdminProduct>;
  getLowStockProducts: () => Promise<AdminProduct[]>;
  getOutOfStockProducts: () => Promise<AdminProduct[]>;
  clearError: () => void;
}

export function useAdminProducts(): UseAdminProductsReturn {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(false); // Cambiado a false para no cargar automáticamente
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const [filters, setFiltersState] = useState<AdminFilters>({});
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { user, profile, loading: authLoading, isAdmin } = useAuth();

  const fetchProducts = useCallback(async () => {
    // Verificar permisos antes de hacer la petición
    if (!user || !isAdmin) {
      console.log('Usuario no autenticado o sin permisos de admin, no se cargan productos');
      setProducts([]);
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

      const dataPromise = AdminService.getProducts(filters, pagination.page, pagination.limit);

      const response = (await Promise.race([dataPromise, timeoutPromise])) as Awaited<
        ReturnType<typeof AdminService.getProducts>
      >;

      if (!isMountedRef.current) return;

      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      if (!isMountedRef.current) return;

      // Ignorar errores de abort
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(errorMessage);
      console.error('Error fetching products:', err);

      // Si es un error de timeout o red, ofrecer reintento automático
      if (errorMessage.includes('Timeout') || errorMessage.includes('fetch')) {
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchProducts();
          }
        }, 3000);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters, pagination.page, pagination.limit, user, isAdmin]);

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  const createProduct = useCallback(
    async (data: CreateProductForm): Promise<AdminProduct> => {
      if (!user || !isAdmin) {
        throw new Error('No tienes permisos de administrador');
      }
      try {
        setError(null);
        const newProduct = await AdminService.createProduct(data);
        await refreshProducts();
        return newProduct;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear producto';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [refreshProducts, user, isAdmin]
  );

  const updateProduct = useCallback(
    async (id: string, data: UpdateProductForm): Promise<AdminProduct> => {
      if (!user || !isAdmin) {
        throw new Error('No tienes permisos de administrador');
      }
      try {
        setError(null);
        const updatedProduct = await AdminService.updateProduct(id, data);
        await refreshProducts();
        return updatedProduct;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar producto';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [refreshProducts, user, isAdmin]
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<void> => {
      if (!user || !isAdmin) {
        throw new Error('No tienes permisos de administrador');
      }
      try {
        setError(null);
        await AdminService.deleteProduct(id);
        await refreshProducts();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar producto';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [refreshProducts, user, isAdmin]
  );

  const updateProductStock = useCallback(
    async (id: string, quantity: number): Promise<AdminProduct> => {
      if (!user || !isAdmin) {
        throw new Error('No tienes permisos de administrador');
      }
      try {
        setError(null);
        const updatedProduct = await AdminService.updateProductStock(id, quantity);
        await refreshProducts();
        return updatedProduct;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar stock';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [refreshProducts, user, isAdmin]
  );

  const getLowStockProducts = useCallback(async (): Promise<AdminProduct[]> => {
    if (!user || !isAdmin) {
      throw new Error('No tienes permisos de administrador');
    }
    try {
      setError(null);
      return await AdminService.getLowStockProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener productos con stock bajo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user, isAdmin]);

  const getOutOfStockProducts = useCallback(async (): Promise<AdminProduct[]> => {
    if (!user || !isAdmin) {
      throw new Error('No tienes permisos de administrador');
    }
    try {
      setError(null);
      return await AdminService.getOutOfStockProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener productos agotados';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user, isAdmin]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setFilters = useCallback((newFilters: AdminFilters) => {
    setFiltersState(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when filters change
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Solo cargar productos si el usuario está autenticado, es admin y no está cargando
    if (user && isAdmin && !authLoading) {
      fetchProducts();
    } else if (!user && !authLoading) {
      // Limpiar productos si el usuario no está autenticado
      setProducts([]);
      setError(null);
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, isAdmin, authLoading, fetchProducts]);

  return {
    products,
    loading: loading || authLoading,
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
  };
}
