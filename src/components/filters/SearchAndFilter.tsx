'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import { SearchFilters } from '@/types/pokemon';
import { utils } from '@/lib/api';
import { usePokemonTypes } from '@/hooks/usePokemon';

interface SearchAndFilterProps {
  onFiltersChange: (filters: SearchFilters) => void;
  isLoading?: boolean;
  className?: string;
}

function SearchAndFilterInner({
  onFiltersChange,
  isLoading = false,
  className = '',
}: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: typesData } = usePokemonTypes();

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    type: searchParams.get('type') || 'all',
    sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'id',
    sortOrder: (searchParams.get('sortOrder') as SearchFilters['sortOrder']) || 'asc',
    showFavorites: searchParams.get('favorites') === 'true',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isInitialized = useRef(false);

  // Update URL with current filters
  const updateURL = useCallback((newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.type !== 'all') params.set('type', newFilters.type);
    if (newFilters.sortBy !== 'id') params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder !== 'asc') params.set('sortOrder', newFilters.sortOrder);
    if (newFilters.showFavorites) params.set('favorites', 'true');

    const newURL = params.toString() ? `?${params.toString()}` : '/';
    router.replace(newURL, { scroll: false });
  }, [router]);

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    utils.debounce((query: string) => {
      const newFilters = { ...filters, query };
      setFilters(newFilters);
      updateURL(newFilters);
      onFiltersChange(newFilters);
    }, 300),
    [filters, onFiltersChange, updateURL]
  );

  // Handle input change
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setFilters(prev => ({ ...prev, query }));
    debouncedSearch(query);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      type: 'all',
      sortBy: 'id',
      sortOrder: 'asc',
      showFavorites: false,
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Initialize filters from URL on mount
  useEffect(() => {
    const initialFilters: SearchFilters = {
      query: searchParams.get('q') || '',
      type: searchParams.get('type') || 'all',
      sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'id',
      sortOrder: (searchParams.get('sortOrder') as SearchFilters['sortOrder']) || 'asc',
      showFavorites: searchParams.get('favorites') === 'true',
    };
    
    // Only update if this is the first initialization or if URL params actually changed
    if (!isInitialized.current) {
      setFilters(initialFilters);
      onFiltersChange(initialFilters);
      isInitialized.current = true;
    } else {
      // Check if filters actually changed from URL
      const currentFiltersString = JSON.stringify(filters);
      const newFiltersString = JSON.stringify(initialFilters);
      
      if (currentFiltersString !== newFiltersString) {
        setFilters(initialFilters);
        onFiltersChange(initialFilters);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Removed onFiltersChange and filters from dependencies to prevent infinite loop

  const hasActiveFilters = filters.type !== 'all' || filters.sortBy !== 'id' || filters.sortOrder !== 'asc' || filters.showFavorites;

  return (
    <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search input */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.query}
                onChange={handleQueryChange}
                placeholder="Search Pokémon by name..."
                disabled={isLoading}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Search Pokémon"
              />
              {filters.query && (
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, query: '' }));
                    debouncedSearch('');
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter controls */}
          <div className="flex items-center space-x-3">
            {/* Quick favorites toggle */}
            <button
              onClick={() => handleFilterChange('showFavorites', !filters.showFavorites)}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                filters.showFavorites
                  ? 'border-red-300 text-red-700 bg-red-50 dark:border-red-600 dark:text-red-300 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              disabled={isLoading}
            >
              ❤️ Favorites
            </button>

            {/* Filter button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                hasActiveFilters
                  ? 'border-primary-300 text-primary-700 bg-primary-50 dark:border-primary-600 dark:text-primary-300 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              disabled={isLoading}
              aria-expanded={isFilterOpen}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-100 bg-primary-600 rounded-full">
                  !
                </span>
              )}
            </button>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expanded filters */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type filter */}
              <div>
                <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  id="type-filter"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  disabled={isLoading}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="all">All Types</option>
                  {typesData?.results.map((type) => (
                    <option key={type.name} value={type.name}>
                      {utils.formatPokemonName(type.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  disabled={isLoading}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <option value="id">Pokédex Number</option>
                  <option value="name">Name</option>
                  <option value="height">Height</option>
                  <option value="weight">Weight</option>
                </select>
              </div>

              {/* Sort order */}
              <div>
                <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order
                </label>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  disabled={isLoading}
                  className="flex w-full items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>{filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SearchAndFilter(props: SearchAndFilterProps) {
  return (
    <Suspense fallback={
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    }>
      <SearchAndFilterInner {...props} />
    </Suspense>
  );
}