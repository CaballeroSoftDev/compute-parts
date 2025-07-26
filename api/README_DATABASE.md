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

### 📊 **Tablas Principales**

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
| `orders` | Pedidos de clientes | Central para ventas |
| `order_items` | Items de cada pedido | Detalle de pedidos |
| `reviews` | Reseñas y calificaciones | Por producto/usuario |

### 🔐 **Seguridad Integrada**

- **Row Level Security (RLS)** habilitado en todas las tablas
- Políticas de acceso basadas en roles de usuario
- Integración nativa con Supabase Auth
- Validaciones de datos a nivel de base de datos

### ⚡ **Optimizaciones de Rendimiento**

- Índices estratégicos para consultas frecuentes
- Búsqueda full-text en español
- Vistas materializadas para reportes
- Triggers automáticos para mantenimiento

## 🚀 Características Técnicas

### **Tipos de Datos Avanzados**
```sql
-- JSONB para especificaciones técnicas
specifications JSONB

-- Arrays para tags
tags TEXT[]

-- Campos de búsqueda optimizados
to_tsvector('spanish', name || ' ' || description)
```

### **Funciones Automáticas**
- Generación automática de números de pedido
- Actualización automática de stock
- Creación automática de perfiles
- Timestamps automáticos

### **Integridad de Datos**
- Constraints de validación
- Foreign keys con cascade
- Check constraints para valores válidos
- Unique constraints donde corresponde

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
- Índices para consultas frecuentes
- Búsqueda full-text optimizada
- Vistas para reportes complejos
- Triggers para mantenimiento automático

### **Preparado para Crecimiento**
- Estructura normalizada
- Separación de responsabilidades
- Flexibilidad para nuevas funcionalidades
- Soporte para múltiples idiomas

## 🔒 Seguridad

### **Políticas RLS Implementadas**
- Usuarios solo ven sus propios datos
- Productos visibles públicamente
- Administradores tienen acceso completo
- Reseñas aprobadas visibles públicamente

### **Validaciones de Datos**
- Constraints de integridad
- Validación de precios positivos
- Validación de cantidades de stock
- Validación de estados de pedidos
