'use client';

import { useState, useCallback } from 'react';
import { SearchFilters } from '@/types/pokemon';
import { Header } from '@/components/layout/Header';
import { SearchAndFilter } from '@/components/filters/SearchAndFilter';
import { PokemonList } from '@/components/pokemon/PokemonList';

export default function Home() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    sortBy: 'id',
    sortOrder: 'asc',
    showFavorites: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setIsLoading(true);
    // Reset loading state after a short delay to allow for smooth transitions
    setTimeout(() => setIsLoading(false), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="relative">
        {/* Search and filter section */}
        <SearchAndFilter
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
        />

        {/* Pokemon list section */}
        <PokemonList
          filters={filters}
          className="min-h-[calc(100vh-200px)]"
        />
      </main>
    </div>
  );
}