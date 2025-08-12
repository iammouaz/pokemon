'use client';

import { useState, useCallback } from 'react';
import { SearchFilters } from '@/types/pokemon';
import { Header } from '@/components/layout/Header';
import { SearchAndFilter } from '@/components/filters/SearchAndFilter';
import { PokemonList } from '@/components/pokemon/PokemonList';

export default function FavoritesPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    sortBy: 'id',
    sortOrder: 'asc',
    showFavorites: true, // Always show favorites on this page
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    // Ensure showFavorites remains true on this page
    const favoritesFilters = { ...newFilters, showFavorites: true };
    setFilters(favoritesFilters);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="relative">
        {/* Page header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Your Favorite Pokémon
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Your personal collection of favorite Pokémon
              </p>
            </div>
          </div>
        </div>

        {/* Search and filter section - modified for favorites */}
        <SearchAndFilter
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
        />

        {/* Pokemon list section */}
        <PokemonList
          filters={filters}
          className="min-h-[calc(100vh-300px)]"
        />
      </main>
    </div>
  );
}