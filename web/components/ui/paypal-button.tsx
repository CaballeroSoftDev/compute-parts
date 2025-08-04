'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface PayPalButtonProps {
	amount: number;
	currency?: string;
	disabled?: boolean;
	className?: string;
	cartItems?: Array<{
		id: string;
		name: string;
		price: number;
		quantity: number;
		image_url?: string;
	}>;
	orderData?: any;
	onSuccess?: (data: any) => void;
}

export function PayPalButton({
	amount,
	currency = 'MXN',
	disabled = false,
	className = '',
	cartItems = [],
	orderData = {},
	onSuccess,
}: PayPalButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	const createOrder = async () => {
		try {
			console.log('Creando orden en PayPal...');
			const response = await fetch(`/api/paypal/create-order`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					amount,
					currency,
					description: 'Compra en ComputeParts',
					cartItems,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
			}

			const paypalOrderData = await response.json();

			if (paypalOrderData.id) {
				console.log('Orden creada exitosamente:', paypalOrderData.id);
				return paypalOrderData.id;
			} else {
				const errorDetail = paypalOrderData?.details?.[0];
				const errorMessage = errorDetail
					? `${errorDetail.issue} ${errorDetail.description} (${paypalOrderData.debug_id})`
					: JSON.stringify(paypalOrderData);

				throw new Error(errorMessage);
			}
		} catch (error) {
			console.error('Error creando orden:', error);
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Error al crear la orden',
				variant: 'destructive',
			});
			throw error;
		}
	};

	const onApprove = async (data: any, actions: any) => {
		try {
			setIsLoading(true);
			console.log('Procesando pago con PayPal...');
			
			const response = await fetch(`/api/paypal/capture-payment`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					paypal_order_id: data.orderID,
					orderData,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
			}

			const captureResult = await response.json();

			// Validar que la respuesta tenga la estructura esperada
			if (captureResult.error) {
				throw new Error(captureResult.error);
			}

			// Three cases to handle:
			//   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
			//   (2) Other non-recoverable errors -> Show a failure message
			//   (3) Successful transaction -> Show confirmation or thank you message

			const errorDetail = captureResult?.details?.[0];

			if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
				// (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
				toast({
					title: 'Pago rechazado',
					description: 'Tu método de pago fue rechazado. Intenta con otro método.',
					variant: 'destructive',
				});
				return actions.restart();
			} else if (errorDetail) {
				// (2) Other non-recoverable errors -> Show a failure message
				throw new Error(`${errorDetail.description} (${captureResult.debug_id})`);
			} else {
				// (3) Successful transaction -> Show confirmation or thank you message
				// Validar que la respuesta tenga la estructura esperada de PayPal
				if (!captureResult.purchase_units?.[0]?.payments?.captures?.[0]) {
					// Si no tiene la estructura de PayPal, verificar si es una respuesta exitosa del servidor
					if (captureResult.status === 'COMPLETED' || captureResult.order_id) {
						console.log('Transacción completada exitosamente');
						toast({
							title: '¡Pago exitoso!',
							description: 'Tu orden ha sido procesada correctamente',
						});

						if (onSuccess) {
							onSuccess(captureResult);
						}
						return;
					} else {
						throw new Error('Respuesta de PayPal inválida');
					}
				}

				const transaction = captureResult.purchase_units[0].payments.captures[0];
				console.log('Transaction completed:', transaction.status, transaction.id);
				
				toast({
					title: '¡Pago exitoso!',
					description: 'Tu orden ha sido procesada correctamente',
				});

				if (onSuccess) {
					onSuccess(captureResult);
				}
			}
		} catch (error) {
			console.error('Error procesando pago:', error);
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Error al procesar el pago',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const onError = (err: any) => {
		console.error('Error de PayPal:', err);
		toast({
			title: 'Error de PayPal',
			description: 'Hubo un problema con PayPal. Intenta nuevamente.',
			variant: 'destructive',
		});
	};

	return (
		<div className={className}>
			<PayPalButtons
				createOrder={createOrder}
				onApprove={onApprove}
				onError={onError}
				disabled={disabled || isLoading}
				style={{
					layout: 'vertical',
					color: 'blue',
					shape: 'rect',
					label: 'paypal',
				}}
			/>
		</div>
	);
} 