# 🗄️ Modelo de Base de Datos CompuParts

## 📋 Resumen Ejecutivo

Este modelo de base de datos PostgreSQL está diseñado específicamente para **CompuParts**, una tienda en línea de componentes de computadora. El esquema está optimizado para Supabase y incluye todas las funcionalidades necesarias para un e-commerce completo.

## 🎯 Funcionalidades Cubiertas

### ✅ **E-commerce Completo**
- Catálogo de productos con categorías y marcas
- Sistema de carrito de compras
- Proceso de checkout completo
- Gestión de pedidos y estados
- Sistema de favoritos
- Reseñas y calificaciones

### ✅ **Gestión de Usuarios**
- Autenticación integrada con Supabase Auth
- Perfiles de usuario extendidos
- Direcciones de envío múltiples
- Historial de pedidos
- Sistema de notificaciones

### ✅ **Panel de Administración**
- Dashboard con estadísticas
- Gestión completa de productos (CRUD)
- Gestión de categorías y marcas
- Gestión de pedidos
- Reportes de ventas

### ✅ **Funcionalidades Avanzadas**
- Sistema de cupones de descuento
- Servicios adicionales
- Variantes de productos
- Búsqueda full-text
- Optimización de imágenes

## 🏗️ Arquitectura del Esquema

### 📊 **Tablas Principales (15 tablas)**

| Tabla | Propósito | Relaciones |
|-------|-----------|------------|
| `profiles` | Perfiles de usuario | Extiende `auth.users` |
| `categories` | Categorías de productos | Referenciada por `products` |
| `brands` | Marcas de productos | Referenciada por `products` |
| `products` | Catálogo principal | Central para el e-commerce |
| `product_images` | Imágenes de productos | Múltiples por producto |
| `product_variants` | Variantes (color, tamaño) | Opcional por producto |
| `cart_items` | Carrito de compras | Por usuario |
| `favorites` | Productos favoritos | Por usuario |
| `shipping_addresses` | Direcciones de envío | Por usuario |
| `orders` | Pedidos de clientes | Central para ventas |
| `order_items` | Items de cada pedido | Detalle de pedidos |
| `reviews` | Reseñas y calificaciones | Por producto/usuario |
| `coupons` | Cupones de descuento | Aplicados a pedidos |
| `coupon_usage` | Uso de cupones | Tracking de uso |
| `notifications` | Notificaciones del sistema | Por usuario |
| `site_settings` | Configuración del sitio | Configuración global |

### 🔐 **Seguridad Integrada**

- **Row Level Security (RLS)** habilitado en todas las tablas
- Políticas de acceso basadas en roles de usuario (cliente, admin, superadmin)
- Integración nativa con Supabase Auth
- Validaciones de datos a nivel de base de datos

### ⚡ **Optimizaciones de Rendimiento**

- **25+ índices** estratégicos para consultas frecuentes
- Búsqueda full-text en español optimizada
- **4 vistas** para reportes complejos
- **11 triggers** automáticos para mantenimiento

## 🚀 Características Técnicas

### **Extensiones Instaladas (5)**
- `uuid-ossp` - Generación de UUIDs
- `pgcrypto` - Funciones criptográficas
- `pg_stat_statements` - Estadísticas de consultas
- `pg_graphql` - Soporte GraphQL
- `supabase_vault` - Almacenamiento seguro

### **Funciones Personalizadas (15+)**
- `generate_order_number()` - Generación automática de números de pedido
- `get_dashboard_stats()` - Estadísticas del dashboard
- `get_orders_with_user_data()` - Pedidos con datos de usuario
- `update_product_stock()` - Actualización automática de stock
- `handle_new_user()` - Manejo de nuevos usuarios
- `get_user_role()` - Obtención de roles de usuario

### **Vistas Optimizadas (4)**
- `bestsellers` - Productos más vendidos
- `orders_with_user_data` - Pedidos con información de usuario
- `products_view` - Vista optimizada de productos
- `sales_stats` - Estadísticas de ventas

### **Triggers Automáticos (11)**
- Actualización automática de timestamps
- Generación automática de números de pedido
- Actualización automática de stock
- Mantenimiento de integridad de datos

## 📁 Estructura de Archivos

```
├── database_schema.sql         # Esquema completo de la BD
├── database_storage.sql        # Configuración de Supabase Storage
├── queries_examples.sql        # Consultas SQL de ejemplo
├── supabase_storage.md         # Documentación de Supabase Storage
└── README_DATABASE.md          # Documentación de la BD
```

## 🛠️ Implementación

### **Paso 1: Crear Proyecto Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota las credenciales del proyecto

### **Paso 2: Ejecutar el Esquema**
1. Ve al **SQL Editor** en tu proyecto Supabase
2. Copia y ejecuta el contenido de [database_schema.sql](database_schema.sql)
3. Verifica que todas las tablas se crearon correctamente

### **Paso 3: Configurar Storage**
```sql
-- Crear buckets para imágenes
-- Configurar políticas de acceso
```
> Para mas información, ver [supabase_storage.md](supabase_storage.md)

## 📊 Datos Iniciales Incluidos

### **Categorías Predefinidas**
- Procesadores
- Tarjetas Gráficas
- Memorias
- Almacenamiento
- Placas Base
- Fuentes de Poder
- Gabinetes
- Monitores

### **Marcas Predefinidas**
- Intel, AMD, NVIDIA
- Corsair, Samsung, ASUS
- EVGA, NZXT, LG

### **Servicios Adicionales**
- Envío exprés
- Garantía extendida
- Instalación profesional
- Soporte técnico premium

### **Configuración del Sitio**
- Información de contacto
- Configuración de envíos
- Métodos de pago
- Funcionalidades habilitadas

## 🔍 Consultas de Ejemplo

El archivo [(queries_examples.sql)](queries_examples.sql) incluye 28 consultas SQL útiles para:

- **Catálogo de productos** (búsqueda, filtros, destacados)
- **Carrito de compras** (items, totales)
- **Favoritos** (gestión de wishlist)
- **Pedidos** (historial, detalles)
- **Reseñas** (calificaciones, estadísticas)
- **Administración** (dashboard, reportes)
- **Cupones** (validación, uso)
- **Notificaciones** (gestión de alertas)

## 📈 Escalabilidad

### **Optimizaciones Incluidas**
- **25+ índices** para consultas frecuentes
- Búsqueda full-text optimizada en español
- **4 vistas** para reportes complejos
- **11 triggers** para mantenimiento automático
- **67 migraciones** aplicadas exitosamente

### **Preparado para Crecimiento**
- Estructura normalizada
- Separación de responsabilidades
- Flexibilidad para nuevas funcionalidades
- Soporte para múltiples idiomas

## 🔒 Seguridad

### **Políticas RLS Implementadas (11 tablas)**
- **profiles**: Usuarios solo ven su propio perfil
- **categories**: Lectura pública, escritura solo admins
- **brands**: Lectura pública, escritura solo admins
- **products**: Lectura pública, escritura solo admins
- **product_images**: Lectura pública, escritura autenticados
- **cart_items**: Usuarios solo ven su propio carrito
- **favorites**: Usuarios solo ven sus favoritos
- **shipping_addresses**: Usuarios solo ven sus direcciones
- **orders**: Usuarios ven sus pedidos, admins ven todos
- **order_items**: Acceso basado en pedidos
- **reviews**: Lectura pública, escritura autenticados

### **Validaciones de Datos**
- Constraints de integridad
- Validación de precios positivos
- Validación de cantidades de stock
- Validación de estados de pedidos
- Validación de roles de usuario

## 📊 Estadísticas del Proyecto

- **15 tablas** principales
- **5 extensiones** instaladas
- **67 migraciones** aplicadas
- **15+ funciones** personalizadas
- **11 triggers** automáticos
- **4 vistas** optimizadas
- **25+ índices** de rendimiento
- **11 políticas RLS** implementadas
