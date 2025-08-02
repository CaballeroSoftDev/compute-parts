import { supabase } from '@/lib/supabase';

export interface UploadResult {
	url: string;
	path: string;
	error?: string;
}

export interface UploadOptions {
	bucket?: string;
	folder?: string;
	fileName?: string;
	contentType?: string;
	cacheControl?: string;
	upsert?: boolean;
}

export class UploadService {
	// Configuración de buckets específicos de tu proyecto
	private static readonly BUCKETS = {
		PRODUCT_IMAGES: 'product-images',
		USER_AVATARS: 'user-avatars',
		BRAND_LOGOS: 'brand-logos',
		CATEGORY_IMAGES: 'category-images',
	} as const;

	private static readonly DEFAULT_CACHE_CONTROL = '3600';
	private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
	private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

	// Verificar permisos de administrador antes de subir
	private static async checkAdminPermissions(): Promise<boolean> {
		try {
			const { data: { user }, error } = await supabase.auth.getUser();
			if (error || !user) {
				return false;
			}

			// Verificar el rol del usuario
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('role')
				.eq('id', user.id)
				.single();

			if (profileError || !profile || !['admin', 'superadmin'].includes(profile.role)) {
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error checking admin permissions:', error);
			return false;
		}
	}

	// Subir imagen para categorías con verificación de permisos
	static async uploadCategoryImage(file: File, options?: UploadOptions): Promise<UploadResult> {
		try {
			// Verificar permisos de administrador
			const hasAdminPermissions = await this.checkAdminPermissions();
			if (!hasAdminPermissions) {
				return { 
					url: '', 
					path: '', 
					error: 'No tienes permisos de administrador para subir imágenes' 
				};
			}

			// Validar archivo
			const validation = this.validateImageFile(file, 'category');
			if (!validation.valid) {
				return { url: '', path: '', error: validation.error };
			}

			const fileExt = file.name.split('.').pop()?.toLowerCase();
			const fileName = options?.fileName || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
			const folder = options?.folder || 'categories';
			const filePath = `${folder}/${fileName}`;

			// Subir archivo a Supabase Storage
			const { data, error } = await supabase.storage
				.from(options?.bucket || this.BUCKETS.CATEGORY_IMAGES)
				.upload(filePath, file, {
					cacheControl: options?.cacheControl || this.DEFAULT_CACHE_CONTROL,
					upsert: options?.upsert || false,
					contentType: options?.contentType || file.type,
				});

			if (error) {
				console.error('Error uploading category image:', error);
				return { url: '', path: '', error: error.message };
			}

			// Obtener URL pública
			const { data: urlData } = supabase.storage
				.from(options?.bucket || this.BUCKETS.CATEGORY_IMAGES)
				.getPublicUrl(filePath);

			return {
				url: urlData.publicUrl,
				path: filePath,
			};
		} catch (error) {
			console.error('Error in uploadCategoryImage:', error);
			return {
				url: '',
				path: '',
				error: error instanceof Error ? error.message : 'Error uploading image',
			};
		}
	}

	// Subir imagen para marcas con verificación de permisos
	static async uploadBrandLogo(file: File, options?: UploadOptions): Promise<UploadResult> {
		try {
			// Verificar permisos de administrador
			const hasAdminPermissions = await this.checkAdminPermissions();
			if (!hasAdminPermissions) {
				return { 
					url: '', 
					path: '', 
					error: 'No tienes permisos de administrador para subir imágenes' 
				};
			}

			// Validar archivo
			const validation = this.validateImageFile(file, 'brand');
			if (!validation.valid) {
				return { url: '', path: '', error: validation.error };
			}

			const fileExt = file.name.split('.').pop()?.toLowerCase();
			const fileName = options?.fileName || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
			const folder = options?.folder || 'brands';
			const filePath = `${folder}/${fileName}`;

			// Subir archivo a Supabase Storage
			const { data, error } = await supabase.storage
				.from(options?.bucket || this.BUCKETS.BRAND_LOGOS)
				.upload(filePath, file, {
					cacheControl: options?.cacheControl || this.DEFAULT_CACHE_CONTROL,
					upsert: options?.upsert || false,
					contentType: options?.contentType || file.type,
				});

			if (error) {
				console.error('Error uploading brand logo:', error);
				return { url: '', path: '', error: error.message };
			}

			// Obtener URL pública
			const { data: urlData } = supabase.storage
				.from(options?.bucket || this.BUCKETS.BRAND_LOGOS)
				.getPublicUrl(filePath);

			return {
				url: urlData.publicUrl,
				path: filePath,
			};
		} catch (error) {
			console.error('Error in uploadBrandLogo:', error);
			return {
				url: '',
				path: '',
				error: error instanceof Error ? error.message : 'Error uploading image',
			};
		}
	}

	// Subir imagen para productos con verificación de permisos
	static async uploadProductImage(file: File, productId: string, options?: UploadOptions): Promise<UploadResult> {
		try {
			// Verificar permisos de administrador
			const hasAdminPermissions = await this.checkAdminPermissions();
			if (!hasAdminPermissions) {
				return { 
					url: '', 
					path: '', 
					error: 'No tienes permisos de administrador para subir imágenes' 
				};
			}

			// Validar archivo
			const validation = this.validateImageFile(file, 'product');
			if (!validation.valid) {
				return { url: '', path: '', error: validation.error };
			}

			const fileExt = file.name.split('.').pop()?.toLowerCase();
			const fileName = options?.fileName || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
			const folder = options?.folder || `products/${productId}`;
			const filePath = `${folder}/${fileName}`;

			// Subir archivo a Supabase Storage
			const { data, error } = await supabase.storage
				.from(options?.bucket || this.BUCKETS.PRODUCT_IMAGES)
				.upload(filePath, file, {
					cacheControl: options?.cacheControl || this.DEFAULT_CACHE_CONTROL,
					upsert: options?.upsert || false,
					contentType: options?.contentType || file.type,
				});

			if (error) {
				console.error('Error uploading product image:', error);
				return { url: '', path: '', error: error.message };
			}

			// Obtener URL pública
			const { data: urlData } = supabase.storage
				.from(options?.bucket || this.BUCKETS.PRODUCT_IMAGES)
				.getPublicUrl(filePath);

			return {
				url: urlData.publicUrl,
				path: filePath,
			};
		} catch (error) {
			console.error('Error in uploadProductImage:', error);
			return {
				url: '',
				path: '',
				error: error instanceof Error ? error.message : 'Error uploading image',
			};
		}
	}

	// Subir avatar de usuario
	static async uploadUserAvatar(file: File, userId: string, options?: UploadOptions): Promise<UploadResult> {
		try {
			// Validar archivo
			const validation = this.validateImageFile(file, 'avatar');
			if (!validation.valid) {
				return { url: '', path: '', error: validation.error };
			}

			const fileExt = file.name.split('.').pop()?.toLowerCase();
			const fileName = options?.fileName || `avatar-${Date.now()}.${fileExt}`;
			const folder = options?.folder || userId;
			const filePath = `${folder}/${fileName}`;

			// Subir archivo a Supabase Storage
			const { data, error } = await supabase.storage
				.from(options?.bucket || this.BUCKETS.USER_AVATARS)
				.upload(filePath, file, {
					cacheControl: options?.cacheControl || this.DEFAULT_CACHE_CONTROL,
					upsert: options?.upsert || true, // Permitir sobrescribir avatar
					contentType: options?.contentType || file.type,
				});

			if (error) {
				console.error('Error uploading user avatar:', error);
				return { url: '', path: '', error: error.message };
			}

			// Obtener URL pública
			const { data: urlData } = supabase.storage
				.from(options?.bucket || this.BUCKETS.USER_AVATARS)
				.getPublicUrl(filePath);

			return {
				url: urlData.publicUrl,
				path: filePath,
			};
		} catch (error) {
			console.error('Error in uploadUserAvatar:', error);
			return {
				url: '',
				path: '',
				error: error instanceof Error ? error.message : 'Error uploading image',
			};
		}
	}

	// Subir imagen genérica
	static async uploadImage(file: File, options?: UploadOptions): Promise<UploadResult> {
		try {
			// Validar archivo
			const validation = this.validateImageFile(file, 'general');
			if (!validation.valid) {
				return { url: '', path: '', error: validation.error };
			}

			const fileExt = file.name.split('.').pop()?.toLowerCase();
			const fileName = options?.fileName || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
			const folder = options?.folder || 'general';
			const filePath = `${folder}/${fileName}`;

			// Subir archivo a Supabase Storage
			const { data, error } = await supabase.storage
				.from(options?.bucket || this.BUCKETS.PRODUCT_IMAGES)
				.upload(filePath, file, {
					cacheControl: options?.cacheControl || this.DEFAULT_CACHE_CONTROL,
					upsert: options?.upsert || false,
					contentType: options?.contentType || file.type,
				});

			if (error) {
				console.error('Error uploading image:', error);
				return { url: '', path: '', error: error.message };
			}

			// Obtener URL pública
			const { data: urlData } = supabase.storage
				.from(options?.bucket || this.BUCKETS.PRODUCT_IMAGES)
				.getPublicUrl(filePath);

			return {
				url: urlData.publicUrl,
				path: filePath,
			};
		} catch (error) {
			console.error('Error in uploadImage:', error);
			return {
				url: '',
				path: '',
				error: error instanceof Error ? error.message : 'Error uploading image',
			};
		}
	}

	// Eliminar imagen
	static async deleteImage(filePath: string, bucket?: string): Promise<{ success: boolean; error?: string }> {
		try {
			const { error } = await supabase.storage
				.from(bucket || this.BUCKETS.PRODUCT_IMAGES)
				.remove([filePath]);

			if (error) {
				console.error('Error deleting image:', error);
				return { success: false, error: error.message };
			}

			return { success: true };
		} catch (error) {
			console.error('Error in deleteImage:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Error deleting image',
			};
		}
	}

	// Obtener URL pública de una imagen
	static getPublicUrl(filePath: string, bucket?: string): string {
		const { data } = supabase.storage
			.from(bucket || this.BUCKETS.PRODUCT_IMAGES)
			.getPublicUrl(filePath);
		return data.publicUrl;
	}

	// Crear URL firmada para acceso temporal
	static async createSignedUrl(filePath: string, expiresIn: number = 3600, bucket?: string): Promise<{ url: string; error?: string }> {
		try {
			const { data, error } = await supabase.storage
				.from(bucket || this.BUCKETS.PRODUCT_IMAGES)
				.createSignedUrl(filePath, expiresIn);

			if (error) {
				console.error('Error creating signed URL:', error);
				return { url: '', error: error.message };
			}

			return { url: data.signedUrl };
		} catch (error) {
			console.error('Error in createSignedUrl:', error);
			return {
				url: '',
				error: error instanceof Error ? error.message : 'Error creating signed URL',
			};
		}
	}

	// Listar archivos en un bucket/folder
	static async listFiles(folder?: string, bucket?: string): Promise<{ files: string[]; error?: string }> {
		try {
			const { data, error } = await supabase.storage
				.from(bucket || this.BUCKETS.PRODUCT_IMAGES)
				.list(folder || '');

			if (error) {
				console.error('Error listing files:', error);
				return { files: [], error: error.message };
			}

			const files = data?.map(item => item.name) || [];
			return { files };
		} catch (error) {
			console.error('Error in listFiles:', error);
			return {
				files: [],
				error: error instanceof Error ? error.message : 'Error listing files',
			};
		}
	}

	// Obtener extensiones válidas desde tipos MIME
	private static getValidExtensions(mimeTypes: string[]): string[] {
		const extensionMap: { [key: string]: string[] } = {
			'image/jpeg': ['jpeg', 'jpg'],
			'image/jpg': ['jpg', 'jpeg'],
			'image/png': ['png'],
			'image/webp': ['webp'],
			'image/gif': ['gif'],
			'image/svg+xml': ['svg']
		};

		const extensions: string[] = [];
		mimeTypes.forEach(mimeType => {
			const exts = extensionMap[mimeType] || [mimeType.split('/')[1]];
			extensions.push(...exts);
		});

		return [...new Set(extensions)]; // Eliminar duplicados
	}

	// Validar archivo de imagen según el tipo
	static validateImageFile(file: File, type: 'category' | 'brand' | 'product' | 'avatar' | 'general' = 'general'): { valid: boolean; error?: string } {
		// Configuración específica por tipo
		const configs = {
			category: { maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] },
			brand: { maxSize: 1 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] },
			product: { maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] },
			avatar: { maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] },
			general: { maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] },
		};

		const config = configs[type];

		// Verificar tamaño
		if (file.size > config.maxSize) {
			return { 
				valid: false, 
				error: `El archivo es demasiado grande. Máximo ${config.maxSize / (1024 * 1024)}MB para ${type}.` 
			};
		}

		// Verificar tipo de archivo
		if (!config.allowedTypes.includes(file.type)) {
			return { 
				valid: false, 
				error: `Tipo de archivo no válido para ${type}. Solo se permiten: ${config.allowedTypes.join(', ')}.` 
			};
		}

		// Verificar extensión
		const fileExt = file.name.split('.').pop()?.toLowerCase();
		const allowedExtensions = this.getValidExtensions(config.allowedTypes);
		if (!fileExt || !allowedExtensions.includes(fileExt)) {
			return { 
				valid: false, 
				error: `Extensión de archivo no válida para ${type}. Solo se permiten: ${allowedExtensions.join(', ')}.` 
			};
		}

		return { valid: true };
	}

	// Optimizar imagen antes de subir (reducir tamaño si es necesario)
	static async optimizeImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080): Promise<File> {
		return new Promise((resolve) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const img = new Image();

			img.onload = () => {
				// Calcular nuevas dimensiones manteniendo aspect ratio
				let { width, height } = img;
				
				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}
				
				if (height > maxHeight) {
					width = (width * maxHeight) / height;
					height = maxHeight;
				}

				canvas.width = width;
				canvas.height = height;

				// Dibujar imagen optimizada
				ctx?.drawImage(img, 0, 0, width, height);

				// Convertir a blob
				canvas.toBlob((blob) => {
					if (blob) {
						const optimizedFile = new File([blob], file.name, {
							type: file.type,
							lastModified: Date.now(),
						});
						resolve(optimizedFile);
					} else {
						resolve(file);
					}
				}, file.type, 0.8); // Calidad 80%
			};

			img.src = URL.createObjectURL(file);
		});
	}

	// Verificar si el bucket existe
	static async checkBucketExists(bucketName: string): Promise<boolean> {
		try {
			const { data, error } = await supabase.storage.getBucket(bucketName);
			return !error && data !== null;
		} catch (error) {
			console.error('Error checking bucket existence:', error);
			return false;
		}
	}

	// Obtener información de los buckets configurados
	static getBucketInfo(type: 'category' | 'brand' | 'product' | 'avatar') {
		const bucketMap = {
			category: this.BUCKETS.CATEGORY_IMAGES,
			brand: this.BUCKETS.BRAND_LOGOS,
			product: this.BUCKETS.PRODUCT_IMAGES,
			avatar: this.BUCKETS.USER_AVATARS,
		};

		const sizeLimits = {
			category: 2 * 1024 * 1024, // 2MB
			brand: 1 * 1024 * 1024,    // 1MB
			product: 5 * 1024 * 1024,  // 5MB
			avatar: 2 * 1024 * 1024,   // 2MB
		};

		return {
			bucket: bucketMap[type],
			maxSize: sizeLimits[type],
			maxSizeMB: sizeLimits[type] / (1024 * 1024),
		};
	}

	// Limpiar archivos huérfanos (para uso administrativo)
	static async cleanupOrphanedFiles(bucket: string, folder?: string): Promise<{ deleted: number; error?: string }> {
		try {
			const { data, error } = await supabase.storage
				.from(bucket)
				.list(folder || '');

			if (error) {
				return { deleted: 0, error: error.message };
			}

			// Aquí podrías implementar lógica para identificar archivos huérfanos
			// Por ahora solo retornamos información
			return { deleted: 0 };
		} catch (error) {
			return { 
				deleted: 0, 
				error: error instanceof Error ? error.message : 'Error cleaning up files' 
			};
		}
	}

	// Subir múltiples imágenes para un producto
	static async uploadProductImages(files: File[], productId: string, options?: UploadOptions): Promise<UploadResult[]> {
		const results: UploadResult[] = [];
		
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			try {
				// Validar archivo
				const validation = this.validateImageFile(file, 'product');
				if (!validation.valid) {
					results.push({ url: '', path: '', error: validation.error });
					continue;
				}

				const fileExt = file.name.split('.').pop()?.toLowerCase();
				const fileName = options?.fileName || `${Date.now()}-${i}-${Math.random().toString(36).substring(2)}.${fileExt}`;
				const folder = options?.folder || `products/${productId}`;
				const filePath = `${folder}/${fileName}`;

				// Subir archivo a Supabase Storage
				const { data, error } = await supabase.storage
					.from(options?.bucket || this.BUCKETS.PRODUCT_IMAGES)
					.upload(filePath, file, {
						cacheControl: options?.cacheControl || this.DEFAULT_CACHE_CONTROL,
						upsert: options?.upsert || false,
						contentType: options?.contentType || file.type,
					});

				if (error) {
					console.error(`Error uploading product image ${i + 1}:`, error);
					results.push({ url: '', path: '', error: error.message });
				} else {
					// Obtener URL pública
					const { data: urlData } = supabase.storage
						.from(options?.bucket || this.BUCKETS.PRODUCT_IMAGES)
						.getPublicUrl(filePath);

					results.push({
						url: urlData.publicUrl,
						path: filePath,
					});
				}
			} catch (error) {
				console.error(`Error in uploadProductImages for file ${i + 1}:`, error);
				results.push({
					url: '',
					path: '',
					error: error instanceof Error ? error.message : 'Error uploading image',
				});
			}
		}

		return results;
	}

	// Subir imagen principal de producto
	static async uploadProductMainImage(file: File, productId: string, options?: UploadOptions): Promise<UploadResult> {
		try {
			// Validar archivo
			const validation = this.validateImageFile(file, 'product');
			if (!validation.valid) {
				return { url: '', path: '', error: validation.error };
			}

			const fileExt = file.name.split('.').pop()?.toLowerCase();
			const fileName = options?.fileName || `main-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
			const folder = options?.folder || `products/${productId}`;
			const filePath = `${folder}/${fileName}`;

			// Subir archivo a Supabase Storage
			const { data, error } = await supabase.storage
				.from(options?.bucket || this.BUCKETS.PRODUCT_IMAGES)
				.upload(filePath, file, {
					cacheControl: options?.cacheControl || this.DEFAULT_CACHE_CONTROL,
					upsert: options?.upsert || true, // Permitir sobrescribir imagen principal
					contentType: options?.contentType || file.type,
				});

			if (error) {
				console.error('Error uploading product main image:', error);
				return { url: '', path: '', error: error.message };
			}

			// Obtener URL pública
			const { data: urlData } = supabase.storage
				.from(options?.bucket || this.BUCKETS.PRODUCT_IMAGES)
				.getPublicUrl(filePath);

			return {
				url: urlData.publicUrl,
				path: filePath,
			};
		} catch (error) {
			console.error('Error in uploadProductMainImage:', error);
			return {
				url: '',
				path: '',
				error: error instanceof Error ? error.message : 'Error uploading image',
			};
		}
	}

	// Eliminar múltiples imágenes
	static async deleteImages(filePaths: string[], bucket?: string): Promise<{ success: boolean; deleted: number; errors: string[] }> {
		const errors: string[] = [];
		let deleted = 0;

		for (const filePath of filePaths) {
			try {
				const { error } = await supabase.storage
					.from(bucket || this.BUCKETS.PRODUCT_IMAGES)
					.remove([filePath]);

				if (error) {
					console.error('Error deleting image:', error);
					errors.push(`Error deleting ${filePath}: ${error.message}`);
				} else {
					deleted++;
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Error deleting image';
				errors.push(`Error deleting ${filePath}: ${errorMessage}`);
			}
		}

		return {
			success: deleted > 0,
			deleted,
			errors,
		};
	}

	// Obtener URLs públicas de múltiples imágenes
	static getPublicUrls(filePaths: string[], bucket?: string): string[] {
		return filePaths.map(filePath => {
			const { data } = supabase.storage
				.from(bucket || this.BUCKETS.PRODUCT_IMAGES)
				.getPublicUrl(filePath);
			return data.publicUrl;
		});
	}

	// Verificar si una imagen existe
	static async imageExists(filePath: string, bucket?: string): Promise<boolean> {
		try {
			const { data, error } = await supabase.storage
				.from(bucket || this.BUCKETS.PRODUCT_IMAGES)
				.list(filePath.split('/').slice(0, -1).join('/'));

			if (error) {
				return false;
			}

			const fileName = filePath.split('/').pop();
			return data?.some(item => item.name === fileName) || false;
		} catch (error) {
			return false;
		}
	}

	// Obtener información de uso del bucket
	static async getBucketUsage(bucket: string): Promise<{ totalFiles: number; totalSize: number; error?: string }> {
		try {
			const { data, error } = await supabase.storage
				.from(bucket)
				.list('', { limit: 1000 });

			if (error) {
				return { totalFiles: 0, totalSize: 0, error: error.message };
			}

			const totalFiles = data?.length || 0;
			const totalSize = data?.reduce((acc, file) => acc + (file.metadata?.size || 0), 0) || 0;

			return {
				totalFiles,
				totalSize,
			};
		} catch (error) {
			return {
				totalFiles: 0,
				totalSize: 0,
				error: error instanceof Error ? error.message : 'Error getting bucket usage',
			};
		}
	}
} 