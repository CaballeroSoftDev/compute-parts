import { supabase } from '@/lib/supabase';

/**
 * Servicio para manejar la subida de logos de marcas
 */
export class BrandLogoService {
  private static readonly BUCKET_NAME = 'brand-logos';

  /**
   * Sube un logo de marca al bucket de Supabase Storage
   */
  static async uploadBrandLogo(file: File, brandId: string): Promise<string> {
    try {
      // Validar el archivo
      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten: JPEG, PNG, WebP, SVG');
      }

      // Validar tamaño del archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB');
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}-${brandId}.${fileExtension}`;

      // Subir archivo al bucket
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        console.error('Error uploading brand logo:', error);
        throw new Error('Error al subir el logo de la marca');
      }

      // Obtener la URL pública del archivo
      const { data: urlData } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadBrandLogo:', error);
      throw error;
    }
  }

  /**
   * Elimina un logo de marca del bucket
   */
  static async deleteBrandLogo(logoUrl: string): Promise<boolean> {
    try {
      if (!logoUrl) {
        return true; // No hay logo para eliminar
      }

      // Extraer el nombre del archivo de la URL
      const fileName = this.extractFileNameFromUrl(logoUrl);
      if (!fileName) {
        console.warn('No se pudo extraer el nombre del archivo de la URL:', logoUrl);
        return false;
      }

      // Eliminar archivo del bucket
      const { error } = await supabase.storage.from(this.BUCKET_NAME).remove([fileName]);

      if (error) {
        console.error('Error deleting brand logo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteBrandLogo:', error);
      return false;
    }
  }

  /**
   * Actualiza el logo de una marca (elimina el anterior y sube el nuevo)
   */
  static async updateBrandLogo(file: File, brandId: string, existingLogoUrl?: string): Promise<string> {
    try {
      // Eliminar logo anterior si existe
      if (existingLogoUrl) {
        await this.deleteBrandLogo(existingLogoUrl);
      }

      // Subir nuevo logo
      return await this.uploadBrandLogo(file, brandId);
    } catch (error) {
      console.error('Error in updateBrandLogo:', error);
      throw error;
    }
  }

  /**
   * Extrae el nombre del archivo de una URL de Supabase Storage
   */
  private static extractFileNameFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Remover parámetros de consulta si existen
      const cleanFileName = fileName.split('?')[0];

      return cleanFileName || null;
    } catch (error) {
      console.warn('Error extracting filename from URL:', error);
      return null;
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
