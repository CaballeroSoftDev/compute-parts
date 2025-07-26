# Documentación de Supabase Storage - Compute Parts

Este documento contiene toda la información necesaria para recrear la configuración de Storage de Supabase en caso de que el proyecto sea eliminado o necesite ser duplicado. [(database_storange.sql)](database_storage.sql)

## Información del Proyecto
- **Fecha de Documentación**: 25 de Julio, 2025
- **Estado**: Configuración completa de buckets y políticas RLS

## Buckets Configurados

### 1. product-images
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

### 2. user-avatars
- **ID**: `user-avatars`
- **Nombre**: `user-avatars`
- **Tipo**: Público
- **Límite de tamaño**: 2 MB (2,097,152 bytes)
- **Tipos MIME permitidos**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- **Propósito**: Almacenamiento de avatares de usuarios

### 3. brand-logos
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

### 4. category-images
- **ID**: `category-images`
- **Nombre**: `category-images`
- **Tipo**: Público
- **Límite de tamaño**: 2 MB (2,097,152 bytes)
- **Tipos MIME permitidos**:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- **Propósito**: Almacenamiento de imágenes de categorías

## Políticas RLS (Row Level Security)

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

## Script SQL Completo para Recreación

```sql
-- Crear buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('user-avatars', 'user-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('brand-logos', 'brand-logos', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('category-images', 'category-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']);

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
```
