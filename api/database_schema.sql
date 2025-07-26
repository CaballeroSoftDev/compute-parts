-- =====================================================
-- ESQUEMA DE BASE DE DATOS COMPUPARTS
-- Optimizado para Supabase con RLS y autenticación
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de perfiles de usuario (extensión de auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    state TEXT,
    country TEXT DEFAULT 'México',
    is_first_purchase BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías de productos
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    slug TEXT UNIQUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de marcas
CREATE TABLE public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    sku TEXT UNIQUE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(10,2) CHECK (compare_price >= 0),
    cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 5,
    weight DECIMAL(8,2),
    dimensions JSONB, -- {length, width, height}
    specifications JSONB, -- Especificaciones técnicas
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de imágenes de productos
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de variantes de productos (tamaños, colores, etc.)
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Color", "Tamaño", etc.
    value TEXT NOT NULL, -- "Rojo", "XL", etc.
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    sku TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de carrito de compras
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id)
);

-- Tabla de favoritos
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Tabla de direcciones de envío
CREATE TABLE public.shipping_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'México',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL, -- #3210, #3209, etc.
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_email TEXT, -- Para usuarios no registrados
    guest_name TEXT,
    guest_phone TEXT,
    status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Procesando', 'Enviado', 'Completado', 'Cancelado')),
    payment_status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (payment_status IN ('Pendiente', 'Pagado', 'Reembolsado', 'Fallido')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Tarjeta', 'PayPal', 'Transferencia', 'Efectivo')),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    shipping_address_id UUID REFERENCES public.shipping_addresses(id),
    shipping_address JSONB, -- Dirección completa para respaldo
    tracking_number TEXT,
    estimated_delivery DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items del pedido
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL, -- Respaldo del nombre del producto
    product_sku TEXT,
    product_image_url TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de servicios adicionales
CREATE TABLE public.additional_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de servicios en pedidos
CREATE TABLE public.order_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.additional_services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL, -- Respaldo del nombre del servicio
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de calificaciones y reseñas
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Tabla de cupones de descuento
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de uso de cupones
CREATE TABLE public.coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    data JSONB, -- Datos adicionales
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración del sitio
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para productos
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_created_at ON public.products(created_at);
CREATE INDEX idx_products_search ON public.products USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

-- Índices para pedidos
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);

-- Índices para carrito y favoritos
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_product_id ON public.favorites(product_id);

-- Índices para reseñas
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_addresses_updated_at BEFORE UPDATE ON public.shipping_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de pedido automáticamente
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := '#' || LPAD(CAST(nextval('order_number_seq') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Secuencia para números de pedido
CREATE SEQUENCE order_number_seq START 3200;

-- Trigger para generar número de pedido
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Función para actualizar stock al crear pedido
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
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
$$ language 'plpgsql';

-- Trigger para actualizar stock
CREATE TRIGGER update_stock_trigger AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Función para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email_verified)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.email_confirmed_at IS NOT NULL
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
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
ALTER TABLE public.additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para productos (lectura pública, escritura solo admin)
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products are insertable by admin" ON public.products FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Products are updatable by admin" ON public.products FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Products are deletable by admin" ON public.products FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para carrito
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Políticas para favoritos
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Políticas para pedidos
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para reseñas
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can view own reviews" ON public.reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar categorías iniciales
INSERT INTO public.categories (name, description, slug, sort_order) VALUES
('Procesadores', 'Procesadores Intel y AMD para computadoras', 'procesadores', 1),
('Tarjetas Gráficas', 'Tarjetas gráficas NVIDIA y AMD', 'tarjetas-graficas', 2),
('Memorias', 'Memoria RAM DDR4 y DDR5', 'memorias', 3),
('Almacenamiento', 'SSDs y discos duros', 'almacenamiento', 4),
('Placas Base', 'Motherboards para diferentes sockets', 'placas-base', 5),
('Fuentes de Poder', 'Fuentes de alimentación certificadas', 'fuentes-de-poder', 6),
('Gabinetes', 'Gabinetes y cajas para PC', 'gabinetes', 7),
('Monitores', 'Monitores gaming y profesionales', 'monitores', 8);

-- Insertar marcas iniciales
INSERT INTO public.brands (name, description, website) VALUES
('Intel', 'Procesadores Intel Core', 'https://www.intel.com'),
('AMD', 'Procesadores AMD Ryzen', 'https://www.amd.com'),
('NVIDIA', 'Tarjetas gráficas NVIDIA', 'https://www.nvidia.com'),
('Corsair', 'Memoria RAM y periféricos', 'https://www.corsair.com'),
('Samsung', 'SSDs y almacenamiento', 'https://www.samsung.com'),
('ASUS', 'Placas base y componentes', 'https://www.asus.com'),
('EVGA', 'Fuentes de poder y tarjetas gráficas', 'https://www.evga.com'),
('NZXT', 'Gabinetes y refrigeración', 'https://nzxt.com'),
('LG', 'Monitores y displays', 'https://www.lg.com');

-- Insertar servicios adicionales
INSERT INTO public.additional_services (name, description, price) VALUES
('Envío exprés', 'Recibe tu pedido en 24 horas', 199.00),
('Garantía extendida', 'Extiende la garantía por 2 años adicionales', 499.00),
('Instalación profesional', 'Instalación y configuración por técnicos', 299.00),
('Soporte técnico premium', 'Soporte técnico prioritario por 1 año', 199.00);

-- Insertar configuración del sitio
INSERT INTO public.site_settings (key, value, description) VALUES
('site_info', '{"name": "CompuParts", "description": "Tu tienda de confianza para componentes de computadora", "email": "contacto@compuparts.com", "phone": "+52 999 123 4567"}', 'Información general del sitio'),
('shipping', '{"free_shipping_threshold": 1500, "standard_shipping_cost": 150, "express_shipping_cost": 199, "free_shipping_first_purchase": true}', 'Configuración de envíos'),
('payment', '{"methods": ["card", "paypal", "cash"], "currency": "MXN", "tax_rate": 0.16}', 'Configuración de pagos'),
('features', '{"reviews_enabled": true, "wishlist_enabled": true, "coupons_enabled": true, "guest_checkout": true}', 'Funcionalidades habilitadas');

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para productos con información completa
CREATE VIEW public.products_view AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    b.name as brand_name,
    b.logo_url as brand_logo,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(r.id) as review_count,
    pi.image_url as primary_image
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.reviews r ON p.id = r.product_id AND r.is_approved = true
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE p.is_active = true
GROUP BY p.id, c.name, c.slug, b.name, b.logo_url, pi.image_url;

-- Vista para estadísticas de ventas
CREATE VIEW public.sales_stats AS
SELECT 
    DATE_TRUNC('day', o.created_at) as date,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_revenue,
    AVG(o.total_amount) as average_order_value,
    COUNT(DISTINCT o.user_id) as unique_customers
FROM public.orders o
WHERE o.status != 'Cancelado'
GROUP BY DATE_TRUNC('day', o.created_at)
ORDER BY date DESC;

-- Vista para productos más vendidos
CREATE VIEW public.bestsellers AS
SELECT 
    p.id,
    p.name,
    p.sku,
    SUM(oi.quantity) as total_sold,
    SUM(oi.total_price) as total_revenue,
    p.stock_quantity
FROM public.products p
JOIN public.order_items oi ON p.id = oi.product_id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status = 'Completado'
GROUP BY p.id, p.name, p.sku, p.stock_quantity
ORDER BY total_sold DESC;

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario extendidos desde auth.users';
COMMENT ON TABLE public.products IS 'Catálogo principal de productos';
COMMENT ON TABLE public.orders IS 'Pedidos de los clientes';
COMMENT ON TABLE public.cart_items IS 'Items en el carrito de compras';
COMMENT ON TABLE public.favorites IS 'Productos favoritos de los usuarios';
COMMENT ON TABLE public.reviews IS 'Calificaciones y reseñas de productos';

COMMENT ON COLUMN public.products.specifications IS 'Especificaciones técnicas en formato JSON';
COMMENT ON COLUMN public.products.dimensions IS 'Dimensiones del producto {length, width, height}';
COMMENT ON COLUMN public.orders.shipping_address IS 'Dirección completa para respaldo en formato JSON';
COMMENT ON COLUMN public.notifications.data IS 'Datos adicionales de la notificación en formato JSON'; 