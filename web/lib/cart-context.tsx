'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CartService, CartItem, AddToCartData } from '@/lib/services/cart-service';
import { useAuth } from '@/lib/hooks/use-auth';

interface CartContextType {
	items: CartItem[];
	loading: boolean;
	updatingItems: Set<string>; // Set de product_ids que están siendo actualizados
	addToCart: (itemData: AddToCartData) => Promise<void>;
	updateQuantity: (itemId: string, quantity: number) => Promise<void>;
	removeFromCart: (itemId: string) => Promise<void>;
	clearCart: () => Promise<void>;
	calculateTotals: () => { subtotal: number; total: number; itemCount: number };
	reloadCart: () => Promise<void>;
	isUpdating: (productId: string) => boolean; // Verificar si un producto específico está siendo actualizado
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
	const { toast } = useToast();
	const { user, loading: authLoading } = useAuth();

	// Cargar items del carrito
	const loadCart = useCallback(async () => {
		// No cargar el carrito si el usuario no está autenticado
		if (!user || authLoading) {
			setItems([]);
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			const cartItems = await CartService.getCartItems();
			setItems(cartItems);
		} catch (error) {
			console.error('Error cargando carrito:', error);
			// No mostrar toast aquí para evitar spam en el header
			setItems([]);
		} finally {
			setLoading(false);
		}
	}, [user, authLoading]);

	// Verificar si un producto específico está siendo actualizado
	const isUpdating = useCallback((productId: string): boolean => {
		return updatingItems.has(productId);
	}, [updatingItems]);

	// Agregar producto al carrito
	const addToCart = useCallback(async (itemData: AddToCartData) => {
		if (!user) {
			toast({
				title: 'Error',
				description: 'Debes iniciar sesión para agregar productos al carrito',
				variant: 'destructive',
			});
			return;
		}

		try {
			// Agregar el product_id al set de items que se están actualizando
			setUpdatingItems(prev => new Set(prev).add(itemData.product_id));
			
			await CartService.addToCart(itemData);
			await loadCart(); // Recargar carrito
			toast({
				title: 'Producto agregado',
				description: 'El producto se agregó al carrito exitosamente',
			});
		} catch (error) {
			console.error('Error agregando al carrito:', error);
			toast({
				title: 'Error',
				description: 'No se pudo agregar el producto al carrito',
				variant: 'destructive',
			});
		} finally {
			// Remover el product_id del set de items que se están actualizando
			setUpdatingItems(prev => {
				const newSet = new Set(prev);
				newSet.delete(itemData.product_id);
				return newSet;
			});
		}
	}, [loadCart, toast, user]);

	// Actualizar cantidad
	const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
		if (!user) {
			toast({
				title: 'Error',
				description: 'Debes iniciar sesión para modificar el carrito',
				variant: 'destructive',
			});
			return;
		}

		try {
			setUpdatingItems(prev => new Set(prev).add(itemId));
			
			if (quantity <= 0) {
				await CartService.removeFromCart(itemId);
			} else {
				await CartService.updateCartItem(itemId, quantity);
			}
			await loadCart(); // Recargar carrito
		} catch (error) {
			console.error('Error actualizando cantidad:', error);
			toast({
				title: 'Error',
				description: 'No se pudo actualizar la cantidad',
				variant: 'destructive',
			});
		} finally {
			setUpdatingItems(prev => {
				const newSet = new Set(prev);
				newSet.delete(itemId);
				return newSet;
			});
		}
	}, [loadCart, toast, user]);

	// Eliminar item del carrito
	const removeFromCart = useCallback(async (itemId: string) => {
		if (!user) {
			toast({
				title: 'Error',
				description: 'Debes iniciar sesión para modificar el carrito',
				variant: 'destructive',
			});
			return;
		}

		try {
			setUpdatingItems(prev => new Set(prev).add(itemId));
			
			await CartService.removeFromCart(itemId);
			await loadCart(); // Recargar carrito
			toast({
				title: 'Producto eliminado',
				description: 'El producto se eliminó del carrito',
			});
		} catch (error) {
			console.error('Error eliminando del carrito:', error);
			toast({
				title: 'Error',
				description: 'No se pudo eliminar el producto del carrito',
				variant: 'destructive',
			});
		} finally {
			setUpdatingItems(prev => {
				const newSet = new Set(prev);
				newSet.delete(itemId);
				return newSet;
			});
		}
	}, [loadCart, toast, user]);

	// Limpiar carrito
	const clearCart = useCallback(async () => {
		if (!user) {
			toast({
				title: 'Error',
				description: 'Debes iniciar sesión para modificar el carrito',
				variant: 'destructive',
			});
			return;
		}

		try {
			setUpdatingItems(prev => new Set(prev).add('clear'));
			
			await CartService.clearCart();
			await loadCart(); // Recargar carrito
			toast({
				title: 'Carrito limpiado',
				description: 'Se eliminaron todos los productos del carrito',
			});
		} catch (error) {
			console.error('Error limpiando carrito:', error);
			toast({
				title: 'Error',
				description: 'No se pudo limpiar el carrito',
				variant: 'destructive',
			});
		} finally {
			setUpdatingItems(prev => {
				const newSet = new Set(prev);
				newSet.delete('clear');
				return newSet;
			});
		}
	}, [loadCart, toast, user]);

	// Calcular totales
	const calculateTotals = useCallback(() => {
		const subtotal = items.reduce((sum, item) => {
			const price = item.product?.price || 0;
			return sum + (price * item.quantity);
		}, 0);

		const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

		return {
			subtotal,
			total: subtotal, // Por ahora sin impuestos ni envío
			itemCount,
		};
	}, [items]);

	// Recargar carrito
	const reloadCart = useCallback(async () => {
		await loadCart();
	}, [loadCart]);

	// Cargar carrito cuando cambie el estado de autenticación
	useEffect(() => {
		loadCart();
	}, [loadCart]);

	const value: CartContextType = {
		items,
		loading,
		updatingItems,
		addToCart,
		updateQuantity,
		removeFromCart,
		clearCart,
		calculateTotals,
		reloadCart,
		isUpdating,
	};

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error('useCart debe ser usado dentro de un CartProvider');
	}
	return context;
} 