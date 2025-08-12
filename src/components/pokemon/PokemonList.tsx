'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Pokemon, SearchFilters } from '@/types/pokemon';
import { pokemonAPI, utils } from '@/lib/api';
import { usePokemonByType } from '@/hooks/usePokemon';
import { useFavorites } from '@/hooks/useFavorites';
import { PokemonCard } from './PokemonCard';
import { PokemonCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState, EmptyState } from '@/components/ui/ErrorState';

interface PokemonListProps {
  filters: SearchFilters;
  className?: string;
}

export function PokemonList({ filters, className = '' }: PokemonListProps) {
  const [pokemonDetails, setPokemonDetails] = useState<Map<number, Pokemon>>(new Map());
  const { favorites } = useFavorites();

  // Fetch Pokemon list with infinite scroll
  const {
    data: listData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList,
  } = useInfiniteQuery({
    queryKey: ['pokemon-infinite-list'],
    queryFn: ({ pageParam = 0, signal }) => pokemonAPI.getPokemonList(pageParam, 40, signal),
    getNextPageParam: (lastPage) => {
      // If there's a next URL, extract the offset from it
      if (lastPage.next) {
        console.log('PokéAPI next URL:', lastPage.next);
        const url = new URL(lastPage.next);
        const offset = url.searchParams.get('offset');
        const nextOffset = offset ? parseInt(offset, 10) : undefined;
        console.log('Next offset will be:', nextOffset);
        return nextOffset;
      }
      console.log('No next page available');
      return undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Pokemon by type if type filter is applied
  const {
    data: typeData,
    isLoading: isTypeLoading,
    error: typeError,
  } = usePokemonByType(filters.type);

  // Get all Pokemon items based on filters
  const allPokemonItems = useMemo(() => {
    if (filters.showFavorites) {
      // Return favorites as Pokemon list items
      return favorites.map(fav => ({
        name: fav.name,
        url: `https://pokeapi.co/api/v2/pokemon/${fav.id}/`
      }));
    }

    if (filters.type !== 'all' && typeData) {
      // Return Pokemon of specific type
      return typeData.pokemon.map(p => p.pokemon);
    }

    if (listData) {
      // Return all Pokemon from infinite query
      return listData.pages.flatMap(page => page.results);
    }

    return [];
  }, [listData, typeData, filters.type, filters.showFavorites, favorites]);

  // Filter Pokemon by search query
  const filteredPokemonItems = useMemo(() => {
    if (!filters.query.trim()) {
      return allPokemonItems;
    }

    const searchTerm = filters.query.toLowerCase().trim();
    return allPokemonItems.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm)
    );
  }, [allPokemonItems, filters.query]);

  // Sort Pokemon items
  const sortedPokemonItems = useMemo(() => {
    const sorted = [...filteredPokemonItems];
    
    sorted.sort((a, b) => {
      const aId = utils.extractIdFromUrl(a.url);
      const bId = utils.extractIdFromUrl(b.url);
      
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'height':
          const aHeight = pokemonDetails.get(aId)?.height || 0;
          const bHeight = pokemonDetails.get(bId)?.height || 0;
          comparison = aHeight - bHeight;
          break;
        case 'weight':
          const aWeight = pokemonDetails.get(aId)?.weight || 0;
          const bWeight = pokemonDetails.get(bId)?.weight || 0;
          comparison = aWeight - bWeight;
          break;
        default: // 'id'
          comparison = aId - bId;
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [filteredPokemonItems, filters.sortBy, filters.sortOrder, pokemonDetails]);

  // Load Pokemon details for all available items
  useEffect(() => {
    const loadPokemonDetails = async () => {
      // Load details for all available Pokemon (not just first 40)
      const itemsToLoad = sortedPokemonItems.filter(item => {
        const id = utils.extractIdFromUrl(item.url);
        return !pokemonDetails.has(id);
      });

      // Process in batches to avoid overwhelming the API
      const batchSize = 20;
      for (let i = 0; i < itemsToLoad.length; i += batchSize) {
        const batch = itemsToLoad.slice(i, i + batchSize);
        const loadPromises = batch.map(async (item) => {
          const id = utils.extractIdFromUrl(item.url);
          try {
            const pokemon = await pokemonAPI.getPokemon(id);
            setPokemonDetails(prev => new Map(prev).set(id, pokemon));
          } catch (error) {
            console.error(`Failed to load Pokemon ${id}:`, error);
          }
        });
        
        await Promise.all(loadPromises);
        
        // Small delay between batches to be nice to the API
        if (i + batchSize < itemsToLoad.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    };

    if (sortedPokemonItems.length > 0) {
      loadPokemonDetails();
    }
  }, [sortedPokemonItems, pokemonDetails]);

  // Ref to track if we're currently loading to prevent multiple calls
  const isLoadingMore = useRef(false);
  const lastScrollY = useRef(0);

  // Infinite scroll handler with debouncing
  const handleLoadMore = useCallback(() => {
    // Prevent multiple simultaneous calls
    if (isLoadingMore.current) {
      return;
    }

    if (hasNextPage && !isFetchingNextPage && !filters.showFavorites && filters.type === 'all') {
      isLoadingMore.current = true;
      fetchNextPage().finally(() => {
        // Reset the flag after the request completes (success or failure)
        isLoadingMore.current = false;
      });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, filters.showFavorites, filters.type]);

  // Debounced scroll handler to prevent excessive API calls
  const debouncedHandleScroll = useMemo(
    () => {
      let timeoutId: NodeJS.Timeout;
      
      return () => {
        const currentScrollY = window.scrollY;
        
        // Only trigger if scrolling down (not up)
        if (currentScrollY <= lastScrollY.current) {
          lastScrollY.current = currentScrollY;
          return;
        }
        
        lastScrollY.current = currentScrollY;
        
        // Clear previous timeout
        clearTimeout(timeoutId);
        
        // Debounce the scroll handler
        timeoutId = setTimeout(() => {
          const scrollThreshold = document.documentElement.offsetHeight - window.innerHeight - 1000;
          
          if (window.scrollY >= scrollThreshold) {
            handleLoadMore();
          }
        }, 150); // 150ms debounce
      };
    },
    [handleLoadMore]
  );

  // Auto-load more when scrolling near bottom
  useEffect(() => {
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [debouncedHandleScroll]);

  // Error handling
  const error = listError || typeError;
  const isLoading = isListLoading || isTypeLoading;

  if (error) {
    return (
      <div className={className}>
        <ErrorState
          title="Failed to load Pokémon"
          message="There was an error loading the Pokémon data. Please try again."
          onRetry={() => {
            refetchList();
          }}
          type="error"
          className="min-h-96"
        />
      </div>
    );
  }

  if (isLoading && pokemonDetails.size === 0) {
    return (
      <div className={`${className} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6`}>
        <PokemonCardSkeleton count={8} />
      </div>
    );
  }

  if (sortedPokemonItems.length === 0 && !isLoading) {
    return (
      <div className={className}>
        <EmptyState
          title={filters.showFavorites ? "No favorite Pokémon" : "No Pokémon found"}
          message={
            filters.showFavorites
              ? "You haven't added any Pokémon to your favorites yet. Start exploring and click the heart icon on Pokémon you like!"
              : filters.query
              ? `No Pokémon match "${filters.query}". Try adjusting your search or filters.`
              : "No Pokémon match your current filters. Try adjusting your selection."
          }
          action={
            filters.showFavorites
              ? undefined
              : {
                  label: "Clear filters",
                  onClick: () => window.location.href = '/',
                }
          }
          className="min-h-96"
        />
      </div>
    );
  }

  // Get Pokemon details for display
  const displayPokemon = sortedPokemonItems
    .map(item => {
      const id = utils.extractIdFromUrl(item.url);
      return pokemonDetails.get(id);
    })
    .filter((pokemon): pokemon is Pokemon => pokemon !== undefined);

  // Debug logging
  console.log('🔍 Debug Info:');
  console.log('Total sorted items:', sortedPokemonItems.length);
  console.log('Pokemon details loaded:', pokemonDetails.size);
  console.log('Display pokemon count:', displayPokemon.length);
  console.log('Has next page:', hasNextPage);
  console.log('Is fetching next page:', isFetchingNextPage);

  return (
    <div className={className}>
      {/* Pokemon grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {displayPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            onFavoriteToggle={(pokemon, isFavorite) => {
              // Optimistic update could be added here
              console.log(`${pokemon.name} ${isFavorite ? 'added to' : 'removed from'} favorites`);
            }}
          />
        ))}
        
        {/* Loading more cards */}
        {isFetchingNextPage && <PokemonCardSkeleton count={4} />}
      </div>

      {/* Load more button for manual loading */}
      {hasNextPage && !filters.showFavorites && filters.type === 'all' && (
        <div className="flex justify-center py-8">
          <button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage || isLoadingMore.current}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More Pokémon'}
          </button>
        </div>
      )}

      {/* End of list indicator */}
      {!hasNextPage && displayPokemon.length > 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>You&apos;ve seen all available Pokémon!</p>
        </div>
      )}
    </div>
  );
}