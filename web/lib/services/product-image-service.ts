import { supabase } from '@/lib/supabase';
import type { ProductImageForm } from '@/lib/types/admin';

export interface ProductImageData {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number | null;
  is_primary: boolean;
  created_at: string;
}

export class ProductImageService {
  // Obtener imágenes de un producto
  static async getProductImages(productId: string): Promise<ProductImageData[]> {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching product images:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProductImages:', error);
      return [];
    }
  }

  // Crear imagen de producto
  static async createProductImage(
    imageData: Omit<ProductImageData, 'id' | 'created_at'>
  ): Promise<ProductImageData | null> {
    try {
      const { data, error } = await supabase.from('product_images').insert([imageData]).select().single();

      if (error) {
        console.error('Error creating product image:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createProductImage:', error);
      return null;
    }
  }

  // Crear múltiples imágenes de producto
  static async createProductImages(images: Omit<ProductImageData, 'id' | 'created_at'>[]): Promise<ProductImageData[]> {
    try {
      const { data, error } = await supabase.from('product_images').insert(images).select();

      if (error) {
        console.error('Error creating product images:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in createProductImages:', error);
      return [];
    }
  }

  // Actualizar imagen de producto
  static async updateProductImage(id: string, updates: Partial<ProductImageData>): Promise<ProductImageData | null> {
    try {
      const { data, error } = await supabase.from('product_images').update(updates).eq('id', id).select().single();

      if (error) {
        console.error('Error updating product image:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProductImage:', error);
      return null;
    }
  }

  // Eliminar imagen de producto
  static async deleteProductImage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('product_images').delete().eq('id', id);

      if (error) {
        console.error('Error deleting product image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProductImage:', error);
      return false;
    }
  }

  // Eliminar múltiples imágenes de producto
  static async deleteProductImages(ids: string[]): Promise<{ success: boolean; deleted: number; errors: string[] }> {
    const errors: string[] = [];
    let deleted = 0;

    for (const id of ids) {
      try {
        const { error } = await supabase.from('product_images').delete().eq('id', id);

        if (error) {
          console.error('Error deleting product image:', error);
          errors.push(`Error deleting image ${id}: ${error.message}`);
        } else {
          deleted++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error deleting image';
        errors.push(`Error deleting image ${id}: ${errorMessage}`);
      }
    }

    return {
      success: deleted > 0,
      deleted,
      errors,
    };
  }

  // Establecer imagen principal
  static async setPrimaryImage(productId: string, imageId: string): Promise<boolean> {
    try {
      // Primero, quitar la imagen principal actual
      const { error: updateError } = await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
        .eq('is_primary', true);

      if (updateError) {
        console.error('Error updating existing primary image:', updateError);
      }

      // Luego, establecer la nueva imagen principal
      const { error } = await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId);

      if (error) {
        console.error('Error setting primary image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in setPrimaryImage:', error);
      return false;
    }
  }

  // Reordenar imágenes
  static async reorderImages(images: { id: string; sort_order: number }[]): Promise<boolean> {
    try {
      const updates = images.map(({ id, sort_order }) => ({
        id,
        sort_order,
      }));

      const { error } = await supabase.from('product_images').upsert(updates, { onConflict: 'id' });

      if (error) {
        console.error('Error reordering images:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in reorderImages:', error);
      return false;
    }
  }

  // Sincronizar imágenes de producto (crear, actualizar, eliminar)
  static async syncProductImages(
    productId: string,
    images: ProductImageForm[]
  ): Promise<{
    success: boolean;
    created: number;
    updated: number;
    deleted: number;
    errors: string[];
  }> {
    try {
      // Obtener imágenes existentes
      const existingImages = await this.getProductImages(productId);
      const existingImageIds = new Set(existingImages.map((img) => img.id));
      const newImageIds = new Set(images.filter((img) => img.id).map((img) => img.id!));

      // Identificar imágenes a eliminar
      const imagesToDelete = existingImages.filter((img) => !newImageIds.has(img.id));
      const deletedIds = imagesToDelete.map((img) => img.id);

      // Eliminar imágenes
      let deleted = 0;
      if (deletedIds.length > 0) {
        const deleteResult = await this.deleteProductImages(deletedIds);
        deleted = deleteResult.deleted;
      }

      // Procesar nuevas imágenes
      let created = 0;
      let updated = 0;
      const errors: string[] = [];

      for (const image of images) {
        if (image.id && existingImageIds.has(image.id)) {
          // Actualizar imagen existente
          const result = await this.updateProductImage(image.id, {
            image_url: image.url,
            alt_text: image.alt_text || null,
            is_primary: image.is_primary || false,
            sort_order: image.sort_order || 0,
          });
          if (result) {
            updated++;
          } else {
            errors.push(`Error updating image ${image.id}`);
          }
        } else {
          // Crear nueva imagen
          const result = await this.createProductImage({
            product_id: productId,
            image_url: image.url,
            alt_text: image.alt_text || null,
            is_primary: image.is_primary || false,
            sort_order: image.sort_order || 0,
          });
          if (result) {
            created++;
          } else {
            errors.push(`Error creating image ${image.url}`);
          }
        }
      }

      return {
        success: errors.length === 0,
        created,
        updated,
        deleted,
        errors,
      };
    } catch (error) {
      console.error('Error in syncProductImages:', error);
      return {
        success: false,
        created: 0,
        updated: 0,
        deleted: 0,
        errors: [error instanceof Error ? error.message : 'Error syncing images'],
      };
    }
  }

  // Obtener imagen principal de un producto
  static async getPrimaryImage(productId: string): Promise<ProductImageData | null> {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .eq('is_primary', true)
        .single();

      if (error) {
        console.error('Error fetching primary image:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getPrimaryImage:', error);
      return null;
    }
  }

  // Verificar si un producto tiene imágenes
  static async hasImages(productId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('product_images')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (error) {
        console.error('Error checking product images:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Error in hasImages:', error);
      return false;
    }
  }
}
