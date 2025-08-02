'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MultipleImageUpload, ProductImage } from '@/components/ui/multiple-image-upload';
import { useToast } from '@/hooks/use-toast';
import { UploadService } from '@/lib/services/upload-service';
import type { AdminProduct, CreateProductForm, UpdateProductForm, ProductImageForm } from '@/lib/types/admin';
import type { AdminCategory, AdminBrand } from '@/lib/types/admin';

interface ProductFormProps {
  product?: AdminProduct;
  categories: AdminCategory[];
  brands: AdminBrand[];
  onSubmit: (data: CreateProductForm | UpdateProductForm) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProductForm({ product, categories, brands, onSubmit, onCancel, loading = false }: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductForm>({
    name: '',
    description: '',
    short_description: '',
    category_id: '',
    brand_id: '',
    sku: '',
    price: 0,
    compare_price: 0,
    cost_price: 0,
    stock_quantity: 0,
    low_stock_threshold: 5,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    specifications: {},
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    meta_title: '',
    meta_description: '',
    tags: [],
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingSku, setIsGeneratingSku] = useState(false);
  const { toast } = useToast();

  // Cargar datos del producto si estamos editando
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        short_description: product.short_description || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        sku: product.sku || '',
        price: product.price,
        compare_price: product.compare_price || 0,
        cost_price: product.cost_price || 0,
        stock_quantity: product.stock_quantity || 0,
        low_stock_threshold: product.low_stock_threshold || 5,
        weight: product.weight || 0,
        dimensions: product.dimensions || {
          length: 0,
          width: 0,
          height: 0,
        },
        specifications: product.specifications || {},
        is_active: product.is_active,
        is_featured: product.is_featured,
        is_bestseller: product.is_bestseller,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        tags: product.tags || [],
        images: product.images?.map(img => ({
          id: img.id,
          url: img.image_url,
          path: img.image_url, // Asumiendo que la URL es el path
          alt_text: img.alt_text || undefined,
          is_primary: img.is_primary,
          sort_order: img.sort_order || undefined,
        })) || [],
      });
    }
  }, [product]);

  // Generar SKU automáticamente
  const generateSku = async () => {
    if (!formData.name || !formData.category_id || !formData.brand_id) {
      toast({
        title: 'Información requerida',
        description: 'Necesitas completar el nombre, categoría y marca para generar el SKU',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingSku(true);
    try {
      const category = categories.find(c => c.id === formData.category_id);
      const brand = brands.find(b => b.id === formData.brand_id);
      
      if (!category || !brand) {
        toast({
          title: 'Error',
          description: 'No se pudo encontrar la categoría o marca seleccionada',
          variant: 'destructive',
        });
        return;
      }

      const categoryCode = category.name.substring(0, 3).toUpperCase();
      const brandCode = brand.name.substring(0, 3).toUpperCase();
      const productCode = formData.name.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-4);
      
      const generatedSku = `${categoryCode}-${brandCode}-${productCode}-${timestamp}`;
      
      handleInputChange('sku', generatedSku);
      
      toast({
        title: 'SKU generado',
        description: 'Se ha generado un SKU único para el producto',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el SKU automáticamente',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingSku(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'La categoría es requerida';
    }

    if (!formData.brand_id) {
      newErrors.brand_id = 'La marca es requerida';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'El SKU es requerido';
    } else if (formData.sku.length < 3) {
      newErrors.sku = 'El SKU debe tener al menos 3 caracteres';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'El stock no puede ser negativo';
    }

    if (formData.low_stock_threshold < 0) {
      newErrors.low_stock_threshold = 'El umbral de stock bajo no puede ser negativo';
    }

    if ((formData.weight || 0) < 0) {
      newErrors.weight = 'El peso no puede ser negativo';
    }

    // Validar dimensiones
    if (formData.dimensions) {
      if ((formData.dimensions.length || 0) < 0) {
        newErrors.length = 'El largo no puede ser negativo';
      }
      if ((formData.dimensions.width || 0) < 0) {
        newErrors.width = 'El ancho no puede ser negativo';
      }
      if ((formData.dimensions.height || 0) < 0) {
        newErrors.height = 'El alto no puede ser negativo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Error de validación',
        description: 'Por favor corrige los errores en el formulario',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Obtener las imágenes actuales del formulario
      const currentImages = formData.images || [];
      
      // Convertir de vuelta a ProductImage para procesar
      const productImages: ProductImage[] = currentImages.map(img => ({
        id: img.id,
        url: img.url,
        path: img.path,
        alt_text: img.alt_text,
        is_primary: img.is_primary,
        sort_order: img.sort_order,
        isNew: !img.id || img.id.startsWith('temp-'), // Identificar imágenes nuevas
      }));

      if (product) {
        // Actualizar producto existente
        const productId = product.id;
        
        // Subir imágenes nuevas si las hay
        let finalImages = currentImages;
        if (productImages.some(img => img.isNew)) {
          try {
            finalImages = await uploadNewImages(productImages, productId);
          } catch (error) {
            toast({
              title: 'Error al subir imágenes',
              description: error instanceof Error ? error.message : 'Error desconocido',
              variant: 'destructive',
            });
            return;
          }
        }

        // Actualizar producto con imágenes procesadas
        await onSubmit({
          id: product.id,
          ...formData,
          images: finalImages,
        } as UpdateProductForm);
      } else {
        // Crear nuevo producto
        const tempProductId = `temp-${Date.now()}`;
        
        // Subir imágenes nuevas si las hay
        let finalImages = currentImages;
        if (productImages.some(img => img.isNew)) {
          try {
            finalImages = await uploadNewImages(productImages, tempProductId);
          } catch (error) {
            toast({
              title: 'Error al subir imágenes',
              description: error instanceof Error ? error.message : 'Error desconocido',
              variant: 'destructive',
            });
            return;
          }
        }

        // Crear producto con imágenes procesadas
        await onSubmit({
          ...formData,
          images: finalImages,
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar el producto',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImagesChange = (images: ProductImage[]) => {
    // Convertir ProductImage a ProductImageForm para el formulario
    const imageForms: ProductImageForm[] = images.map(img => ({
      id: img.id,
      url: img.url,
      path: img.path,
      alt_text: img.alt_text,
      is_primary: img.is_primary,
      sort_order: img.sort_order,
    }));
    
    setFormData(prev => ({
      ...prev,
      images: imageForms,
    }));
  };

  // Función para subir imágenes nuevas al servidor
  const uploadNewImages = async (images: ProductImage[], productId: string): Promise<ProductImageForm[]> => {
    const uploadedImages: ProductImageForm[] = [];
    
    for (const image of images) {
      if (image.isNew && image.file) {
        try {
          // Subir imagen al servidor
          const result = await UploadService.uploadProductImage(image.file, productId);
          
          if (result.error) {
            throw new Error(`Error al subir imagen: ${result.error}`);
          }
          
          // Agregar imagen subida a la lista
          uploadedImages.push({
            id: undefined, // Se asignará desde la base de datos
            url: result.url,
            path: result.path,
            alt_text: image.alt_text,
            is_primary: image.is_primary,
            sort_order: image.sort_order,
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          throw error;
        }
      } else {
        // Imagen existente, mantener como está
        uploadedImages.push({
          id: image.id,
          url: image.url,
          path: image.path,
          alt_text: image.alt_text,
          is_primary: image.is_primary,
          sort_order: image.sort_order,
        });
      }
    }
    
    return uploadedImages;
  };

  const getStockStatus = () => {
    const stock = formData.stock_quantity || 0;
    const threshold = formData.low_stock_threshold || 5;
    
    if (stock === 0) return { status: 'Agotado', color: 'bg-red-100 text-red-800' };
    if (stock <= threshold) return { status: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'En Stock', color: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus();

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Tabs
        defaultValue="basic"
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="pricing">Precios y Stock</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Información Básica */}
        <TabsContent
          value="basic"
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos principales del producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nombre del producto"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="SKU del producto"
                      className={errors.sku ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateSku}
                      disabled={isGeneratingSku || !formData.name || !formData.category_id || !formData.brand_id}
                    >
                      {isGeneratingSku ? 'Generando...' : 'Auto'}
                    </Button>
                  </div>
                  {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Marca *</Label>
                  <Select
                    value={formData.brand_id}
                    onValueChange={(value) => handleInputChange('brand_id', value)}
                  >
                    <SelectTrigger className={errors.brand_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem
                          key={brand.id}
                          value={brand.id}
                        >
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.brand_id && <p className="text-sm text-red-500">{errors.brand_id}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción detallada del producto"
                  rows={4}
                />
              </div>

              				<div className="space-y-2">
					<Label htmlFor="short_description">Descripción Corta</Label>
					<Textarea
						id="short_description"
						value={formData.short_description}
						onChange={(e) => handleInputChange('short_description', e.target.value)}
						placeholder="Descripción breve del producto"
						rows={2}
					/>
				</div>

				{/* Gestión de imágenes */}
				            <MultipleImageUpload
              label="Imágenes del producto"
              images={formData.images?.map(img => ({
                id: img.id,
                url: img.url,
                path: img.path,
                alt_text: img.alt_text,
                is_primary: img.is_primary,
                sort_order: img.sort_order,
              })) || []}
              onImagesChange={handleImagesChange}
              productId={product?.id}
              maxImages={10}
              showOptimization={true}
              optimizeImage={true}
              maxWidth={1920}
              maxHeight={1080}
              aspectRatio={4/3}
              showPreview={true}
              previewSize="md"
            />
			</CardContent>
		</Card>
	</TabsContent>

        {/* Precios y Stock */}
        <TabsContent
          value="pricing"
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Precios y Stock</CardTitle>
              <CardDescription>Información de precios y disponibilidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio de Venta *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compare_price">Precio de Comparación</Label>
                  <Input
                    id="compare_price"
                    type="number"
                    step="0.01"
                    value={formData.compare_price}
                    onChange={(e) => handleInputChange('compare_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost_price">Precio de Costo</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => handleInputChange('cost_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Disponible</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className={errors.stock_quantity ? 'border-red-500' : ''}
                  />
                  {errors.stock_quantity && <p className="text-sm text-red-500">{errors.stock_quantity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Umbral de Stock Bajo</Label>
                  <Input
                    id="low_stock_threshold"
                    type="number"
                    value={formData.low_stock_threshold}
                    onChange={(e) => handleInputChange('low_stock_threshold', parseInt(e.target.value) || 0)}
                    placeholder="5"
                    className={errors.low_stock_threshold ? 'border-red-500' : ''}
                  />
                  {errors.low_stock_threshold && <p className="text-sm text-red-500">{errors.low_stock_threshold}</p>}
                </div>
              </div>

              {/* Estado del stock */}
              <div className="flex items-center space-x-2">
                <Label>Estado del Stock:</Label>
                <Badge className={stockStatus.color}>
                  {stockStatus.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detalles */}
        <TabsContent
          value="details"
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Producto</CardTitle>
              <CardDescription>Información adicional y dimensiones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              				<div className="space-y-2">
					<Label htmlFor="weight">Peso (kg)</Label>
					<Input
						id="weight"
						type="number"
						step="0.01"
						value={formData.weight || 0}
						onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
						placeholder="0.00"
						className={errors.weight ? 'border-red-500' : ''}
					/>
					{errors.weight && <p className="text-sm text-red-500">{errors.weight}</p>}
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="space-y-2">
						<Label htmlFor="length">Largo (cm)</Label>
						<Input
							id="length"
							type="number"
							step="0.01"
							value={formData.dimensions?.length || 0}
							onChange={(e) =>
								handleInputChange('dimensions', {
									...formData.dimensions,
									length: parseFloat(e.target.value) || 0,
								})
							}
							placeholder="0.00"
							className={errors.length ? 'border-red-500' : ''}
						/>
						{errors.length && <p className="text-sm text-red-500">{errors.length}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="width">Ancho (cm)</Label>
						<Input
							id="width"
							type="number"
							step="0.01"
							value={formData.dimensions?.width || 0}
							onChange={(e) =>
								handleInputChange('dimensions', {
									...formData.dimensions,
									width: parseFloat(e.target.value) || 0,
								})
							}
							placeholder="0.00"
							className={errors.width ? 'border-red-500' : ''}
						/>
						{errors.width && <p className="text-sm text-red-500">{errors.width}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="height">Alto (cm)</Label>
						<Input
							id="height"
							type="number"
							step="0.01"
							value={formData.dimensions?.height || 0}
							onChange={(e) =>
								handleInputChange('dimensions', {
									...formData.dimensions,
									height: parseFloat(e.target.value) || 0,
								})
							}
							placeholder="0.00"
							className={errors.height ? 'border-red-500' : ''}
						/>
						{errors.height && <p className="text-sm text-red-500">{errors.height}</p>}
					</div>
				</div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Producto Activo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  />
                  <Label htmlFor="is_featured">Producto Destacado</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_bestseller"
                    checked={formData.is_bestseller}
                    onCheckedChange={(checked) => handleInputChange('is_bestseller', checked)}
                  />
                  <Label htmlFor="is_bestseller">Más Vendido</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent
          value="seo"
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>SEO y Metadatos</CardTitle>
              <CardDescription>Información para optimización en buscadores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Título SEO</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="Título optimizado para SEO"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Descripción SEO</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="Descripción optimizada para SEO"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Guardando...' : product ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
}
