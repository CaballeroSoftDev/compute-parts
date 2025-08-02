'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Trash2, ChevronLeft, CreditCard, Wallet, QrCode } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

// Datos de ejemplo
const cartItems = [
  {
    id: 1,
    name: 'Procesador Intel Core i7-12700K',
    price: 7999,
    quantity: 1,
    image: '/placeholder.svg?height=100&width=100',
  },
  {
    id: 2,
    name: 'Memoria RAM Corsair Vengeance 16GB',
    price: 1499,
    quantity: 2,
    image: '/placeholder.svg?height=100&width=100',
  },
];

const additionalServices = [
  {
    id: 'express',
    name: 'Envío exprés',
    description: 'Recibe tu pedido en 24 horas',
    price: 199,
  },
  {
    id: 'warranty',
    name: 'Garantía extendida',
    description: 'Extiende la garantía por 2 años adicionales',
    price: 499,
  },
];

export default function CartPage() {
  const [items, setItems] = useState(cartItems);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [shippingMethod, setShippingMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((serviceId) => serviceId !== id) : [...prev, id]));
  };

  // Cálculos
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const servicesTotal = selectedServices.reduce((sum, serviceId) => {
    const service = additionalServices.find((s) => s.id === serviceId);
    return sum + (service?.price || 0);
  }, 0);
  const shippingCost = shippingMethod === 'delivery' ? 150 : 0;
  const total = subtotal + servicesTotal + shippingCost;

  // Verificar si es primera compra (simulado)
  const isFirstPurchase = true;

  return (
    <MainLayout showNavigation={false}>
      <div className="container py-6 md:py-10">
        <div className="mb-6">
          <Link
            href="/catalog"
            className="inline-flex items-center text-sm text-[#007BFF] hover:underline"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Continuar comprando
          </Link>
        </div>

        <h1 className="mb-6 text-2xl font-bold">Carrito de Compras</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-2 text-lg font-medium">Tu carrito está vacío</p>
            <p className="mb-4 text-gray-500">Agrega productos para continuar con tu compra</p>
            <Link href="/catalog">
              <Button className="bg-[#007BFF] hover:bg-[#0056b3]">Ver Catálogo</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Lista de productos */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-lg border">
                <div className="bg-gray-50 p-4">
                  <h2 className="font-medium">Productos</h2>
                </div>

                <div className="divide-y">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col">
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">MX${item.price.toLocaleString()}</p>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-md border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Servicios adicionales */}
              <div className="mt-6 overflow-hidden rounded-lg border">
                <div className="bg-gray-50 p-4">
                  <h2 className="font-medium">Servicios adicionales</h2>
                </div>

                <div className="space-y-4 p-4">
                  {additionalServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start space-x-3"
                    >
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`service-${service.id}`}
                          className="font-medium"
                        >
                          {service.name} (+MX${service.price.toLocaleString()})
                        </Label>
                        <p className="text-sm text-gray-500">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Método de envío */}
              <div className="mt-6 overflow-hidden rounded-lg border">
                <div className="bg-gray-50 p-4">
                  <h2 className="font-medium">Método de envío</h2>
                </div>

                <div className="p-4">
                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={setShippingMethod}
                  >
                    <div className="mb-4 flex items-start space-x-3">
                      <RadioGroupItem
                        value="pickup"
                        id="pickup"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="pickup"
                          className="font-medium"
                        >
                          Recoger en tienda (Gratis)
                        </Label>
                        <p className="text-sm text-gray-500">
                          Listo en 2 días hábiles. Tienes 2 días para recoger tu pedido.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <RadioGroupItem
                        value="delivery"
                        id="delivery"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="delivery"
                          className="font-medium"
                        >
                          Envío a domicilio {isFirstPurchase ? '(Gratis en tu primera compra)' : '(+MX$150)'}
                        </Label>
                        <p className="text-sm text-gray-500">Solo disponible en la zona sur de México.</p>

                        {shippingMethod === 'delivery' && (
                          <div className="mt-4 space-y-3">
                            <div className="space-y-1">
                              <Label
                                htmlFor="address"
                                className="text-sm"
                              >
                                Dirección
                              </Label>
                              <Input
                                id="address"
                                placeholder="Calle, número, colonia"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label
                                  htmlFor="city"
                                  className="text-sm"
                                >
                                  Ciudad
                                </Label>
                                <Input
                                  id="city"
                                  placeholder="Ciudad"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label
                                  htmlFor="postal"
                                  className="text-sm"
                                >
                                  Código Postal
                                </Label>
                                <Input
                                  id="postal"
                                  placeholder="CP"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Método de pago */}
              <div className="mt-6 overflow-hidden rounded-lg border">
                <div className="bg-gray-50 p-4">
                  <h2 className="font-medium">Método de pago</h2>
                </div>

                <div className="p-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="mb-4 flex items-center space-x-3">
                      <RadioGroupItem
                        value="card"
                        id="card"
                      />
                      <Label
                        htmlFor="card"
                        className="flex items-center font-medium"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Tarjeta de crédito/débito
                      </Label>
                    </div>

                    <div className="mb-4 flex items-center space-x-3">
                      <RadioGroupItem
                        value="paypal"
                        id="paypal"
                      />
                      <Label
                        htmlFor="paypal"
                        className="flex items-center font-medium"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        PayPal
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="cash"
                        id="cash"
                      />
                      <Label
                        htmlFor="cash"
                        className="flex items-center font-medium"
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Efectivo (QR para tienda)
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'card' && (
                    <div className="mt-4 space-y-3">
                      <div className="space-y-1">
                        <Label
                          htmlFor="card-number"
                          className="text-sm"
                        >
                          Número de tarjeta
                        </Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label
                            htmlFor="expiry"
                            className="text-sm"
                          >
                            Fecha de expiración
                          </Label>
                          <Input
                            id="expiry"
                            placeholder="MM/AA"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor="cvv"
                            className="text-sm"
                          >
                            CVV
                          </Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor="card-name"
                          className="text-sm"
                        >
                          Nombre en la tarjeta
                        </Label>
                        <Input
                          id="card-name"
                          placeholder="NOMBRE APELLIDO"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen de compra */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 overflow-hidden rounded-lg border">
                <div className="bg-gray-50 p-4">
                  <h2 className="font-medium">Resumen de compra</h2>
                </div>

                <div className="space-y-4 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm font-medium">MX${subtotal.toLocaleString()}</span>
                  </div>

                  {selectedServices.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Servicios adicionales</span>
                      <span className="text-sm font-medium">MX${servicesTotal.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm">Envío</span>
                    <span className="text-sm font-medium">
                      {shippingMethod === 'pickup' || (shippingMethod === 'delivery' && isFirstPurchase)
                        ? 'Gratis'
                        : `MX$${shippingCost.toLocaleString()}`}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-bold">MX${total.toLocaleString()}</span>
                  </div>

                  <Button className="w-full bg-[#007BFF] hover:bg-[#0056b3]">Finalizar compra</Button>

                  <p className="text-center text-xs text-gray-500">
                    Al finalizar la compra, aceptas nuestros{' '}
                    <Link
                      href="/terms"
                      className="text-[#007BFF] hover:underline"
                    >
                      términos y condiciones
                    </Link>{' '}
                    y{' '}
                    <Link
                      href="/privacy"
                      className="text-[#007BFF] hover:underline"
                    >
                      política de privacidad
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
