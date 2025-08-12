import axios from 'axios';
import {
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
  PokemonListItem,
} from '@/types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Add request interceptor for cancellation
api.interceptors.request.use((config) => {
  // Add abort controller if not already present
  if (!config.signal) {
    const controller = new AbortController();
    config.signal = controller.signal;
  }
  return config;
});

// Pokemon API functions
export const pokemonAPI = {
  /**
   * Get paginated list of Pokemon
   */
  async getPokemonList(
    offset = 0,
    limit = 20,
    signal?: AbortSignal
  ): Promise<PokemonListResponse> {
    const response = await api.get<PokemonListResponse>('/pokemon', {
      params: { offset, limit },
      signal,
    });
    return response.data;
  },

  /**
   * Get detailed Pokemon information by ID or name
   */
  async getPokemon(identifier: string | number, signal?: AbortSignal): Promise<Pokemon> {
    const response = await api.get<Pokemon>(`/pokemon/${identifier}`, { signal });
    return response.data;
  },

  /**
   * Get Pokemon species information (for flavor text, etc.)
   */
  async getPokemonSpecies(identifier: string | number, signal?: AbortSignal): Promise<PokemonSpecies> {
    const response = await api.get<PokemonSpecies>(`/pokemon-species/${identifier}`, { signal });
    return response.data;
  },

  /**
   * Get all Pokemon types
   */
  async getPokemonTypes(signal?: AbortSignal): Promise<{ results: Array<{ name: string; url: string }> }> {
    const response = await api.get('/type', { signal });
    return response.data;
  },

  /**
   * Get Pokemon by type
   */
  async getPokemonByType(
    type: string,
    signal?: AbortSignal
  ): Promise<{ pokemon: Array<{ pokemon: PokemonListItem; slot: number }> }> {
    const response = await api.get(`/type/${type}`, { signal });
    return response.data;
  },

  /**
   * Search Pokemon by name (client-side filtering)
   * Note: PokeAPI doesn't have built-in search, so we'll implement this client-side
   */
  async searchPokemon(
    query: string,
    limit = 1000,
    signal?: AbortSignal
  ): Promise<PokemonListItem[]> {
    // Get a large list of Pokemon and filter client-side
    const response = await this.getPokemonList(0, limit, signal);
    
    if (!query.trim()) {
      return response.results;
    }

    const searchTerm = query.toLowerCase().trim();
    return response.results.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm)
    );
  },
};

// Utility functions
export const utils = {
  /**
   * Extract Pokemon ID from API URL
   */
  extractIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? parseInt(matches[1], 10) : 0;
  },

  /**
   * Get Pokemon image URL by ID
   */
  getPokemonImageUrl(id: number, variant: 'official' | 'default' = 'official'): string {
    if (variant === 'official') {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    }
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  },

  /**
   * Format Pokemon name for display
   */
  formatPokemonName(name: string): string {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Get type color for styling
   */
  getTypeColor(type: string): string {
    const typeColors: Record<string, string> = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };
    return typeColors[type] || '#68A090';
  },

  /**
   * Debounce function for search
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Create abort controller for cancelling requests
   */
  createAbortController(): AbortController {
    return new AbortController();
  },
};

// Error handling
export class PokemonAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'PokemonAPIError';
  }
}

// Request cancellation utility
export class RequestManager {
  private controllers = new Map<string, AbortController>();

  createRequest(key: string): AbortController {
    // Cancel existing request with same key
    this.cancelRequest(key);
    
    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  cancelRequest(key: string): void {
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
    }
  }

  cancelAllRequests(): void {
    this.controllers.forEach((controller) => controller.abort());
    this.controllers.clear();
  }
}

export const requestManager = new RequestManager();