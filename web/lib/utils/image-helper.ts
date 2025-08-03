import { supabase } from '@/lib/supabase';

/**
 * Helper para manejar imágenes en Supabase Storage
 */
export class ImageHelper {
	private static readonly PRODUCT_IMAGES_BUCKET = 'product-images';
	private static readonly DEFAULT_IMAGE = '/placeholder.svg';

	/**
	 * Obtiene la URL pública de una imagen desde Supabase Storage
	 */
	static getPublicUrl(filePath: string, bucket = this.PRODUCT_IMAGES_BUCKET): string {
		try {
			const { data } = supabase.storage
				.from(bucket)
				.getPublicUrl(filePath);

			return data.publicUrl;
		} catch (error) {
			console.error('Error getting public URL:', error);
			return this.DEFAULT_IMAGE;
		}
	}

	/**
	 * Valida si una URL de imagen es válida
	 */
	static isValidImageUrl(url: string | null): boolean {
		if (!url) return false;
		if (url === this.DEFAULT_IMAGE) return true;
		if (url.startsWith('blob:')) return false;
		
		try {
			const urlObj = new URL(url);
			return urlObj.hostname.includes('supabase') || urlObj.hostname.includes('localhost');
		} catch {
			return false;
		}
	}

	/**
	 * Corrige una URL de imagen si es necesario
	 */
	static getValidImageUrl(url: string | null): string {
		if (!url || !this.isValidImageUrl(url)) {
			return this.DEFAULT_IMAGE;
		}
		return url;
	}

	/**
	 * Elimina un archivo de Supabase Storage
	 */
	static async deleteFile(filePath: string, bucket = this.PRODUCT_IMAGES_BUCKET): Promise<boolean> {
		try {
			const { error } = await supabase.storage
				.from(bucket)
				.remove([filePath]);

			if (error) {
				console.error('Error deleting file:', error);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error in deleteFile:', error);
			return false;
		}
	}

	/**
	 * Lista archivos en una carpeta específica
	 */
	static async listFiles(folder: string, bucket = this.PRODUCT_IMAGES_BUCKET): Promise<string[]> {
		try {
			const { data, error } = await supabase.storage
				.from(bucket)
				.list(folder, {
					limit: 100,
				});

			if (error) {
				console.error('Error listing files:', error);
				return [];
			}

			return data?.map(file => `${folder}/${file.name}`) || [];
		} catch (error) {
			console.error('Error in listFiles:', error);
			return [];
		}
	}

	/**
	 * Verifica si un archivo existe en Supabase Storage
	 */
	static async fileExists(filePath: string, bucket = this.PRODUCT_IMAGES_BUCKET): Promise<boolean> {
		try {
			const { data, error } = await supabase.storage
				.from(bucket)
				.list(filePath.split('/').slice(0, -1).join('/'));

			if (error) {
				return false;
			}

			const fileName = filePath.split('/').pop();
			return data?.some(file => file.name === fileName) || false;
		} catch (error) {
			console.error('Error checking file existence:', error);
			return false;
		}
	}
}