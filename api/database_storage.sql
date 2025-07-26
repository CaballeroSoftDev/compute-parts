-- =====================================================
-- Script de Configuración de Supabase Storage
-- Compute Parts Project
-- =====================================================

-- Habilitar RLS en las tablas de storage si no está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREAR BUCKETS
-- =====================================================

-- Bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para avatares de usuarios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-avatars',
    'user-avatars',
    true,
    2097152, -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para logos de marcas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'brand-logos',
    'brand-logos',
    true,
    1048576, -- 1 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para imágenes de categorías
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'category-images',
    'category-images',
    true,
    2097152, -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS PARA PRODUCT-IMAGES
-- =====================================================

-- Lectura pública de imágenes de productos
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
CREATE POLICY "Product images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Subida por usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- Actualización por usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
CREATE POLICY "Authenticated users can update product images"
ON storage.objects
FOR UPDATE
TO public
USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- Eliminación solo por administradores
DROP POLICY IF EXISTS "Only admins can delete product images" ON storage.objects;
CREATE POLICY "Only admins can delete product images"
ON storage.objects
FOR DELETE
TO public
USING (
    bucket_id = 'product-images' 
    AND (auth.jwt() ->> 'role') = 'admin'
);

-- =====================================================
-- POLÍTICAS PARA USER-AVATARS
-- =====================================================

-- Lectura de avatar propio y avatares públicos
DROP POLICY IF EXISTS "Users can view own avatar and public avatars" ON storage.objects;
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

-- Subida de avatar propio
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
    bucket_id = 'user-avatars' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Actualización de avatar propio
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO public
USING (
    bucket_id = 'user-avatars' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Eliminación de avatar propio
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO public
USING (
    bucket_id = 'user-avatars' 
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- =====================================================
-- POLÍTICAS PARA BRAND-LOGOS
-- =====================================================

-- Lectura pública de logos de marcas
DROP POLICY IF EXISTS "Brand logos are publicly accessible" ON storage.objects;
CREATE POLICY "Brand logos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'brand-logos');

-- Subida solo por administradores
DROP POLICY IF EXISTS "Only admins can upload brand logos" ON storage.objects;
CREATE POLICY "Only admins can upload brand logos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
    bucket_id = 'brand-logos' 
    AND (auth.jwt() ->> 'role') = 'admin'
);

-- Actualización solo por administradores
DROP POLICY IF EXISTS "Only admins can update brand logos" ON storage.objects;
CREATE POLICY "Only admins can update brand logos"
ON storage.objects
FOR UPDATE
TO public
USING (
    bucket_id = 'brand-logos' 
    AND (auth.jwt() ->> 'role') = 'admin'
);

-- Eliminación solo por administradores
DROP POLICY IF EXISTS "Only admins can delete brand logos" ON storage.objects;
CREATE POLICY "Only admins can delete brand logos"
ON storage.objects
FOR DELETE
TO public
USING (
    bucket_id = 'brand-logos' 
    AND (auth.jwt() ->> 'role') = 'admin'
);

-- =====================================================
-- POLÍTICAS PARA CATEGORY-IMAGES
-- =====================================================

-- Lectura pública de imágenes de categorías
DROP POLICY IF EXISTS "Category images are publicly accessible" ON storage.objects;
CREATE POLICY "Category images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'category-images');

-- Subida solo por administradores
DROP POLICY IF EXISTS "Only admins can upload category images" ON storage.objects;
CREATE POLICY "Only admins can upload category images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
    bucket_id = 'category-images' 
    AND (auth.jwt() ->> 'role') = 'admin'
);

-- Actualización solo por administradores
DROP POLICY IF EXISTS "Only admins can update category images" ON storage.objects;
CREATE POLICY "Only admins can update category images"
ON storage.objects
FOR UPDATE
TO public
USING (
    bucket_id = 'category-images' 
    AND (auth.jwt() ->> 'role') = 'admin'
);

-- Eliminación solo por administradores
DROP POLICY IF EXISTS "Only admins can delete category images" ON storage.objects;
CREATE POLICY "Only admins can delete category images"
ON storage.objects
FOR DELETE
TO public
USING (
    bucket_id = 'category-images' 
    AND (auth.jwt() ->> 'role') = 'admin'
);

-- =====================================================
-- VERIFICACIÓN DE CONFIGURACIÓN
-- =====================================================

-- Verificar buckets creados
SELECT 
    'Buckets creados:' as info,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY id;

-- =====================================================
-- FIN DEL SCRIPT
-- ===================================================== 