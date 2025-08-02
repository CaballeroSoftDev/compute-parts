import { supabase } from '@/lib/supabase';
import { ProductImageService } from './product-image-service';
import { UploadService } from './upload-service';
import type {
	AdminProduct,
	AdminCategory,
	AdminBrand,
	AdminUser,
	AdminOrder,
	CreateProductForm,
	UpdateProductForm,
	CreateCategoryForm,
	UpdateCategoryForm,
	CreateBrandForm,
	UpdateBrandForm,
	AdminFilters,
	AdminListResponse,
	AdminStats,
	ProductImageForm,
} from '@/lib/types/admin';

// Verificar si el usuario tiene permisos de administrador
const checkAdminPermissions = async () => {
	const { data: { user }, error } = await supabase.auth.getUser();
	if (error || !user) {
		throw new Error('Usuario no autenticado');
	}

	// Verificar el rol del usuario
	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', user.id)
		.single();

	if (profileError || !profile || !['admin', 'superadmin'].includes(profile.role)) {
		throw new Error('No tienes permisos de administrador');
	}

	return user;
};

// Clase principal para el servicio administrativo
export class AdminService {
  // Extraer el path completo de una URL de Supabase Storage
  private static extractStoragePath(url: string, bucketName: string): string | null {
    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === bucketName);
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join('/');
      }
      return null;
    } catch (error) {
      console.warn('Error extracting storage path:', error);
      return null;
    }
  }

  // Verificar si una imagen ha cambiado comparando con la URL existente
  private static hasImageChanged(imageFile: File | null, existingImageUrl: string | null): boolean {
    // Si no hay archivo nuevo, no hay cambio
    if (!imageFile) return false;
    
    // Si no hay imagen existente, es un cambio (nueva imagen)
    if (!existingImageUrl) return true;
    
    // Extraer el nombre del archivo de la URL existente
    const existingFileName = existingImageUrl.split('/').pop();
    if (!existingFileName) return true;
    
    // Comparar nombres de archivo directamente
    // Si el usuario selecciona el mismo archivo, tendrá el mismo nombre
    const newFileName = imageFile.name;
    
    // También comparar tamaños para mayor precisión
    // Nota: No podemos obtener el tamaño del archivo existente desde la URL,
    // pero podemos asumir que si el nombre es diferente, la imagen cambió
    
    // Extraer nombre base sin extensión para comparar
    const getBaseName = (fileName: string) => {
      const lastDot = fileName.lastIndexOf('.');
      return lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
    };
    
    const existingBaseName = getBaseName(existingFileName);
    const newBaseName = getBaseName(newFileName);
    
    // Si contiene timestamp (formato: timestamp-randomstring-originalname),
    // extraer solo el nombre original
    const extractOriginalName = (fileName: string) => {
      // Si empieza con timestamp (solo números seguidos de guión)
      if (/^\d+-[a-z0-9]+-/.test(fileName)) {
        const parts = fileName.split('-');
        if (parts.length >= 3) {
          return parts.slice(2).join('-');
        }
      }
      return fileName;
    };
    
    const existingOriginal = extractOriginalName(existingBaseName);
    const newOriginal = newBaseName;
    
    // Si los nombres originales son diferentes, la imagen ha cambiado
    return existingOriginal !== newOriginal;
  }

  // ===== PRODUCTOS =====
  static async getProducts(filters?: AdminFilters, page = 1, limit = 20): Promise<AdminListResponse<AdminProduct>> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      let query = supabase
        .from('products')
        .select(
          `
					*,
					category:categories(*),
					brand:brands(*),
					images:product_images(*)
				`
        )
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters) {
        if (filters.search) {
          query = query.or(
            `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
          );
        }
        if (filters.category_id) {
          query = query.eq('category_id', filters.category_id);
        }
        if (filters.brand_id) {
          query = query.eq('brand_id', filters.brand_id);
        }
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
        if (filters.is_featured !== undefined) {
          query = query.eq('is_featured', filters.is_featured);
        }
        if (filters.price_min !== undefined) {
          query = query.gte('price', filters.price_min);
        }
        if (filters.price_max !== undefined) {
          query = query.lte('price', filters.price_max);
        }
        if (filters.stock_min !== undefined) {
          query = query.gte('stock_quantity', filters.stock_min);
        }
        if (filters.stock_max !== undefined) {
          query = query.lte('stock_quantity', filters.stock_max);
        }
      }

      // Contar total de registros
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });

      // Aplicar paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      const total = count || 0;
      const total_pages = Math.ceil(total / limit);

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          total_pages,
        },
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async getProduct(id: string): Promise<AdminProduct | null> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      const { data, error } = await supabase
        .from('products')
        .select(
          `
					*,
					category:categories(*),
					brand:brands(*),
					images:product_images(*),
					variants:product_variants(*)
				`
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  static async createProduct(productData: CreateProductForm): Promise<AdminProduct> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      // Validar datos requeridos
      if (!productData.name || !productData.sku || productData.price <= 0) {
        throw new Error('Datos del producto incompletos o inválidos');
      }

      // Verificar que el SKU sea único
      const { data: existingProducts, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('sku', productData.sku);

      if (checkError) {
        throw new Error('Error al verificar SKU existente');
      }

      if (existingProducts && existingProducts.length > 0) {
        throw new Error('El SKU ya existe en otro producto');
      }

      // Extraer imágenes del producto
      const { images, ...productWithoutImages } = productData;

      // Crear el producto
      const { data: product, error } = await supabase
        .from('products')
        .insert([productWithoutImages])
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          images:product_images(*)
        `)
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw new Error(`Error al crear el producto: ${error.message}`);
      }

      // Si hay imágenes, crearlas
      if (images && images.length > 0) {
        const imageResults = await ProductImageService.createProductImages(
          images.map((img, index) => ({
            product_id: product.id,
            image_url: img.url,
            alt_text: img.alt_text || null,
            is_primary: img.is_primary || index === 0, // Primera imagen como principal por defecto
            sort_order: img.sort_order || index,
          }))
        );

        if (imageResults.length > 0) {
          // Actualizar el producto con las imágenes
          const { data: updatedProduct } = await supabase
            .from('products')
            .select(`
              *,
              category:categories(*),
              brand:brands(*),
              images:product_images(*)
            `)
            .eq('id', product.id)
            .single();

          return updatedProduct;
        }
      }

      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async updateProduct(id: string, productData: UpdateProductForm): Promise<AdminProduct> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      // Verificar que el producto existe
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .single();

      if (!existingProduct) {
        throw new Error('Producto no encontrado');
      }

      // Si se está actualizando el SKU, verificar que sea único
      if (productData.sku) {
        const { data: skuExists, error: skuCheckError } = await supabase
          .from('products')
          .select('id')
          .eq('sku', productData.sku)
          .neq('id', id);

        if (skuCheckError) {
          throw new Error('Error al verificar SKU existente');
        }

        if (skuExists && skuExists.length > 0) {
          throw new Error('El SKU ya existe en otro producto');
        }
      }

      // Extraer imágenes del producto
      const { images, ...productWithoutImages } = productData;

      // Actualizar el producto
      const { data: product, error } = await supabase
        .from('products')
        .update(productWithoutImages)
        .eq('id', id)
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          images:product_images(*)
        `)
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw new Error(`Error al actualizar el producto: ${error.message}`);
      }

      // Sincronizar imágenes si se proporcionaron
      if (images !== undefined) {
        const syncResult = await ProductImageService.syncProductImages(id, images);
        
        if (!syncResult.success && syncResult.errors.length > 0) {
          console.warn('Some image operations failed:', syncResult.errors);
        }

        // Obtener el producto actualizado con las imágenes
        const { data: updatedProduct } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            brand:brands(*),
            images:product_images(*)
          `)
          .eq('id', id)
          .single();

        return updatedProduct;
      }

      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      // Verificar que el producto existe
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .single();

      if (!existingProduct) {
        throw new Error('Producto no encontrado');
      }

      // Eliminar imágenes asociadas primero
      await supabase.from('product_images').delete().eq('product_id', id);

      // Eliminar variantes asociadas
      await supabase.from('product_variants').delete().eq('product_id', id);

      // Eliminar el producto
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // ===== CATEGORÍAS =====
  static async getCategories(): Promise<AdminCategory[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error(`Error al cargar categorías: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error instanceof Error ? error : new Error('Error al cargar categorías');
    }
  }

  static async createCategory(categoryData: CreateCategoryForm, imageFile?: File): Promise<AdminCategory> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      // Validar datos requeridos
      if (!categoryData.name) {
        throw new Error('El nombre de la categoría es requerido');
      }

      // Verificar que el nombre sea único
      const { data: existingCategories, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryData.name);

      if (checkError) {
        throw new Error('Error al verificar categoría existente');
      }

      if (existingCategories && existingCategories.length > 0) {
        throw new Error('Ya existe una categoría con ese nombre');
      }

      // Si hay un archivo de imagen, subirlo primero
      if (imageFile) {
        const uploadResult = await UploadService.uploadCategoryImage(imageFile);
        if (uploadResult.error) {
          throw new Error(`Error al subir la imagen: ${uploadResult.error}`);
        }
        categoryData.image_url = uploadResult.url;
      }

      const { data, error } = await supabase.from('categories').insert(categoryData).select().single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  static async updateCategory(id: string, categoryData: UpdateCategoryForm, imageFile?: File): Promise<AdminCategory> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      // Verificar que la categoría existe
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id, image_url')
        .eq('id', id)
        .single();

      if (!existingCategory) {
        throw new Error('Categoría no encontrada');
      }

      // Si se está actualizando el nombre, verificar que sea único
      if (categoryData.name) {
        const { data: nameExists, error: nameCheckError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryData.name)
          .neq('id', id);

        if (nameCheckError) {
          throw new Error('Error al verificar nombre de categoría');
        }

        if (nameExists && nameExists.length > 0) {
          throw new Error('Ya existe una categoría con ese nombre');
        }
      }

      // Solo procesar imagen si ha cambiado
      const imageChanged = this.hasImageChanged(imageFile || null, existingCategory.image_url);
      console.log('🔍 Verificando cambio de imagen:', {
        hasImageFile: !!imageFile,
        existingImageUrl: existingCategory.image_url,
        newFileName: imageFile?.name,
        imageChanged
      });
      
      if (imageChanged) {
        if (imageFile) {
          // Subir nueva imagen
          const uploadResult = await UploadService.uploadCategoryImage(imageFile);
          if (uploadResult.error) {
            throw new Error(`Error al subir la imagen: ${uploadResult.error}`);
          }
          categoryData.image_url = uploadResult.url;

          // Eliminar imagen anterior si existe
          if (existingCategory.image_url) {
            try {
              const oldImagePath = this.extractStoragePath(existingCategory.image_url, 'category-images');
              if (oldImagePath) {
                console.log('🗑️ Eliminando imagen anterior:', oldImagePath);
                const deleteResult = await UploadService.deleteImage(oldImagePath, UploadService.getBucketInfo('category').bucket);
                console.log('🗑️ Resultado eliminación:', deleteResult);
              }
            } catch (error) {
              console.warn('Error deleting old image:', error);
            }
          }
        }
      }

      const { data, error } = await supabase.from('categories').update(categoryData).eq('id', id).select().single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      // Verificar que la categoría existe
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id, image_url')
        .eq('id', id)
        .single();

      if (!existingCategory) {
        throw new Error('Categoría no encontrada');
      }

      // Verificar que no hay productos asociados
      const { data: productsInCategory } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id)
        .limit(1);

      if (productsInCategory && productsInCategory.length > 0) {
        throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
      }

      // Eliminar imagen si existe
      if (existingCategory.image_url) {
        try {
          const imagePath = this.extractStoragePath(existingCategory.image_url, 'category-images');
          if (imagePath) {
            await UploadService.deleteImage(imagePath, UploadService.getBucketInfo('category').bucket);
          }
        } catch (error) {
          console.warn('Error deleting category image:', error);
        }
      }

      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // ===== MARCAS =====
  static async getBrands(): Promise<AdminBrand[]> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching brands:', error);
        throw new Error(`Error al cargar marcas: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error instanceof Error ? error : new Error('Error al cargar marcas');
    }
  }

  static async createBrand(brandData: CreateBrandForm): Promise<AdminBrand> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      // Validar datos requeridos
      if (!brandData.name) {
        throw new Error('El nombre de la marca es requerido');
      }

      // Verificar que el nombre sea único
      const { data: existingBrands, error: checkError } = await supabase
        .from('brands')
        .select('id')
        .eq('name', brandData.name);

      if (checkError) {
        throw new Error('Error al verificar marca existente');
      }

      if (existingBrands && existingBrands.length > 0) {
        throw new Error('Ya existe una marca con ese nombre');
      }

      const { data, error } = await supabase.from('brands').insert(brandData).select().single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  }

  static async updateBrand(id: string, brandData: UpdateBrandForm): Promise<AdminBrand> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      // Verificar que la marca existe
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('id', id)
        .single();

      if (!existingBrand) {
        throw new Error('Marca no encontrada');
      }

      // Si se está actualizando el nombre, verificar que sea único
      if (brandData.name) {
        const { data: nameExists, error: nameCheckError } = await supabase
          .from('brands')
          .select('id')
          .eq('name', brandData.name)
          .neq('id', id);

        if (nameCheckError) {
          throw new Error('Error al verificar nombre de marca');
        }

        if (nameExists && nameExists.length > 0) {
          throw new Error('Ya existe una marca con ese nombre');
        }
      }

      const { data, error } = await supabase.from('brands').update(brandData).eq('id', id).select().single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  }

  static async deleteBrand(id: string): Promise<void> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      // Verificar que la marca existe
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('id', id)
        .single();

      if (!existingBrand) {
        throw new Error('Marca no encontrada');
      }

      // Verificar que no hay productos asociados
      const { data: productsInBrand } = await supabase
        .from('products')
        .select('id')
        .eq('brand_id', id)
        .limit(1);

      if (productsInBrand && productsInBrand.length > 0) {
        throw new Error('No se puede eliminar la marca porque tiene productos asociados');
      }

      const { error } = await supabase.from('brands').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  }

  // ===== USUARIOS =====
  static async getUsers(page = 1, limit = 20): Promise<AdminListResponse<AdminUser>> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      const total = count || 0;
      const total_pages = Math.ceil(total / limit);

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          total_pages,
        },
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // ===== PEDIDOS =====
  static async getOrders(page = 1, limit = 20): Promise<AdminListResponse<AdminOrder>> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      const { data, error } = await supabase
        .from('orders')
        .select(
          `
					*,
					user:profiles(*),
					items:order_items(*)
				`
        )
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });

      const total = count || 0;
      const total_pages = Math.ceil(total / limit);

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          total_pages,
        },
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // ===== ESTADÍSTICAS =====
  static async getStats(): Promise<AdminStats> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      // Obtener estadísticas de productos
      const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });

      const { count: activeProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: lowStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock_quantity', 10)
        .gt('stock_quantity', 0);

      const { count: outOfStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('stock_quantity', 0);

      // Obtener estadísticas de categorías y marcas
      const { count: totalCategories } = await supabase.from('categories').select('*', { count: 'exact', head: true });

      const { count: totalBrands } = await supabase.from('brands').select('*', { count: 'exact', head: true });

      // Obtener estadísticas de pedidos
      const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });

      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pendiente');

      // Obtener estadísticas de usuarios
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      // Obtener ingresos totales
      const { data: revenueData } = await supabase.from('orders').select('total_amount').eq('payment_status', 'Pagado');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      return {
        total_products: totalProducts || 0,
        active_products: activeProducts || 0,
        low_stock_products: lowStockProducts || 0,
        out_of_stock_products: outOfStockProducts || 0,
        total_categories: totalCategories || 0,
        total_brands: totalBrands || 0,
        total_orders: totalOrders || 0,
        pending_orders: pendingOrders || 0,
        total_users: totalUsers || 0,
        total_revenue: totalRevenue,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // ===== MÉTODOS ADICIONALES =====
  
  // Obtener productos con stock bajo
  static async getLowStockProducts(): Promise<AdminProduct[]> {
    try {
      await checkAdminPermissions();

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .lt('stock_quantity', 10)
        .gt('stock_quantity', 0)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  // Obtener productos agotados
  static async getOutOfStockProducts(): Promise<AdminProduct[]> {
    try {
      await checkAdminPermissions();

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .eq('stock_quantity', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching out of stock products:', error);
      throw error;
    }
  }

  // Actualizar stock de producto
  static async updateProductStock(id: string, quantity: number): Promise<AdminProduct> {
    try {
      await checkAdminPermissions();

      const { data, error } = await supabase
        .from('products')
        .update({ stock_quantity: quantity })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  // Obtener estadísticas de ventas por período
  static async getSalesStats(startDate: string, endDate: string) {
    try {
      await checkAdminPermissions();

      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('payment_status', 'Pagado');

      if (error) throw error;

      const totalSales = data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const orderCount = data?.length || 0;
      const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

      return {
        totalSales,
        orderCount,
        averageOrderValue,
        orders: data || [],
      };
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      throw error;
    }
  }

  // ===== MÉTODOS PARA IMÁGENES DE PRODUCTOS =====

  // Obtener imágenes de un producto
  static async getProductImages(productId: string) {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      return await ProductImageService.getProductImages(productId);
    } catch (error) {
      console.error('Error in getProductImages:', error);
      throw error;
    }
  }

  // Establecer imagen principal
  static async setPrimaryImage(productId: string, imageId: string): Promise<boolean> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      return await ProductImageService.setPrimaryImage(productId, imageId);
    } catch (error) {
      console.error('Error in setPrimaryImage:', error);
      throw error;
    }
  }

  // Reordenar imágenes de producto
  static async reorderProductImages(images: { id: string; sort_order: number }[]): Promise<boolean> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      return await ProductImageService.reorderImages(images);
    } catch (error) {
      console.error('Error in reorderProductImages:', error);
      throw error;
    }
  }

  // Eliminar imagen de producto
  static async deleteProductImage(imageId: string): Promise<boolean> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      return await ProductImageService.deleteProductImage(imageId);
    } catch (error) {
      console.error('Error in deleteProductImage:', error);
      throw error;
    }
  }

  // Obtener imagen principal de un producto
  static async getPrimaryProductImage(productId: string) {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      return await ProductImageService.getPrimaryImage(productId);
    } catch (error) {
      console.error('Error in getPrimaryProductImage:', error);
      throw error;
    }
  }

  // Sincronizar imágenes de producto
  static async syncProductImages(productId: string, images: ProductImageForm[]): Promise<{
    success: boolean;
    created: number;
    updated: number;
    deleted: number;
    errors: string[];
  }> {
    try {
      // Verificar permisos de administrador
      await checkAdminPermissions();

      return await ProductImageService.syncProductImages(productId, images);
    } catch (error) {
      console.error('Error in syncProductImages:', error);
      throw error;
    }
  }
}
