# 🚀 Edge Functions - Supabase

Este directorio contiene las **Edge Functions** desplegadas en Supabase para el procesamiento de pagos y gestión de órdenes.

## 📋 Funciones Disponibles

### 1. `capture-payment`
**Propósito:** Captura pagos autorizados de PayPal
- **Endpoint:** `/functions/v1/capture-payment`
- **Método:** POST
- **Función:** Finaliza transacciones de PayPal capturando fondos autorizados
- **Variables de entorno requeridas:**
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`

### 2. `create-paypal-order`
**Propósito:** Crea órdenes de pago en PayPal
- **Endpoint:** `/functions/v1/create-paypal-order`
- **Método:** POST
- **Función:** Inicia el proceso de pago creando una orden en PayPal
- **Variables de entorno requeridas:**
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`
  - `NEXT_PUBLIC_APP_URL`

### 3. `create-cash-order`
**Propósito:** Crea órdenes de pago en efectivo
- **Endpoint:** `/functions/v1/create-cash-order`
- **Método:** POST
- **Función:** Procesa órdenes que serán pagadas en efectivo
- **Variables de entorno requeridas:**
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 🔧 Configuración

### Variables de Entorno Necesarias
```bash
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# PayPal (para funciones de pago)
PAYPAL_CLIENT_ID=tu-paypal-client-id
PAYPAL_CLIENT_SECRET=tu-paypal-client-secret

# Aplicación
NEXT_PUBLIC_APP_URL=https://tu-app.com
```

## 🛡️ Seguridad

- Todas las funciones verifican autenticación JWT
- Validación de datos de entrada
- Manejo de errores robusto
- Headers CORS configurados

## 📊 Monitoreo

- Logs disponibles en Supabase Dashboard
- Métricas de rendimiento automáticas
- Alertas de errores configuradas

## 🚀 Despliegue

Las funciones se despliegan automáticamente desde el directorio `supabase/functions/` usando:
```bash
supabase functions deploy
```

## 📝 Notas

- **Versión actual:** Todas las funciones están activas
- **Lenguaje:** TypeScript con Deno runtime
- **Tiempo de ejecución:** Máximo 10 segundos por función
- **Memoria:** 128MB por función 