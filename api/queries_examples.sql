-- =====================================================
-- EJEMPLOS DE CONSULTAS SQL PARA COMPUPARTS
-- Consultas útiles para las funcionalidades principales
-- =====================================================

-- =====================================================
-- CONSULTAS PARA CATÁLOGO DE PRODUCTOS
-- =====================================================

-- 1. Obtener productos con información completa (para catálogo)
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.stock_quantity,
    p.is_featured,
    c.name as category_name,
    b.name as brand_name,
    pi.image_url as primary_image,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(r.id) as review_count
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_primary = true
LEFT JOIN public.reviews r ON p.id = r.product_id AND r.is_approved = true
WHERE p.is_active = true
GROUP BY p.id, c.name, b.name, pi.image_url
ORDER BY p.is_featured DESC, p.created_at DESC;

-- 2. Búsqueda de productos con filtros
SELECT 
    p.*,
    c.name as category_name,
    b.name as brand_name,
    pi.image_url as primary_image
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE p.is_active = true
    AND (p.name ILIKE '%procesador%' OR p.description ILIKE '%procesador%')
    AND p.price BETWEEN 1000 AND 5000
    AND c.name = 'Procesadores'
    AND b.name = 'Intel'
ORDER BY p.price ASC;

-- 3. Productos destacados
SELECT 
    p.id,
    p.name,
    p.price,
    p.stock_quantity,
    c.name as category_name,
    b.name as brand_name,
    pi.image_url as primary_image
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE p.is_active = true 
    AND p.is_featured = true
    AND p.stock_quantity > 0
ORDER BY p.created_at DESC
LIMIT 8;

-- 4. Productos más vendidos
SELECT 
    p.id,
    p.name,
    p.price,
    SUM(oi.quantity) as total_sold,
    SUM(oi.total_price) as total_revenue
FROM public.products p
JOIN public.order_items oi ON p.id = oi.product_id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status = 'Completado'
    AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, p.price
ORDER BY total_sold DESC
LIMIT 10;

-- =====================================================
-- CONSULTAS PARA CARRITO DE COMPRAS
-- =====================================================

-- 5. Obtener items del carrito de un usuario
SELECT 
    ci.id,
    ci.quantity,
    p.id as product_id,
    p.name as product_name,
    p.price,
    p.stock_quantity,
    pi.image_url as product_image,
    c.name as category_name,
    b.name as brand_name,
    (ci.quantity * p.price) as total_price
FROM public.cart_items ci
JOIN public.products p ON ci.product_id = p.id
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_primary = true
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.brands b ON p.brand_id = b.id
WHERE ci.user_id = 'user-uuid-here'
ORDER BY ci.created_at DESC;

-- 6. Calcular total del carrito
SELECT 
    SUM(ci.quantity * p.price) as subtotal,
    COUNT(ci.id) as total_items
FROM public.cart_items ci
JOIN public.products p ON ci.product_id = p.id
WHERE ci.user_id = 'user-uuid-here';

-- =====================================================
-- CONSULTAS PARA FAVORITOS
-- =====================================================

-- 7. Obtener favoritos de un usuario
SELECT 
    f.id as favorite_id,
    p.id as product_id,
    p.name,
    p.price,
    p.stock_quantity,
    pi.image_url as product_image,
    c.name as category_name,
    b.name as brand_name
FROM public.favorites f
JOIN public.products p ON f.product_id = p.id
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_primary = true
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.brands b ON p.brand_id = b.id
WHERE f.user_id = 'user-uuid-here'
ORDER BY f.created_at DESC;

-- =====================================================
-- CONSULTAS PARA PEDIDOS
-- =====================================================

-- 8. Obtener pedidos de un usuario
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.payment_status,
    o.total_amount,
    o.created_at,
    COUNT(oi.id) as total_items
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
WHERE o.user_id = 'user-uuid-here'
GROUP BY o.id, o.order_number, o.status, o.payment_status, o.total_amount, o.created_at
ORDER BY o.created_at DESC;

-- 9. Detalles completos de un pedido
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.payment_status,
    o.payment_method,
    o.subtotal,
    o.tax_amount,
    o.shipping_amount,
    o.discount_amount,
    o.total_amount,
    o.tracking_number,
    o.created_at,
    o.shipping_address,
    -- Items del pedido
    json_agg(
        json_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price,
            'product_image', oi.product_image_url
        )
    ) as items
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
WHERE o.id = 'order-uuid-here'
GROUP BY o.id, o.order_number, o.status, o.payment_status, o.payment_method, 
         o.subtotal, o.tax_amount, o.shipping_amount, o.discount_amount, 
         o.total_amount, o.tracking_number, o.created_at, o.shipping_address;

-- 10. Pedidos recientes para dashboard
SELECT 
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at,
    p.first_name || ' ' || p.last_name as customer_name,
    p.email as customer_email
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
WHERE o.created_at >= NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC
LIMIT 10;

-- =====================================================
-- CONSULTAS PARA RESEÑAS
-- =====================================================

-- 11. Reseñas de un producto
SELECT 
    r.id,
    r.rating,
    r.title,
    r.comment,
    r.is_verified_purchase,
    r.created_at,
    p.first_name || ' ' || p.last_name as customer_name,
    p.avatar_url as customer_avatar
FROM public.reviews r
JOIN public.profiles p ON r.user_id = p.id
WHERE r.product_id = 'product-uuid-here'
    AND r.is_approved = true
ORDER BY r.created_at DESC;

-- 12. Estadísticas de reseñas de un producto
SELECT 
    COUNT(*) as total_reviews,
    AVG(rating) as average_rating,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
FROM public.reviews r
WHERE r.product_id = 'product-uuid-here'
    AND r.is_approved = true;

-- =====================================================
-- CONSULTAS PARA ADMINISTRACIÓN
-- =====================================================

-- 13. Estadísticas del dashboard
SELECT 
    -- Total de pedidos
    COUNT(*) as total_orders,
    -- Pedidos del mes actual
    COUNT(CASE WHEN created_at >= DATE_TRUNC('month', NOW()) THEN 1 END) as orders_this_month,
    -- Ingresos totales
    SUM(total_amount) as total_revenue,
    -- Ingresos del mes
    SUM(CASE WHEN created_at >= DATE_TRUNC('month', NOW()) THEN total_amount ELSE 0 END) as revenue_this_month,
    -- Pedidos pendientes
    COUNT(CASE WHEN status = 'Pendiente' THEN 1 END) as pending_orders,
    -- Pedidos procesando
    COUNT(CASE WHEN status = 'Procesando' THEN 1 END) as processing_orders
FROM public.orders
WHERE status != 'Cancelado';

-- 14. Productos con stock bajo
SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock_quantity,
    p.low_stock_threshold,
    c.name as category_name,
    b.name as brand_name
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.brands b ON p.brand_id = b.id
WHERE p.stock_quantity <= p.low_stock_threshold
    AND p.is_active = true
ORDER BY p.stock_quantity ASC;

-- 15. Ventas por categoría
SELECT 
    c.name as category_name,
    COUNT(oi.id) as total_items_sold,
    SUM(oi.total_price) as total_revenue,
    AVG(oi.unit_price) as average_price
FROM public.order_items oi
JOIN public.products p ON oi.product_id = p.id
JOIN public.categories c ON p.category_id = c.id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status = 'Completado'
    AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;

-- 16. Clientes más activos
SELECT 
    p.first_name || ' ' || p.last_name as customer_name,
    p.email,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_spent,
    AVG(o.total_amount) as average_order_value,
    MAX(o.created_at) as last_order_date
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
WHERE o.status != 'Cancelado'
GROUP BY p.id, p.first_name, p.last_name, p.email
ORDER BY total_spent DESC
LIMIT 10;

-- =====================================================
-- CONSULTAS PARA CUPONES
-- =====================================================

-- 17. Validar cupón
SELECT 
    id,
    name,
    description,
    discount_type,
    discount_value,
    minimum_order_amount,
    maximum_discount,
    usage_limit,
    used_count,
    valid_from,
    valid_until
FROM public.coupons
WHERE code = 'CUPON123'
    AND is_active = true
    AND NOW() BETWEEN valid_from AND COALESCE(valid_until, NOW() + INTERVAL '1 day')
    AND (usage_limit IS NULL OR used_count < usage_limit);

-- 18. Cupones usados por usuario
SELECT 
    c.name as coupon_name,
    c.code as coupon_code,
    cu.discount_amount,
    o.order_number,
    cu.created_at as used_date
FROM public.coupon_usage cu
JOIN public.coupons c ON cu.coupon_id = c.id
JOIN public.orders o ON cu.order_id = o.id
WHERE cu.user_id = 'user-uuid-here'
ORDER BY cu.created_at DESC;

-- =====================================================
-- CONSULTAS PARA NOTIFICACIONES
-- =====================================================

-- 19. Notificaciones no leídas de un usuario
SELECT 
    id,
    title,
    message,
    type,
    created_at,
    data
FROM public.notifications
WHERE user_id = 'user-uuid-here'
    AND is_read = false
ORDER BY created_at DESC;

-- 20. Contar notificaciones no leídas
SELECT COUNT(*) as unread_count
FROM public.notifications
WHERE user_id = 'user-uuid-here'
    AND is_read = false;

-- =====================================================
-- CONSULTAS PARA BÚSQUEDA AVANZADA
-- =====================================================

-- 21. Búsqueda full-text en productos
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    c.name as category_name,
    b.name as brand_name,
    ts_rank(to_tsvector('spanish', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('spanish', 'procesador intel')) as rank
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.brands b ON p.brand_id = b.id
WHERE to_tsvector('spanish', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('spanish', 'procesador intel')
    AND p.is_active = true
ORDER BY rank DESC;

-- 22. Productos relacionados (misma categoría)
SELECT 
    p.id,
    p.name,
    p.price,
    pi.image_url as product_image,
    COUNT(r.id) as review_count,
    COALESCE(AVG(r.rating), 0) as average_rating
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_primary = true
LEFT JOIN public.reviews r ON p.id = r.product_id AND r.is_approved = true
WHERE p.category_id = (
    SELECT category_id 
    FROM public.products 
    WHERE id = 'product-uuid-here'
)
    AND p.id != 'product-uuid-here'
    AND p.is_active = true
GROUP BY p.id, p.name, p.price, pi.image_url
ORDER BY average_rating DESC, review_count DESC
LIMIT 6;

-- =====================================================
-- CONSULTAS PARA REPORTES
-- =====================================================

-- 23. Ventas por día (últimos 30 días)
SELECT 
    DATE(created_at) as date,
    COUNT(*) as orders,
    SUM(total_amount) as revenue,
    AVG(total_amount) as average_order_value
FROM public.orders
WHERE created_at >= NOW() - INTERVAL '30 days'
    AND status != 'Cancelado'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 24. Productos más vendidos por período
SELECT 
    p.name,
    p.sku,
    SUM(oi.quantity) as units_sold,
    SUM(oi.total_price) as revenue,
    COUNT(DISTINCT o.id) as orders_count
FROM public.order_items oi
JOIN public.products p ON oi.product_id = p.id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
    AND o.status = 'Completado'
GROUP BY p.id, p.name, p.sku
ORDER BY units_sold DESC
LIMIT 20;

-- 25. Métodos de pago más populares
SELECT 
    payment_method,
    COUNT(*) as usage_count,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value
FROM public.orders
WHERE status != 'Cancelado'
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY payment_method
ORDER BY usage_count DESC;

-- =====================================================
-- CONSULTAS PARA OPTIMIZACIÓN
-- =====================================================

-- 26. Productos sin imágenes
SELECT 
    p.id,
    p.name,
    p.sku,
    c.name as category_name
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.product_images pi ON p.id = pi.product_id
WHERE pi.id IS NULL
    AND p.is_active = true;

-- 27. Productos sin descripción
SELECT 
    p.id,
    p.name,
    p.sku,
    c.name as category_name
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
WHERE p.description IS NULL OR p.description = ''
    AND p.is_active = true;

-- 28. Usuarios inactivos (sin pedidos en 90 días)
SELECT 
    p.id,
    p.first_name || ' ' || p.last_name as customer_name,
    p.email,
    MAX(o.created_at) as last_order_date
FROM public.profiles p
LEFT JOIN public.orders o ON p.id = o.user_id
GROUP BY p.id, p.first_name, p.last_name, p.email
HAVING MAX(o.created_at) < NOW() - INTERVAL '90 days'
    OR MAX(o.created_at) IS NULL
ORDER BY last_order_date ASC NULLS FIRST; 