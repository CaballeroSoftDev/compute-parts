'use client';

import { useCart as useCartContext } from '@/lib/cart-context';

export function useCart() {
  return useCartContext();
}
