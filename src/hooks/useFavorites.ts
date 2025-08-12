import { useState, useEffect, useCallback } from 'react';
import { FavoritePokemon } from '@/types/pokemon';
import { favoritesStorage } from '@/lib/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritePokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadFavorites = () => {
      const storedFavorites = favoritesStorage.getFavorites();
      setFavorites(storedFavorites);
      setIsLoading(false);
    };

    loadFavorites();
  }, []);

  // Add a Pokemon to favorites
  const addFavorite = useCallback((pokemon: Omit<FavoritePokemon, 'addedAt'>) => {
    favoritesStorage.addFavorite(pokemon);
    const updatedFavorites = favoritesStorage.getFavorites();
    setFavorites(updatedFavorites);
  }, []);

  // Remove a Pokemon from favorites
  const removeFavorite = useCallback((pokemonId: number) => {
    favoritesStorage.removeFavorite(pokemonId);
    const updatedFavorites = favoritesStorage.getFavorites();
    setFavorites(updatedFavorites);
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((pokemon: Omit<FavoritePokemon, 'addedAt'>) => {
    const newStatus = favoritesStorage.toggleFavorite(pokemon);
    const updatedFavorites = favoritesStorage.getFavorites();
    setFavorites(updatedFavorites);
    return newStatus;
  }, []);

  // Check if a Pokemon is favorited
  const isFavorite = useCallback((pokemonId: number) => {
    return favorites.some((fav) => fav.id === pokemonId);
  }, [favorites]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    favoritesStorage.clearFavorites();
    setFavorites([]);
  }, []);

  // Get favorites count
  const favoritesCount = favorites.length;

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount,
  };
}