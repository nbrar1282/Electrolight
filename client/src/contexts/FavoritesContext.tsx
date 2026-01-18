import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Favorite } from '@shared/schema';

interface FavoritesContextType {
  favorites: Favorite[];
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  getFavoriteCount: () => number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'electrolight-favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, [favorites]);

  const addToFavorites = (productId: string) => {
    setFavorites(prev => {
      // Don't add if already exists
      if (prev.some(fav => fav.productId === productId)) {
        return prev;
      }
      return [...prev, { productId, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromFavorites = (productId: string) => {
    setFavorites(prev => prev.filter(fav => fav.productId !== productId));
  };

  const toggleFavorite = (productId: string) => {
    const isFavorite = favorites.some(fav => fav.productId === productId);
    if (isFavorite) {
      removeFromFavorites(productId);
    } else {
      addToFavorites(productId);
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.some(fav => fav.productId === productId);
  };

  const getFavoriteCount = () => favorites.length;

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
        getFavoriteCount,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}