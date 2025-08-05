-- =====================================================
-- ESTRUCTURA DE STORAGE SUPABASE COMPUTEPARTS
-- =====================================================

-- =====================================================
-- BUCKETS DE STORAGE
-- =====================================================

-- Bucket para logos de marcas
INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
    'brand-logos',
    'brand-logos',
    NULL,
    true,
    1048576, -- 1MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    '2025-07-25 23:37:49.214191+00',
    '2025-07-25 23:37:49.214191+00'
);

-- Bucket para imágenes de categorías
INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
    'category-images',
    'category-images',
    NULL,
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    '2025-07-25 23:37:49.214191+00',
    '2025-07-25 23:37:49.214191+00'
);

-- Bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
    'product-images',
    'product-images',
    NULL,
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    '2025-07-25 23:37:49.214191+00',
    '2025-07-25 23:37:49.214191+00'
);

-- Bucket para avatares de usuarios
INSERT INTO storage.buckets (id, name, owner, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
    'user-avatars',
    'user-avatars',
    NULL,
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp'],
    '2025-07-25 23:37:49.214191+00',
    '2025-07-25 23:37:49.214191+00'
);

-- =====================================================
-- POLÍTICAS RLS PARA STORAGE
-- =====================================================

-- Políticas para bucket brand-logos
CREATE POLICY "Brand logos are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'brand-logos');

CREATE POLICY "Admins can upload brand logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'brand-logos' 
        AND (auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'superadmin'])
    );

CREATE POLICY "Admins can update brand logos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'brand-logos' 
        AND (auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'superadmin'])
    );

CREATE POLICY "Admins can delete brand logos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'brand-logos' 
        AND (auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'superadmin'])
    );

-- Políticas para bucket category-images
CREATE POLICY "Category images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'category-images');

CREATE POLICY "Admins can upload category images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'category-images' 
        AND (auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'superadmin'])
    );

CREATE POLICY "Admins can update category images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'category-images' 
        AND (auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'superadmin'])
    );

CREATE POLICY "Admins can delete category images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'category-images' 
        AND (auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'superadmin'])
    );

-- Políticas para bucket product-images
CREATE POLICY "Product images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' 
        AND (auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'superadmin'])
    );

CREATE POLICY "Admins can update product images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' 
        AND (auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'superadmin'])
    );

CREATE POLICY "Admins can delete product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' 
        AND (auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'superadmin'])
    );

-- Políticas para bucket user-avatars
CREATE POLICY "User avatars are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- FUNCIONES AUXILIARES PARA STORAGE
-- =====================================================

-- Función para obtener URL de imagen de producto
CREATE OR REPLACE FUNCTION public.get_product_image_url(product_id uuid, image_type text DEFAULT 'primary')
RETURNS text AS $$
DECLARE
    image_url text;
BEGIN
    SELECT pi.image_url INTO image_url
    FROM public.product_images pi
    WHERE pi.product_id = product_id
    AND (
        CASE 
            WHEN image_type = 'primary' THEN pi.is_primary = true
            ELSE true
        END
    )
    ORDER BY pi.sort_order ASC, pi.created_at ASC
    LIMIT 1;
    
    RETURN COALESCE(image_url, '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener URL de logo de marca
CREATE OR REPLACE FUNCTION public.get_brand_logo_url(brand_id uuid)
RETURNS text AS $$
DECLARE
    logo_url text;
BEGIN
    SELECT b.logo_url INTO logo_url
    FROM public.brands b
    WHERE b.id = brand_id;
    
    RETURN COALESCE(logo_url, '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener URL de imagen de categoría
CREATE OR REPLACE FUNCTION public.get_category_image_url(category_id uuid)
RETURNS text AS $$
DECLARE
    image_url text;
BEGIN
    SELECT c.image_url INTO image_url
    FROM public.categories c
    WHERE c.id = category_id;
    
    RETURN COALESCE(image_url, '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener URL de avatar de usuario
CREATE OR REPLACE FUNCTION public.get_user_avatar_url(user_id uuid)
RETURNS text AS $$
DECLARE
    avatar_url text;
BEGIN
    SELECT p.avatar_url INTO avatar_url
    FROM public.profiles p
    WHERE p.id = user_id;
    
    RETURN COALESCE(avatar_url, '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
