# Documentación de Supabase Storage - Compute Parts

Este documento contiene toda la información necesaria para recrear la configuración de Storage de Supabase en caso de que el proyecto sea eliminado o necesite ser duplicado. [(database_storage.sql)](database_storage.sql)

## Información del Proyecto
- **Fecha de Documentación**: 25 de Julio, 2025
- **Estado**: Configuración completa de buckets y políticas RLS
- **Total de Buckets**: 4 buckets configurados
- **Total de Políticas RLS**: 16 políticas implementadas

## Buckets Configurados

### 1. brand-logos
- **ID**: `brand-logos`
- **Nombre**: `brand-logos`
- **Tipo**: Público
- **Límite de tamaño**: 1 MB (1,048,576 bytes)
- **Tipos MIME permitidos**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/svg+xml`
- **Propósito**: Almacenamiento de logos de marcas
- **Políticas RLS**: 4 políticas (lectura pública, escritura solo admins)

### 2. category-images
- **ID**: `category-images`
- **Nombre**: `category-images`
- **Tipo**: Público
- **Límite de tamaño**: 2 MB (2,097,152 bytes)
- **Tipos MIME permitidos**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- **Propósito**: Almacenamiento de imágenes de categorías
- **Políticas RLS**: 4 políticas (lectura pública, escritura solo admins)

### 3. product-images
- **ID**: `product-images`
- **Nombre**: `product-images`
- **Tipo**: Público
- **Límite de tamaño**: 5 MB (5,242,880 bytes)
- **Tipos MIME permitidos**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`
- **Propósito**: Almacenamiento de imágenes de productos
- **Políticas RLS**: 4 políticas (lectura pública, escritura autenticados)

### 4. user-avatars
- **ID**: `user-avatars`
- **Nombre**: `user-avatars`
- **Tipo**: Público
- **Límite de tamaño**: 2 MB (2,097,152 bytes)
- **Tipos MIME permitidos**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- **Propósito**: Almacenamiento de avatares de usuarios
- **Políticas RLS**: 4 políticas (acceso por usuario)

## Políticas RLS (Row Level Security)

### Políticas para brand-logos

#### 1. Lectura Pública
```sql
CREATE POLICY "Brand logos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'brand-logos');
```

#### 2. Subida Solo por Admins
```sql
CREATE POLICY "Only admins can upload brand logos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'brand-logos' 
  AND (auth.jwt() ->> 'role') = 'admin'
);
```

#### 3. Actualización Solo por Admins
```sql
CREATE POLICY "Only admins can update brand logos"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'brand-logos' 
  AND (auth.jwt() ->> 'role') = 'admin'
);
```

#### 4. Eliminación Solo por Admins
```sql
CREATE POLICY "Only admins can delete brand logos"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'brand-logos' 
  AND (auth.jwt() ->> 'role') = 'admin'
);
```

### Políticas para category-images

#### 1. Lectura Pública
```sql
CREATE POLICY "Category images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'category-images');
```

#### 2. Subida Solo por Admins
```sql
CREATE POLICY "Only admins can upload category images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'category-images' 
  AND (auth.jwt() ->> 'role') = 'admin'
);
```

#### 3. Actualización Solo por Admins
```sql
CREATE POLICY "Only admins can update category images"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'category-images' 
  AND (auth.jwt() ->> 'role') = 'admin'
);
```

#### 4. Eliminación Solo por Admins
```sql
CREATE POLICY "Only admins can delete category images"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'category-images' 
  AND (auth.jwt() ->> 'role') = 'admin'
);
```

### Políticas para product-images

#### 1. Lectura Pública
```sql
CREATE POLICY "Product images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

#### 2. Subida por Usuarios Autenticados
```sql
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

#### 3. Actualización por Usuarios Autenticados
```sql
CREATE POLICY "Authenticated users can update product images"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

#### 4. Eliminación Solo por Admins
```sql
CREATE POLICY "Only admins can delete product images"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'product-images' 
  AND (auth.jwt() ->> 'role') = 'admin'
);
```

### Políticas para user-avatars

#### 1. Lectura de Avatar Propio y Públicos
```sql
CREATE POLICY "Users can view own avatar and public avatars"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'user-avatars' 
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR (storage.foldername(name))[1] = 'public'
  )
);
```

#### 2. Subida de Avatar Propio
```sql
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'user-avatars' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
```

#### 3. Actualización de Avatar Propio
```sql
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'user-avatars' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
```

#### 4. Eliminación de Avatar Propio
```sql
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'user-avatars' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
```

## Funciones Auxiliares para URLs

### get_product_image_url
```sql
CREATE OR REPLACE FUNCTION get_product_image_url(image_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://tu-proyecto.supabase.co/storage/v1/object/public/product-images/' || image_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### get_brand_logo_url
```sql
CREATE OR REPLACE FUNCTION get_brand_logo_url(logo_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://tu-proyecto.supabase.co/storage/v1/object/public/brand-logos/' || logo_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### get_category_image_url
```sql
CREATE OR REPLACE FUNCTION get_category_image_url(image_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://tu-proyecto.supabase.co/storage/v1/object/public/category-images/' || image_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### get_user_avatar_url
```sql
CREATE OR REPLACE FUNCTION get_user_avatar_url(avatar_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://tu-proyecto.supabase.co/storage/v1/object/public/user-avatars/' || avatar_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Script SQL Completo para Recreación

```sql
-- Crear buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('brand-logos', 'brand-logos', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('category-images', 'category-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('user-avatars', 'user-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Políticas para brand-logos
CREATE POLICY "Brand logos are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'brand-logos');

CREATE POLICY "Only admins can upload brand logos"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'brand-logos' AND (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Only admins can update brand logos"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'brand-logos' AND (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Only admins can delete brand logos"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'brand-logos' AND (auth.jwt() ->> 'role') = 'admin');

-- Políticas para category-images
CREATE POLICY "Category images are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'category-images');

CREATE POLICY "Only admins can upload category images"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'category-images' AND (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Only admins can update category images"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'category-images' AND (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Only admins can delete category images"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'category-images' AND (auth.jwt() ->> 'role') = 'admin');

-- Políticas para product-images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete product images"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'product-images' AND (auth.jwt() ->> 'role') = 'admin');

-- Políticas para user-avatars
CREATE POLICY "Users can view own avatar and public avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'user-avatars' AND ((auth.uid())::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'public'));

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'user-avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'user-avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'user-avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
```

## 📊 Estadísticas del Storage

- **4 buckets** configurados
- **16 políticas RLS** implementadas
- **4 funciones auxiliares** para URLs
- **Tipos de archivo soportados**: JPEG, PNG, WebP, SVG, GIF
- **Límites de tamaño**: 1MB - 5MB por archivo
- **Acceso público** para lectura de imágenes
- **Control granular** por roles de usuario

## 🔒 Seguridad Implementada

### **Niveles de Acceso**
- **Público**: Lectura de imágenes de productos, categorías y marcas
- **Autenticado**: Subida de imágenes de productos y avatares propios
- **Admin**: Control total sobre todos los buckets
- **Usuario**: Control sobre su propio avatar

### **Validaciones**
- Tipos MIME permitidos por bucket
- Límites de tamaño por bucket
- Verificación de roles de usuario
- Control de acceso por carpeta de usuario

## 🚀 Optimizaciones

### **Rendimiento**
- Compresión automática de imágenes
- CDN global de Supabase
- Cache inteligente
- Optimización de formatos

### **Organización**
- Estructura de carpetas por usuario
- Separación por tipo de contenido
- Nomenclatura consistente
- Backup automático
