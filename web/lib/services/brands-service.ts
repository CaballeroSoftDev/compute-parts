import { supabase } from '@/lib/supabase';

export interface Brand {
  id: string;
  name: string;
  description: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Servicio para manejar las marcas
 */
export class BrandsService {
  /**
   * Obtiene todas las marcas activas con conteo de productos
   */
  static async getBrands(): Promise<Brand[]> {
    try {
      const { data: brands, error } = await supabase
        .from('brands')
        .select(
          `
					id,
					name,
					description,
					website,
					logo_url,
					is_active,
					created_at,
					updated_at
				`
        )
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching brands:', error);
        return [];
      }

      // Obtener el conteo de productos para cada marca
      const brandsWithCount = await Promise.all(
        brands.map(async (brand) => {
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', brand.id)
            .eq('is_active', true);

          if (countError) {
            console.error(`Error counting products for brand ${brand.name}:`, countError);
            return {
              ...brand,
              product_count: 0,
            };
          }

          return {
            ...brand,
            product_count: count || 0,
          };
        })
      );

      return brandsWithCount;
    } catch (error) {
      console.error('Error in getBrands:', error);
      return [];
    }
  }

  /**
   * Obtiene una marca específica por ID
   */
  static async getBrandById(brandId: string): Promise<Brand | null> {
    try {
      const { data: brand, error } = await supabase
        .from('brands')
        .select(
          `
					id,
					name,
					description,
					website,
					logo_url,
					is_active,
					created_at,
					updated_at
				`
        )
        .eq('id', brandId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching brand:', error);
        return null;
      }

      // Obtener el conteo de productos
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .eq('is_active', true);

      if (countError) {
        console.error('Error counting products for brand:', countError);
      }

      return {
        ...brand,
        product_count: count || 0,
      };
    } catch (error) {
      console.error('Error in getBrandById:', error);
      return null;
    }
  }

  /**
   * Obtiene las marcas destacadas (con más productos)
   */
  static async getFeaturedBrands(limit: number = 6): Promise<Brand[]> {
    try {
      const brands = await this.getBrands();

      // Ordenar por número de productos y tomar las primeras
      return brands.sort((a, b) => b.product_count - a.product_count).slice(0, limit);
    } catch (error) {
      console.error('Error in getFeaturedBrands:', error);
      return [];
    }
  }

  /**
   * Busca marcas por término
   */
  static async searchBrands(term: string): Promise<Brand[]> {
    try {
      const { data: brands, error } = await supabase
        .from('brands')
        .select(
          `
					id,
					name,
					description,
					website,
					logo_url,
					is_active,
					created_at,
					updated_at
				`
        )
        .eq('is_active', true)
        .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error searching brands:', error);
        return [];
      }

      // Obtener el conteo de productos para cada marca
      const brandsWithCount = await Promise.all(
        brands.map(async (brand) => {
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', brand.id)
            .eq('is_active', true);

          if (countError) {
            console.error(`Error counting products for brand ${brand.name}:`, countError);
            return {
              ...brand,
              product_count: 0,
            };
          }

          return {
            ...brand,
            product_count: count || 0,
          };
        })
      );

      return brandsWithCount;
    } catch (error) {
      console.error('Error in searchBrands:', error);
      return [];
    }
  }

  /**
   * Valida que una URL de imagen sea válida
   */
  static isValidImageUrl(url: string): boolean {
    if (!url) return false;
    if (url.startsWith('blob:')) return false;
    if (url === '/placeholder.svg') return true;

    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('supabase');
    } catch {
      return false;
    }
  }

  /**
   * Corrige la URL de una imagen si es necesario
   */
  static getValidImageUrl(url: string | null): string {
    if (!url || !this.isValidImageUrl(url)) {
      return '/placeholder.svg';
    }
    return url;
  }
}
