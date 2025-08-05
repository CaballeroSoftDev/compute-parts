'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { CatalogProduct } from '@/lib/interfaces/catalog';
import { FavoritesService } from '@/lib/services/favorites-service';
import { useAuth } from '@/lib/auth-context';

interface FavoritesContextType {
  favorites: CatalogProduct[];
  favoritesCount: number;
  loading: boolean;
  addToFavorites: (productId: string) => Promise<boolean>;
  removeFromFavorites: (productId: string) => Promise<boolean>;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Cargar favoritos cuando el usuario cambie
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userFavorites = await FavoritesService.getUserFavorites();
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId: string): Promise<boolean> => {
    if (!user) {
      console.error('Usuario no autenticado');
      return false;
    }

    try {
      const success = await FavoritesService.addToFavorites(productId);
      if (success) {
        await loadFavorites(); // Recargar favoritos
      }
      return success;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  };

  const removeFromFavorites = async (productId: string): Promise<boolean> => {
    if (!user) {
      console.error('Usuario no autenticado');
      return false;
    }

    try {
      const success = await FavoritesService.removeFromFavorites(productId);
      if (success) {
        await loadFavorites(); // Recargar favoritos
      }
      return success;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.some((fav) => fav.id === productId);
  };

  const clearFavorites = async (): Promise<boolean> => {
    if (!user) {
      console.error('Usuario no autenticado');
      return false;
    }

    try {
      const success = await FavoritesService.clearFavorites();
      if (success) {
        setFavorites([]);
      }
      return success;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  };

  const refreshFavorites = async (): Promise<void> => {
    await loadFavorites();
  };

  const value = {
    favorites,
    favoritesCount: favorites.length,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
    refreshFavorites,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
