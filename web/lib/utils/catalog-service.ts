import { supabase } from '@/lib/supabase';
import type { CatalogProduct } from '@/lib/interfaces/catalog';

/**
 * Servicio para obtener productos del catálogo con imágenes correctas
 */
export class CatalogService {
	/**
	 * Obtiene productos para mostrar en el catálogo con sus imágenes primarias
	 */
	static async getCatalogProducts(): Promise<CatalogProduct[]> {
		try {
			const { data: products, error } = await supabase
				.from('products')
				.select(`
					id,
					name,
					price,
					brand:brands(name),
					category:categories(name),
					images:product_images!inner(
						image_url,
						is_primary
					)
				`)
				.eq('is_active', true)
				.eq('product_images.is_primary', true)
				.order('created_at', { ascending: false });

			if (error) {
				console.error('Error fetching catalog products:', error);
				return [];
			}

			// Transformar los datos al formato CatalogProduct
			return products.map(product => ({
				id: product.id,
				name: product.name,
				price: parseFloat(product.price.toString()),
				brand: product.brand?.name || 'Sin marca',
				category: product.category?.name || 'Sin categoría',
				image: product.images?.[0]?.image_url || '/placeholder.svg',
			}));
		} catch (error) {
			console.error('Error in getCatalogProducts:', error);
			return [];
		}
	}

	/**
	 * Busca productos por término
	 */
	static async searchProducts(term: string): Promise<CatalogProduct[]> {
		if (!term.trim()) {
			return this.getCatalogProducts();
		}

		try {
			const { data: products, error } = await supabase
				.from('products')
				.select(`
					id,
					name,
					price,
					brand:brands(name),
					category:categories(name),
					images:product_images!inner(
						image_url,
						is_primary
					)
				`)
				.eq('is_active', true)
				.eq('product_images.is_primary', true)
				.or(`name.ilike.%${term}%,description.ilike.%${term}%`)
				.order('created_at', { ascending: false });

			if (error) {
				console.error('Error searching products:', error);
				return [];
			}

			return products.map(product => ({
				id: product.id,
				name: product.name,
				price: parseFloat(product.price.toString()),
				brand: product.brand?.name || 'Sin marca',
				category: product.category?.name || 'Sin categoría',
				image: product.images?.[0]?.image_url || '/placeholder.svg',
			}));
		} catch (error) {
			console.error('Error in searchProducts:', error);
			return [];
		}
	}

	/**
	 * Obtiene productos por categoría
	 */
	static async getProductsByCategory(categoryId: string): Promise<CatalogProduct[]> {
		try {
			const { data: products, error } = await supabase
				.from('products')
				.select(`
					id,
					name,
					price,
					brand:brands(name),
					category:categories(name),
					images:product_images!inner(
						image_url,
						is_primary
					)
				`)
				.eq('is_active', true)
				.eq('category_id', categoryId)
				.eq('product_images.is_primary', true)
				.order('created_at', { ascending: false });

			if (error) {
				console.error('Error fetching products by category:', error);
				return [];
			}

			return products.map(product => ({
				id: product.id,
				name: product.name,
				price: parseFloat(product.price.toString()),
				brand: product.brand?.name || 'Sin marca',
				category: product.category?.name || 'Sin categoría',
				image: product.images?.[0]?.image_url || '/placeholder.svg',
			}));
		} catch (error) {
			console.error('Error in getProductsByCategory:', error);
			return [];
		}
	}

	/**
	 * Obtiene productos por marca
	 */
	static async getProductsByBrand(brandId: string): Promise<CatalogProduct[]> {
		try {
			const { data: products, error } = await supabase
				.from('products')
				.select(`
					id,
					name,
					price,
					brand:brands(name),
					category:categories(name),
					images:product_images!inner(
						image_url,
						is_primary
					)
				`)
				.eq('is_active', true)
				.eq('brand_id', brandId)
				.eq('product_images.is_primary', true)
				.order('created_at', { ascending: false });

			if (error) {
				console.error('Error fetching products by brand:', error);
				return [];
			}

			return products.map(product => ({
				id: product.id,
				name: product.name,
				price: parseFloat(product.price.toString()),
				brand: product.brand?.name || 'Sin marca',
				category: product.category?.name || 'Sin categoría',
				image: product.images?.[0]?.image_url || '/placeholder.svg',
			}));
		} catch (error) {
			console.error('Error in getProductsByBrand:', error);
			return [];
		}
	}

	/**
	 * Valida que una URL de imagen sea válida (no sea blob)
	 */
	static isValidImageUrl(url: string): boolean {
		if (!url) return false;
		if (url.startsWith('blob:')) return false;
		if (url === '/placeholder.svg') return true;
		
		// Validar que sea una URL de Supabase Storage válida
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