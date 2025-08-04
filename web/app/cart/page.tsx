'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Trash2, ChevronLeft, CreditCard, Wallet, QrCode, Loader2, ShoppingCart } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/lib/hooks/use-cart';
import { useOrders } from '@/lib/hooks/use-orders';
import { PayPalButton } from '@/components/ui/paypal-button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';

import { supabase } from '@/lib/supabase';

// Servicios adicionales desde la base de datos
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
	const { items, loading, updateQuantity, removeFromCart, calculateTotals } = useCart();
	const { createOrder, creating } = useOrders();
	const { toast } = useToast();
	const { user, loading: authLoading } = useAuth();

	
	const [selectedServices, setSelectedServices] = useState<string[]>([]);
	const [shippingMethod, setShippingMethod] = useState('pickup');
	const [paymentMethod, setPaymentMethod] = useState('paypal');
	const [isFirstPurchase, setIsFirstPurchase] = useState(false);
	const [processingPayment, setProcessingPayment] = useState(false);
	
	// Formulario de dirección
	const [shippingAddress, setShippingAddress] = useState({
		first_name: '',
		last_name: '',
		phone: '',
		address_line_1: '',
		address_line_2: '',
		city: '',
		state: '',
		postal_code: '',
		country: 'México',
	});

	// Verificar si es primera compra
	useEffect(() => {
		const checkFirstPurchase = async () => {
			try {
				const { data: { user } } = await supabase.auth.getUser();
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

	const toggleService = (id: string) => {
		setSelectedServices((prev) => 
			prev.includes(id) 
				? prev.filter((serviceId) => serviceId !== id) 
				: [...prev, id]
		);
	};

	// Cálculos
	const { subtotal, total, itemCount } = calculateTotals();
	const servicesTotal = selectedServices.reduce((sum, serviceId) => {
		const service = additionalServices.find((s) => s.id === serviceId);
		return sum + (service?.price || 0);
	}, 0);
	const shippingCost = shippingMethod === 'delivery' ? (isFirstPurchase ? 0 : 150) : 0;
	const finalTotal = subtotal + servicesTotal + shippingCost;

	const handleQuantityChange = async (itemId: string, newQuantity: number) => {
		if (newQuantity < 1) return;
		await updateQuantity(itemId, newQuantity);
	};

	const handleRemoveItem = async (itemId: string) => {
		await removeFromCart(itemId);
	};

	const handlePayPalSuccess = async (paymentData: any) => {
		try {
			// La orden ya se creó en Supabase durante la captura del pago
			// Solo mostrar mensaje de éxito y redirigir
			
			toast({
				title: '¡Pago exitoso!',
				description: 'Tu orden ha sido procesada correctamente',
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
			
			const orderData = {
				payment_method: 'Efectivo' as const,
				shipping_method: shippingMethod as 'pickup' | 'delivery',
				shipping_address: shippingMethod === 'delivery' ? shippingAddress : undefined,
				selected_services: selectedServices,
				notes: 'Pago en efectivo - QR para tienda',
				items: items.map(item => ({
					product_id: item.product_id,
					name: item.product?.name || 'Producto',
					price: item.product?.price || 0,
					quantity: item.quantity,
					image_url: item.product?.product_images?.[0]?.image_url,
				})),
			};

			const order = await createOrder(orderData);
			
			toast({
				title: '¡Orden creada!',
				description: 'Tu orden ha sido creada. Paga en tienda con el QR',
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

	// Si el usuario no está autenticado, mostrar mensaje
	if (!authLoading && !user) {
		return (
			<MainLayout>
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-2xl mx-auto text-center">
						<div className="mb-8">
							<ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
							<h1 className="text-2xl font-bold text-gray-900 mb-2">
								Carrito de Compras
							</h1>
							<p className="text-gray-600 mb-6">
								Debes iniciar sesión para ver tu carrito de compras
							</p>
						</div>
						
						<div className="bg-white rounded-lg shadow-sm border p-6">
							<div className="space-y-4">
								<p className="text-gray-600">
									Para agregar productos a tu carrito y realizar compras, necesitas tener una cuenta.
								</p>
								
								<div className="flex flex-col sm:flex-row gap-3 justify-center">
									<Link href="/login">
										<Button className="w-full sm:w-auto">
											Iniciar Sesión
										</Button>
									</Link>
									<Link href="/register">
										<Button variant="outline" className="w-full sm:w-auto">
											Crear Cuenta
										</Button>
									</Link>
								</div>
								
								<div className="pt-4 border-t">
									<Link href="/catalog" className="text-blue-600 hover:text-blue-800 text-sm">
										← Continuar comprando
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</MainLayout>
		);
	}

	// Si está cargando la autenticación, mostrar loading
	if (authLoading) {
		return (
			<MainLayout>
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-2xl mx-auto text-center">
						<div className="flex items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
							<span className="ml-2 text-gray-600">Cargando...</span>
						</div>
					</div>
				</div>
			</MainLayout>
		);
	}

	if (loading) {
		return (
			<MainLayout showNavigation={false}>
				<div className="container py-6 md:py-10">
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin" />
						<span className="ml-2">Cargando carrito...</span>
					</div>
				</div>
			</MainLayout>
		);
	}

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
													src={item.product?.product_images?.[0]?.image_url || '/placeholder.svg'}
													alt={item.product?.name || 'Producto'}
													fill
													className="object-cover"
												/>
											</div>

											<div className="flex flex-1 flex-col">
												<h3 className="text-sm font-medium">{item.product?.name}</h3>
												<p className="mt-1 text-sm text-gray-500">
													MX${((item.product?.price || 0) + (item.variant?.price_adjustment || 0)).toLocaleString()}
												</p>
												{item.variant && (
													<p className="text-xs text-gray-400">
														{item.variant.name}: {item.variant.value}
													</p>
												)}

												<div className="mt-auto flex items-center justify-between">
													<div className="flex items-center rounded-md border">
																											<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 rounded-none"
														onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
													>
														-
													</Button>
													<span className="w-8 text-center text-sm">{item.quantity}</span>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 rounded-none"
														onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
													>
														+
													</Button>
												</div>

												<Button
													variant="ghost"
													size="icon"
													className="text-red-500 hover:text-red-700"
													onClick={() => handleRemoveItem(item.id)}
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
														<div className="grid grid-cols-2 gap-3">
															<div className="space-y-1">
																<Label htmlFor="first_name" className="text-sm">Nombre</Label>
																<Input
																	id="first_name"
																	value={shippingAddress.first_name}
																	onChange={(e) => setShippingAddress(prev => ({ ...prev, first_name: e.target.value }))}
																	placeholder="Nombre"
																/>
															</div>
															<div className="space-y-1">
																<Label htmlFor="last_name" className="text-sm">Apellido</Label>
																<Input
																	id="last_name"
																	value={shippingAddress.last_name}
																	onChange={(e) => setShippingAddress(prev => ({ ...prev, last_name: e.target.value }))}
																	placeholder="Apellido"
																/>
															</div>
														</div>
														<div className="space-y-1">
															<Label htmlFor="phone" className="text-sm">Teléfono</Label>
															<Input
																id="phone"
																value={shippingAddress.phone}
																onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
																placeholder="Teléfono"
															/>
														</div>
														<div className="space-y-1">
															<Label htmlFor="address" className="text-sm">Dirección</Label>
															<Input
																id="address"
																value={shippingAddress.address_line_1}
																onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
																placeholder="Calle, número, colonia"
															/>
														</div>
														<div className="grid grid-cols-2 gap-3">
															<div className="space-y-1">
																<Label htmlFor="city" className="text-sm">Ciudad</Label>
																<Input
																	id="city"
																	value={shippingAddress.city}
																	onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
																	placeholder="Ciudad"
																/>
															</div>
															<div className="space-y-1">
																<Label htmlFor="postal" className="text-sm">Código Postal</Label>
																<Input
																	id="postal"
																	value={shippingAddress.postal_code}
																	onChange={(e) => setShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
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
											<RadioGroupItem value="paypal" id="paypal" />
											<Label htmlFor="paypal" className="flex items-center font-medium">
												<Wallet className="mr-2 h-4 w-4" />
												PayPal
											</Label>
										</div>

										<div className="mb-4 flex items-center space-x-3">
											<RadioGroupItem value="cash" id="cash" />
											<Label htmlFor="cash" className="flex items-center font-medium">
												<QrCode className="mr-2 h-4 w-4" />
												Efectivo (QR para tienda)
											</Label>
										</div>

										<div className="flex items-center space-x-3">
											<RadioGroupItem value="card" id="card" />
											<Label htmlFor="card" className="flex items-center font-medium">
												<CreditCard className="mr-2 h-4 w-4" />
												Tarjeta de crédito/débito (Próximamente)
											</Label>
										</div>
									</RadioGroup>
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
										<span className="text-lg font-bold">MX${finalTotal.toLocaleString()}</span>
									</div>

									{paymentMethod === 'paypal' && (
										<PayPalButton
											amount={subtotal + servicesTotal}
											currency="MXN"
											disabled={creating}
											className="w-full"
											cartItems={items.map(item => ({
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
												selected_services: selectedServices,
												notes: 'Pago con PayPal',
												items: items.map(item => ({
													product_id: item.product_id,
													name: item.product?.name || 'Producto',
													price: item.product?.price || 0,
													quantity: item.quantity,
													image_url: item.product?.product_images?.[0]?.image_url,
												})),
											}}
											onSuccess={handlePayPalSuccess}
										/>
									)}

									{paymentMethod === 'cash' && (
										<Button 
											onClick={handleCashPayment}
											disabled={creating || processingPayment}
											className="w-full bg-[#007BFF] hover:bg-[#0056b3]"
										>
											{processingPayment ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Procesando...
												</>
											) : (
												'Finalizar compra (Efectivo)'
											)}
										</Button>
									)}

									{paymentMethod === 'card' && (
										<Button disabled className="w-full bg-gray-400">
											Próximamente
										</Button>
									)}

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
