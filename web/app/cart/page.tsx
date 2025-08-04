'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/lib/hooks/use-cart';
import { useAuthOrders } from '@/lib/hooks/use-auth-orders';
import { PayPalButton } from '@/components/ui/paypal-button';
import { ShippingAddressSelector } from '@/components/ui/shipping-address-selector';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';
import { CartService } from '@/lib/services/cart-service';
import { supabase } from '@/lib/supabase';
import { Trash2, Package, Truck, CreditCard, DollarSign } from 'lucide-react';

export default function CartPage() {
  const { items, loading, updateQuantity, removeFromCart, calculateTotals } = useCart();
  const { createOrder, creating } = useAuthOrders();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [shippingMethod, setShippingMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [isFirstPurchase, setIsFirstPurchase] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string | null>(null);

  // Formulario de dirección (para envío sin dirección guardada)
  const [shippingAddress, setShippingAddress] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address_line_1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'México',
  });

  // Verificar si es primera compra
  useEffect(() => {
    const checkFirstPurchase = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_first_purchase')
            .eq('id', user.id)
            .single();

          setIsFirstPurchase(profile?.is_first_purchase || false);
        }
      } catch (error) {
        console.error('Error verificando primera compra:', error);
      }
    };

    checkFirstPurchase();
  }, []);

  // Cálculos
  const { subtotal, total, itemCount } = calculateTotals();
  const shippingCost = shippingMethod === 'delivery' ? (isFirstPurchase ? 0 : 150) : 0;
  const finalTotal = subtotal + shippingCost;

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handlePayPalSuccess = async (data: any) => {
    try {
      // La orden ya se creó en Supabase durante la captura del pago
      // Limpiar el carrito después del pago exitoso
      console.log('🛒 Limpiando carrito después del pago exitoso...');

      try {
        await CartService.clearCart();
        console.log('✅ Carrito limpiado exitosamente');
      } catch (clearCartError) {
        console.error('❌ Error limpiando carrito:', clearCartError);
        // No lanzar error aquí para no interrumpir el flujo de éxito
      }

      toast({
        title: '¡Pago exitoso!',
        description: 'Tu orden ha sido procesada correctamente. El carrito ha sido limpiado.',
      });

      // Redirigir a la página de órdenes (la orden se creó en la captura)
      window.location.href = `/orders`;
    } catch (error) {
      console.error('Error procesando pago exitoso:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al procesar el pago',
        variant: 'destructive',
      });
    }
  };

  const handleCashPayment = async () => {
    try {
      setProcessingPayment(true);

      // Validar dirección de envío si es requerida
      if (shippingMethod === 'delivery' && !selectedShippingAddressId) {
        toast({
          title: 'Dirección de envío requerida',
          description: 'Debes seleccionar una dirección de envío para continuar',
          variant: 'destructive',
        });
        return;
      }

      const orderData = {
        payment_method: 'Efectivo' as const,
        shipping_method: shippingMethod as 'pickup' | 'delivery',
        shipping_address: shippingMethod === 'delivery' ? shippingAddress : undefined,
        notes: 'Pago en efectivo - QR para tienda',
        items: items.map((item) => ({
          product_id: item.product_id,
          name: item.product?.name || 'Producto',
          price: item.product?.price || 0,
          quantity: item.quantity,
          image_url: item.product?.product_images?.[0]?.image_url,
        })),
      };

      const order = await createOrder(orderData);

      // Limpiar el carrito después de crear la orden exitosamente
      console.log('🛒 Limpiando carrito después de crear orden...');

      try {
        await CartService.clearCart();
        console.log('✅ Carrito limpiado exitosamente');
      } catch (clearCartError) {
        console.error('❌ Error limpiando carrito:', clearCartError);
        // No lanzar error aquí para no interrumpir el flujo de éxito
      }

      toast({
        title: '¡Orden creada!',
        description: 'Tu orden ha sido creada. Paga en tienda con el QR. El carrito ha sido limpiado.',
      });

      // Redirigir a la página de confirmación
      window.location.href = `/orders/${order.id}`;
    } catch (error) {
      console.error('Error creando orden:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al crear la orden',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // Si el usuario no está autenticado, mostrar mensaje simplificado
  if (!authLoading && !user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6">
              <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Carrito de Compras</h1>
              <p className="mb-6 text-gray-600">Debes iniciar sesión para ver tu carrito de compras</p>
            </div>

            <div className="space-y-4">
              <Link href="/login">
                <Button className="w-full">Iniciar Sesión</Button>
              </Link>

              <div className="pt-4">
                <Link
                  href="/catalog"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Si no hay items en el carrito
  if (!loading && items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6">
              <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Carrito Vacío</h1>
              <p className="mb-6 text-gray-600">No tienes productos en tu carrito de compras</p>
            </div>

            <Link href="/catalog">
              <Button className="w-full">Continuar Comprando</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Carrito de compras */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Carrito de Compras ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex animate-pulse gap-4"
                      >
                        <div className="h-20 w-20 rounded bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                          <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 rounded-lg border p-4"
                      >
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                          {item.product?.product_images?.[0]?.image_url ? (
                            <img
                              src={item.product.product_images[0].image_url}
                              alt={item.product.name}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product?.name || 'Producto'}</h3>
                          <p className="text-sm text-gray-600">{item.product?.sku}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            MX${((item.product?.price || 0) * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">MX${(item.product?.price || 0).toLocaleString()} c/u</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Método de envío */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Método de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="pickup"
                        id="pickup"
                      />
                      <Label
                        htmlFor="pickup"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Package className="h-4 w-4" />
                        Recoger en tienda (Gratis)
                      </Label>
                      <p className="ml-6 text-sm text-gray-600">
                        Listo en 2 días hábiles. Tienes 2 días para recoger tu pedido.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="delivery"
                        id="delivery"
                      />
                      <Label
                        htmlFor="delivery"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Truck className="h-4 w-4" />
                        Envío a domicilio {isFirstPurchase ? '(Gratis en tu primera compra)' : ''}
                      </Label>
                      <p className="ml-6 text-sm text-gray-600">Solo disponible en la zona sur de México.</p>
                    </div>
                  </div>
                </RadioGroup>

                {/* Dirección de envío */}
                {shippingMethod === 'delivery' && (
                  <div className="mt-4">
                    <h3 className="mb-3 font-medium">Dirección</h3>
                    <ShippingAddressSelector
                      selectedAddressId={selectedShippingAddressId || undefined}
                      onAddressSelect={setSelectedShippingAddressId}
                      onAddressChange={(address) => {
                        // Actualizar el formulario de dirección con los datos seleccionados
                        setShippingAddress({
                          first_name: address.first_name,
                          last_name: address.last_name,
                          phone: address.phone || '',
                          address_line_1: address.address_line_1,
                          city: address.city,
                          state: address.state,
                          postal_code: address.postal_code,
                          country: address.country,
                        });
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumen y pago */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Método de pago */}
                <div>
                  <h3 className="mb-3 font-medium">Método de Pago</h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="paypal"
                          id="paypal"
                        />
                        <Label
                          htmlFor="paypal"
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          PayPal
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="cash"
                          id="cash"
                        />
                        <Label
                          htmlFor="cash"
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <DollarSign className="h-4 w-4" />
                          Efectivo (QR)
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Resumen de costos */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>MX${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>
                      {shippingCost === 0 ? (
                        <Badge variant="secondary">Gratis</Badge>
                      ) : (
                        `MX$${shippingCost.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>MX${finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Botones de pago */}
                <div className="space-y-3">
                  {paymentMethod === 'paypal' && (
                    <PayPalButton
                      amount={finalTotal}
                      currency="MXN"
                      disabled={creating || processingPayment}
                      className="w-full"
                      cartItems={items.map((item) => ({
                        id: item.product_id,
                        name: item.product?.name || 'Producto',
                        price: item.product?.price || 0,
                        quantity: item.quantity,
                        image_url: item.product?.product_images?.[0]?.image_url,
                      }))}
                      orderData={{
                        payment_method: 'PayPal',
                        shipping_method: shippingMethod,
                        shipping_address: shippingMethod === 'delivery' ? shippingAddress : undefined,
                        notes: 'Pago con PayPal',
                        items: items.map((item) => ({
                          product_id: item.product_id,
                          name: item.product?.name || 'Producto',
                          price: item.product?.price || 0,
                          quantity: item.quantity,
                          image_url: item.product?.product_images?.[0]?.image_url,
                        })),
                      }}
                      onSuccess={handlePayPalSuccess}
                      requireShippingAddress={shippingMethod === 'delivery'}
                      selectedShippingAddressId={selectedShippingAddressId || undefined}
                    />
                  )}

                  {paymentMethod === 'cash' && (
                    <Button
                      onClick={handleCashPayment}
                      disabled={creating || processingPayment}
                      className="w-full"
                    >
                      {processingPayment ? 'Procesando...' : 'Pagar en Efectivo'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
