import { supabase } from '@/lib/supabase';
import type { CatalogProduct } from '@/lib/interfaces/catalog';

/**
 * Servicio para manejar los favoritos de los usuarios
 */
export class FavoritesService {
  /**
   * Obtiene los favoritos del usuario actual
   */
  static async getUserFavorites(): Promise<CatalogProduct[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data: favorites, error } = await supabase
        .from('favorites')
        .select(
          `
					product_id,
					products (
						id,
						name,
						price,
						brand:brands(name),
						category:categories(name),
						images:product_images(
							image_url,
							is_primary
						)
					)
				`
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user favorites:', error);
        return [];
      }

      // Transformar los datos al formato CatalogProduct
      return favorites
        .filter((fav) => fav.products) // Filtrar productos que existan
        .map((fav) => {
          const product = fav.products;
          // Obtener la imagen primaria o la primera imagen disponible
          const primaryImage = product.images?.find((img) => img.is_primary);
          const firstImage = product.images?.[0];
          const imageUrl = primaryImage?.image_url || firstImage?.image_url || '/placeholder.svg';

          return {
            id: product.id,
            name: product.name,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
            brand: product.brand?.name || 'Sin marca',
            category: product.category?.name || 'Sin categoría',
            image: this.getValidImageUrl(imageUrl),
          };
        });
    } catch (error) {
      console.error('Error in getUserFavorites:', error);
      return [];
    }
  }

  /**
   * Agrega un producto a favoritos
   */
  static async addToFavorites(productId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuario no autenticado');
        return false;
      }

      // Verificar si ya existe en favoritos
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        console.log('Producto ya está en favoritos');
        return true;
      }

      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        product_id: productId,
      });

      if (error) {
        console.error('Error adding to favorites:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addToFavorites:', error);
      return false;
    }
  }

  /**
   * Remueve un producto de favoritos
   */
  static async removeFromFavorites(productId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuario no autenticado');
        return false;
      }

      const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId);

      if (error) {
        console.error('Error removing from favorites:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeFromFavorites:', error);
      return false;
    }
  }

  /**
   * Verifica si un producto está en favoritos
   */
  static async isFavorite(productId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error checking favorite status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isFavorite:', error);
      return false;
    }
  }

  /**
   * Limpia todos los favoritos del usuario
   */
  static async clearFavorites(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuario no autenticado');
        return false;
      }

      const { error } = await supabase.from('favorites').delete().eq('user_id', user.id);

      if (error) {
        console.error('Error clearing favorites:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearFavorites:', error);
      return false;
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
