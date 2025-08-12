import { FavoritePokemon } from '@/types/pokemon';

const FAVORITES_KEY = 'pokemon-favorites';

export const favoritesStorage = {
  /**
   * Get all favorite Pokemon from localStorage
   */
  getFavorites(): FavoritePokemon[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading favorites from localStorage:', error);
      return [];
    }
  },

  /**
   * Add a Pokemon to favorites
   */
  addFavorite(pokemon: Omit<FavoritePokemon, 'addedAt'>): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const favorites = this.getFavorites();
      const existingIndex = favorites.findIndex((fav) => fav.id === pokemon.id);

      if (existingIndex === -1) {
        const newFavorite: FavoritePokemon = {
          ...pokemon,
          addedAt: new Date().toISOString(),
        };
        favorites.push(newFavorite);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error saving favorite to localStorage:', error);
    }
  },

  /**
   * Remove a Pokemon from favorites
   */
  removeFavorite(pokemonId: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const favorites = this.getFavorites();
      const filteredFavorites = favorites.filter((fav) => fav.id !== pokemonId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filteredFavorites));
    } catch (error) {
      console.error('Error removing favorite from localStorage:', error);
    }
  },

  /**
   * Check if a Pokemon is favorited
   */
  isFavorite(pokemonId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.some((fav) => fav.id === pokemonId);
  },

  /**
   * Toggle favorite status for a Pokemon
   */
  toggleFavorite(pokemon: Omit<FavoritePokemon, 'addedAt'>): boolean {
    const isFav = this.isFavorite(pokemon.id);
    
    if (isFav) {
      this.removeFavorite(pokemon.id);
      return false;
    } else {
      this.addFavorite(pokemon);
      return true;
    }
  },

  /**
   * Clear all favorites
   */
  clearFavorites(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error('Error clearing favorites from localStorage:', error);
    }
  },

  /**
   * Get favorites count
   */
  getFavoritesCount(): number {
    return this.getFavorites().length;
  },
};