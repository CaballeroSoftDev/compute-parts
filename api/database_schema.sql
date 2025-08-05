-- =====================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS COMPUTEPARTS
-- =====================================================

-- =====================================================
-- EXTENSIONES INSTALADAS
-- =====================================================

-- Extensiones activas en el proyecto
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_graphql" SCHEMA graphql;
CREATE EXTENSION IF NOT EXISTS "supabase_vault" SCHEMA vault;

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de perfiles de usuario (extensión de auth.users)
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text,
    last_name text,
    phone text,
    avatar_url text,
    address text,
    city text,
    postal_code text,
    state text,
    country text DEFAULT 'México',
    is_first_purchase boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    notifications_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    role text DEFAULT 'cliente' CHECK (role = ANY (ARRAY['superadmin', 'admin', 'cliente'])),
    is_admin_created boolean DEFAULT false
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario extendidos desde auth.users';

-- Tabla de categorías de productos
CREATE TABLE public.categories (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL UNIQUE,
    description text,
    slug text UNIQUE,
    image_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de marcas
CREATE TABLE public.brands (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL UNIQUE,
    description text,
    website text,
    logo_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabla principal de productos
CREATE TABLE public.products (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    short_description text,
    category_id uuid REFERENCES public.categories(id),
    brand_id uuid REFERENCES public.brands(id),
    sku text UNIQUE,
    price numeric NOT NULL CHECK (price >= 0),
    compare_price numeric CHECK (compare_price >= 0),
    cost_price numeric CHECK (cost_price >= 0),
    stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold integer DEFAULT 5,
    weight numeric,
    dimensions jsonb COMMENT 'Dimensiones del producto {length, width, height}',
    specifications jsonb COMMENT 'Especificaciones técnicas en formato JSON',
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    is_bestseller boolean DEFAULT false,
    meta_title text,
    meta_description text,
    tags text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Catálogo principal de productos';

-- Tabla de imágenes de productos
CREATE TABLE public.product_images (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    alt_text text,
    sort_order integer DEFAULT 0,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Tabla de variantes de productos
CREATE TABLE public.product_variants (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    name text NOT NULL,
    value text NOT NULL,
    price_adjustment numeric DEFAULT 0,
    stock_quantity integer DEFAULT 0,
    sku text,
    created_at timestamp with time zone DEFAULT now()
);

-- Tabla de items del carrito
CREATE TABLE public.cart_items (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity integer NOT NULL CHECK (quantity > 0),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, product_id, variant_id)
);

COMMENT ON TABLE public.cart_items IS 'Items en el carrito de compras';

-- Tabla de favoritos
CREATE TABLE public.favorites (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, product_id)
);

COMMENT ON TABLE public.favorites IS 'Productos favoritos de los usuarios';

-- Tabla de direcciones de envío
CREATE TABLE public.shipping_addresses (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    address_line_1 text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text DEFAULT 'México',
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabla principal de órdenes
CREATE TABLE public.orders (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number text NOT NULL UNIQUE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_email text,
    guest_name text,
    guest_phone text,
    status text NOT NULL DEFAULT 'Pendiente' CHECK (status = ANY (ARRAY['Pendiente', 'Procesando', 'Enviado', 'Completado', 'Cancelado'])),
    payment_status text NOT NULL DEFAULT 'Pendiente' CHECK (payment_status = ANY (ARRAY['Pendiente', 'Pagado', 'Reembolsado', 'Fallido'])),
    payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['Tarjeta', 'PayPal', 'Transferencia', 'Efectivo'])),
    subtotal numeric NOT NULL CHECK (subtotal >= 0),
    tax_amount numeric DEFAULT 0,
    shipping_amount numeric DEFAULT 0,
    discount_amount numeric DEFAULT 0,
    total_amount numeric NOT NULL CHECK (total_amount >= 0),
    shipping_address_id uuid REFERENCES public.shipping_addresses(id),
    shipping_address jsonb COMMENT 'Dirección completa para respaldo en formato JSON',
    tracking_number text,
    estimated_delivery date,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    payment_details jsonb COMMENT 'Detalles del pago (PayPal, tarjeta, etc.) en formato JSON'
);

COMMENT ON TABLE public.orders IS 'Pedidos de los clientes';

-- Tabla de items de órdenes
CREATE TABLE public.order_items (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    variant_id uuid REFERENCES public.product_variants(id),
    product_name text NOT NULL,
    product_sku text,
    product_image_url text,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric NOT NULL CHECK (unit_price >= 0),
    total_price numeric NOT NULL CHECK (total_price >= 0),
    created_at timestamp with time zone DEFAULT now()
);

-- Tabla de reseñas
CREATE TABLE public.reviews (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title text,
    comment text,
    is_verified_purchase boolean DEFAULT false,
    is_approved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, product_id)
);

COMMENT ON TABLE public.reviews IS 'Calificaciones y reseñas de productos';

-- Tabla de cupones
CREATE TABLE public.coupons (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    discount_type text NOT NULL CHECK (discount_type = ANY (ARRAY['percentage', 'fixed'])),
    discount_value numeric NOT NULL CHECK (discount_value > 0),
    minimum_order_amount numeric DEFAULT 0,
    maximum_discount numeric,
    usage_limit integer,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Tabla de uso de cupones
CREATE TABLE public.coupon_usage (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    discount_amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Tabla de notificaciones
CREATE TABLE public.notifications (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info' CHECK (type = ANY (ARRAY['info', 'success', 'warning', 'error'])),
    is_read boolean DEFAULT false,
    data jsonb COMMENT 'Datos adicionales de la notificación en formato JSON',
    created_at timestamp with time zone DEFAULT now()
);

-- Tabla de configuraciones del sitio
CREATE TABLE public.site_settings (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    key text NOT NULL UNIQUE,
    value jsonb NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índices para productos
CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);
CREATE INDEX idx_products_brand_id ON public.products USING btree (brand_id);
CREATE INDEX idx_products_price ON public.products USING btree (price);
CREATE INDEX idx_products_is_active ON public.products USING btree (is_active);
CREATE INDEX idx_products_is_featured ON public.products USING btree (is_featured);
CREATE INDEX idx_products_created_at ON public.products USING btree (created_at);
CREATE INDEX idx_products_search ON public.products USING gin (to_tsvector('spanish'::regconfig, ((name || ' '::text) || COALESCE(description, ''::text))));

-- Índices para órdenes
CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_payment_status ON public.orders USING btree (payment_status);
CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);
CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);

-- Índices para carrito
CREATE INDEX idx_cart_items_user_id ON public.cart_items USING btree (user_id);

-- Índices para favoritos
CREATE INDEX idx_favorites_user_id ON public.favorites USING btree (user_id);
CREATE INDEX idx_favorites_product_id ON public.favorites USING btree (product_id);

-- Índices para reseñas
CREATE INDEX idx_reviews_product_id ON public.reviews USING btree (product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);
CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating);

-- Índices para perfiles
CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);

-- =====================================================
-- FUNCIONES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de orden
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger AS $$
BEGIN
    NEW.order_number := '#' || LPAD(CAST(nextval('order_number_seq') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar stock de productos
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS trigger AS $$
BEGIN
    -- Actualizar stock del producto
    UPDATE public.products 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Actualizar stock de la variante si existe
    IF NEW.variant_id IS NOT NULL THEN
        UPDATE public.product_variants 
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.variant_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, phone, email_verified, role)
    VALUES (    
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'phone',
        NEW.email_confirmed_at IS NOT NULL,
        COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')
    );  
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar email_verified
CREATE OR REPLACE FUNCTION public.update_email_verified()
RETURNS trigger AS $$
BEGIN
    -- Actualizar el campo email_verified en profiles cuando se confirma el email
    IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
        UPDATE public.profiles 
        SET email_verified = true, updated_at = now()
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener rol del usuario
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Obtener el rol del usuario actual desde la tabla profiles
    SELECT role INTO user_role
    FROM profiles
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Obtener el rol directamente de la tabla profiles usando auth.uid()
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role IN ('admin', 'superadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si es admin user
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Obtener el rol del usuario actual
    user_role := get_user_role_from_profiles();
    
    -- Verificar si es admin o superadmin
    RETURN user_role IN ('admin', 'superadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener rol desde profiles
CREATE OR REPLACE FUNCTION public.get_user_role_from_profiles()
RETURNS text AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Obtener el rol del usuario actual desde la tabla profiles
    SELECT role INTO user_role
    FROM profiles
    WHERE id = auth.uid();
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener email del usuario
CREATE OR REPLACE FUNCTION public.get_user_email(user_id uuid)
RETURNS TABLE(email text) AS $$
BEGIN
  RETURN QUERY
  SELECT au.email::text
  FROM auth.users au
  WHERE au.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener todos los perfiles
CREATE OR REPLACE FUNCTION public.get_all_profiles()
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.profiles ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener perfiles con emails
CREATE OR REPLACE FUNCTION public.get_all_profiles_with_emails()
RETURNS TABLE(
    id uuid, 
    first_name text, 
    last_name text, 
    phone text, 
    role text, 
    email_verified boolean, 
    notifications_enabled boolean, 
    created_at timestamp with time zone, 
    updated_at timestamp with time zone, 
    avatar_url text, 
    address text, 
    city text, 
    postal_code text, 
    state text, 
    country text, 
    is_first_purchase boolean, 
    email character varying
) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.phone,
    p.role,
    p.email_verified,
    p.notifications_enabled,
    p.created_at,
    p.updated_at,
    p.avatar_url,
    p.address,
    p.city,
    p.postal_code,
    p.state,
    p.country,
    p.is_first_purchase,
    u.email
  FROM 
    public.profiles p
  JOIN 
    auth.users u ON p.id = u.id
  ORDER BY 
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(
    total_sales numeric, 
    total_orders bigint, 
    total_products bigint, 
    total_users bigint, 
    recent_orders json, 
    top_products json
) AS $$
DECLARE
  v_total_sales numeric;
  v_total_orders bigint;
  v_total_products bigint;
  v_total_users bigint;
  v_recent_orders json;
  v_top_products json;
BEGIN
  -- Calcular ventas totales
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_sales
  FROM orders;
  
  -- Contar órdenes totales
  SELECT COUNT(*) INTO v_total_orders
  FROM orders;
  
  -- Contar productos totales
  SELECT COUNT(*) INTO v_total_products
  FROM products;
  
  -- Contar usuarios totales
  SELECT COUNT(*) INTO v_total_users
  FROM profiles;
  
  -- Obtener órdenes recientes (últimas 5)
  SELECT json_agg(
    json_build_object(
      'id', order_data.id,
      'order_number', order_data.order_number,
      'customer_name', order_data.customer_name,
      'customer_email', order_data.customer_email,
      'total_amount', order_data.total_amount,
      'status', order_data.status,
      'created_at', order_data.created_at
    )
  ) INTO v_recent_orders
  FROM (
    SELECT 
      o.id,
      o.order_number,
      COALESCE(
        CASE 
          WHEN o.user_id IS NOT NULL AND p.first_name IS NOT NULL AND p.first_name != '' AND p.last_name IS NOT NULL AND p.last_name != ''
          THEN TRIM(p.first_name || ' ' || p.last_name)
          WHEN o.guest_name IS NOT NULL AND o.guest_name != ''
          THEN o.guest_name
          ELSE 'Cliente invitado'
        END,
        'Cliente invitado'
      ) as customer_name,
      COALESCE(au.email, o.guest_email, 'Sin email') as customer_email,
      o.total_amount,
      o.status,
      o.created_at
    FROM orders o
    LEFT JOIN profiles p ON o.user_id = p.id
    LEFT JOIN auth.users au ON o.user_id = au.id
    ORDER BY o.created_at DESC
    LIMIT 5
  ) order_data;
  
  -- Productos más vendidos (simulado por ahora)
  v_top_products := '[
    {"name": "NVIDIA GeForce RTX 4080", "sales": 89, "revenue": 106711},
    {"name": "Intel Core i7-13700K", "sales": 67, "revenue": 26799},
    {"name": "Corsair Vengeance LPX 32GB", "sales": 45, "revenue": 6749},
    {"name": "Samsung 980 PRO 1TB", "sales": 38, "revenue": 7599}
  ]'::json;
  
  RETURN QUERY SELECT 
    v_total_sales,
    v_total_orders,
    v_total_products,
    v_total_users,
    v_recent_orders,
    v_top_products;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener órdenes con datos de usuario
CREATE OR REPLACE FUNCTION public.get_orders_with_user_data(
    p_limit integer DEFAULT 10, 
    p_offset integer DEFAULT 0, 
    p_status text DEFAULT NULL::text, 
    p_payment_status text DEFAULT NULL::text, 
    p_search text DEFAULT NULL::text
)
RETURNS TABLE(
    id uuid, 
    order_number text, 
    user_id uuid, 
    guest_email text, 
    guest_name text, 
    guest_phone text, 
    status text, 
    payment_status text, 
    payment_method text, 
    subtotal numeric, 
    tax_amount numeric, 
    shipping_amount numeric, 
    discount_amount numeric, 
    total_amount numeric, 
    shipping_address_id uuid, 
    shipping_address jsonb, 
    shipping_address_data jsonb, 
    tracking_number text, 
    estimated_delivery date, 
    notes text, 
    created_at timestamp with time zone, 
    updated_at timestamp with time zone, 
    payment_details jsonb, 
    first_name text, 
    last_name text, 
    profile_phone text, 
    role text, 
    user_email text, 
    customer_name text, 
    customer_email text, 
    customer_phone text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.order_number,
        o.user_id,
        o.guest_email,
        o.guest_name,
        o.guest_phone,
        o.status,
        o.payment_status,
        o.payment_method,
        o.subtotal,
        o.tax_amount,
        o.shipping_amount,
        o.discount_amount,
        o.total_amount,
        o.shipping_address_id,
        o.shipping_address,
        CASE 
            WHEN o.shipping_address_id IS NOT NULL THEN (
                SELECT jsonb_build_object(
                    'id', sa.id,
                    'first_name', sa.first_name,
                    'last_name', sa.last_name,
                    'phone', sa.phone,
                    'address_line_1', sa.address_line_1,
                    'city', sa.city,
                    'state', sa.state,
                    'postal_code', sa.postal_code,
                    'country', sa.country
                )
                FROM shipping_addresses sa
                WHERE sa.id = o.shipping_address_id
            )
            ELSE NULL
        END as shipping_address_data,
        o.tracking_number,
        o.estimated_delivery,
        o.notes,
        o.created_at,
        o.updated_at,
        o.payment_details,
        o.first_name,
        o.last_name,
        o.profile_phone,
        o.role,
        o.user_email,
        -- Nombre del cliente (usuario registrado o invitado)
        CASE 
            WHEN o.user_id IS NOT NULL AND o.first_name IS NOT NULL AND o.first_name != '' AND o.last_name IS NOT NULL AND o.last_name != ''
            THEN TRIM(o.first_name || ' ' || o.last_name)
            WHEN o.guest_name IS NOT NULL AND o.guest_name != ''
            THEN o.guest_name
            ELSE 'Cliente invitado'
        END as customer_name,
        -- Email del cliente
        COALESCE(o.user_email, o.guest_email, 'Sin email') as customer_email,
        -- Teléfono del cliente
        COALESCE(o.profile_phone, o.guest_phone, 'Sin teléfono') as customer_phone
    FROM orders_with_user_data o
    WHERE 
        (p_status IS NULL OR o.status = p_status)
        AND (p_payment_status IS NULL OR o.payment_status = p_payment_status)
        AND (
            p_search IS NULL 
            OR o.order_number ILIKE '%' || p_search || '%'
            OR o.guest_name ILIKE '%' || p_search || '%'
            OR o.guest_email ILIKE '%' || p_search || '%'
            OR o.first_name ILIKE '%' || p_search || '%'
            OR o.last_name ILIKE '%' || p_search || '%'
            OR o.user_email ILIKE '%' || p_search || '%'
        )
    ORDER BY o.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipping_addresses_updated_at BEFORE UPDATE ON public.shipping_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para generar número de orden
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- Trigger para actualizar stock
CREATE TRIGGER update_stock_trigger AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_product_stock();

-- =====================================================
-- VISTAS
-- =====================================================

-- Vista de productos con información completa
CREATE VIEW public.products_view AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.short_description,
    p.category_id,
    p.brand_id,
    p.sku,
    p.price,
    p.compare_price,
    p.cost_price,
    p.stock_quantity,
    p.low_stock_threshold,
    p.weight,
    p.dimensions,
    p.specifications,
    p.is_active,
    p.is_featured,
    p.is_bestseller,
    p.meta_title,
    p.meta_description,
    p.tags,
    p.created_at,
    p.updated_at,
    c.name AS category_name,
    c.slug AS category_slug,
    b.name AS brand_name,
    b.logo_url AS brand_logo,
    COALESCE(avg(r.rating), 0::numeric) AS average_rating,
    count(r.id) AS review_count,
    pi.image_url AS primary_image
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = true
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE p.is_active = true
GROUP BY p.id, c.name, c.slug, b.name, b.logo_url, pi.image_url;

-- Vista de órdenes con datos de usuario
CREATE VIEW public.orders_with_user_data AS
SELECT 
    o.id,
    o.order_number,
    o.user_id,
    o.guest_email,
    o.guest_name,
    o.guest_phone,
    o.status,
    o.payment_status,
    o.payment_method,
    o.subtotal,
    o.tax_amount,
    o.shipping_amount,
    o.discount_amount,
    o.total_amount,
    o.shipping_address_id,
    o.shipping_address,
    o.tracking_number,
    o.estimated_delivery,
    o.notes,
    o.created_at,
    o.updated_at,
    o.payment_details,
    p.first_name,
    p.last_name,
    p.phone AS profile_phone,
    p.role,
    au.email::text AS user_email
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
LEFT JOIN auth.users au ON o.user_id = au.id;

-- Vista de productos más vendidos
CREATE VIEW public.bestsellers AS
SELECT 
    p.id,
    p.name,
    p.sku,
    sum(oi.quantity) AS total_sold,
    sum(oi.total_price) AS total_revenue,
    p.stock_quantity
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'Completado'
GROUP BY p.id, p.name, p.sku, p.stock_quantity
ORDER BY sum(oi.quantity) DESC;

-- Vista de estadísticas de ventas
CREATE VIEW public.sales_stats AS
SELECT 
    date_trunc('day'::text, created_at) AS date,
    count(id) AS total_orders,
    sum(total_amount) AS total_revenue,
    avg(total_amount) AS average_order_value,
    count(DISTINCT user_id) AS unique_customers
FROM orders o
WHERE status <> 'Cancelado'
GROUP BY date_trunc('day'::text, created_at)
ORDER BY date_trunc('day'::text, created_at) DESC;

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id) OR ((auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'superadmin'])));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view profiles" ON public.profiles FOR SELECT USING ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY "Superadmin can manage all profiles" ON public.profiles FOR ALL USING ((auth.jwt() ->> 'role') = 'superadmin');

-- Políticas para categorías
CREATE POLICY "Categories are publicly accessible" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (is_admin_user());

-- Políticas para marcas
CREATE POLICY "Brands are publicly accessible" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admins can insert brands" ON public.brands FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admins can update brands" ON public.brands FOR UPDATE USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admins can delete brands" ON public.brands FOR DELETE USING (is_admin_user());

-- Políticas para productos
CREATE POLICY "Products are publicly accessible" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (is_admin_user());

-- Políticas para imágenes de productos
CREATE POLICY "authenticated_read_access" ON public.product_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_full_access" ON public.product_images FOR ALL TO authenticated USING (is_admin());

-- Políticas para carrito
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Políticas para favoritos
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Políticas para direcciones de envío
CREATE POLICY "Enable select for authenticated users" ON public.shipping_addresses FOR SELECT USING ((user_id = auth.uid()) OR (user_id IS NULL));
CREATE POLICY "Enable insert for all" ON public.shipping_addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.shipping_addresses FOR UPDATE USING ((user_id = auth.uid()) OR (user_id IS NULL)) WITH CHECK ((user_id = auth.uid()) OR (user_id IS NULL));

-- Políticas para órdenes
CREATE POLICY "Enable select for users and admins" ON public.orders FOR SELECT USING ((auth.uid() = user_id) OR (user_id IS NULL) OR (auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'admin'))));
CREATE POLICY "Enable insert for all users" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for authenticated users" ON public.orders FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (((auth.jwt() ->> 'role') = ANY (ARRAY['admin', 'superadmin'])));
CREATE POLICY "Service role can insert orders" ON public.orders FOR INSERT WITH CHECK (((auth.jwt() ->> 'role') = 'service_role'));
CREATE POLICY "Service role can update orders" ON public.orders FOR UPDATE USING (((auth.jwt() ->> 'role') = 'service_role'));

-- Políticas para items de órdenes
CREATE POLICY "Enable select for users and admins" ON public.order_items FOR SELECT USING (((EXISTS ( SELECT 1 FROM orders WHERE ((orders.id = order_items.order_id) AND ((orders.user_id = auth.uid()) OR (orders.user_id IS NULL))))) OR (auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'admin'))));
CREATE POLICY "Enable insert for all" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.order_items FOR UPDATE USING ((EXISTS ( SELECT 1 FROM orders WHERE ((orders.id = order_items.order_id) AND ((orders.user_id = auth.uid()) OR (orders.user_id IS NULL)))))) WITH CHECK ((EXISTS ( SELECT 1 FROM orders WHERE ((orders.id = order_items.order_id) AND ((orders.user_id = auth.uid()) OR (orders.user_id IS NULL))))));

-- Políticas para reseñas
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can view own reviews" ON public.reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- SECUENCIA PARA NÚMEROS DE ORDEN
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;
