import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pokemonAPI } from '@/lib/api';

// Custom hook for fetching Pokemon list with pagination
export function usePokemonList(offset = 0, limit = 20) {
  return useQuery({
    queryKey: ['pokemon-list', offset, limit],
    queryFn: ({ signal }) => pokemonAPI.getPokemonList(offset, limit, signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Custom hook for fetching individual Pokemon
export function usePokemon(identifier: string | number) {
  return useQuery({
    queryKey: ['pokemon', identifier],
    queryFn: ({ signal }) => pokemonAPI.getPokemon(identifier, signal),
    enabled: !!identifier,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Custom hook for fetching Pokemon species (for description)
export function usePokemonSpecies(identifier: string | number) {
  return useQuery({
    queryKey: ['pokemon-species', identifier],
    queryFn: ({ signal }) => pokemonAPI.getPokemonSpecies(identifier, signal),
    enabled: !!identifier,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Custom hook for fetching Pokemon types
export function usePokemonTypes() {
  return useQuery({
    queryKey: ['pokemon-types'],
    queryFn: ({ signal }) => pokemonAPI.getPokemonTypes(signal),
    staleTime: 60 * 60 * 1000, // 1 hour (types rarely change)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: 3,
  });
}

// Custom hook for fetching Pokemon by type
export function usePokemonByType(type: string) {
  return useQuery({
    queryKey: ['pokemon-by-type', type],
    queryFn: ({ signal }) => pokemonAPI.getPokemonByType(type, signal),
    enabled: !!type && type !== 'all',
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 3,
  });
}

// Custom hook for searching Pokemon
export function useSearchPokemon(query: string, limit = 1000) {
  return useQuery({
    queryKey: ['pokemon-search', query, limit],
    queryFn: ({ signal }) => pokemonAPI.searchPokemon(query, limit, signal),
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Custom hook for prefetching Pokemon details
export function usePrefetchPokemon() {
  const queryClient = useQueryClient();

  const prefetchPokemon = (identifier: string | number) => {
    queryClient.prefetchQuery({
      queryKey: ['pokemon', identifier],
      queryFn: ({ signal }) => pokemonAPI.getPokemon(identifier, signal),
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchPokemonSpecies = (identifier: string | number) => {
    queryClient.prefetchQuery({
      queryKey: ['pokemon-species', identifier],
      queryFn: ({ signal }) => pokemonAPI.getPokemonSpecies(identifier, signal),
      staleTime: 10 * 60 * 1000,
    });
  };

  return {
    prefetchPokemon,
    prefetchPokemonSpecies,
  };
}