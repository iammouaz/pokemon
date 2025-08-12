'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Pokemon } from '@/types/pokemon';
import { utils } from '@/lib/api';
import { useFavorites } from '@/hooks/useFavorites';

interface PokemonCardProps {
  pokemon: Pokemon;
  onFavoriteToggle?: (pokemon: Pokemon, isFavorite: boolean) => void;
  className?: string;
}

export function PokemonCard({ pokemon, onFavoriteToggle, className = '' }: PokemonCardProps) {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const pokemonName = utils.formatPokemonName(pokemon.name);
  const imageUrl = utils.getPokemonImageUrl(pokemon.id, 'official');
  const fallbackImageUrl = utils.getPokemonImageUrl(pokemon.id, 'default');
  const isFav = isFavorite(pokemon.id);

  // Determine which image to show
  const getImageSrc = () => {
    if (!imageError) return imageUrl;
    if (!fallbackError) return fallbackImageUrl;
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjQ4IiBjeT0iNDAiIHI9IjE2IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMzYgNjBIMzJWNjRINDBWNjBIMzZaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik01NiA2MEg2MFY2NEg1NlY2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'; // Placeholder SVG
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newFavoriteStatus = toggleFavorite({
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: imageError ? fallbackImageUrl : imageUrl,
    });
    
    onFavoriteToggle?.(pokemon, newFavoriteStatus);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.log(`Image error for ${pokemonName} (ID: ${pokemon.id})`);
    if (!imageError) {
      setImageError(true);
      setIsLoading(false);
    } else if (!fallbackError) {
      setFallbackError(true);
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/pokemon/${pokemon.id}`} className={`block group ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-pokemon-card hover:shadow-pokemon-card-hover transition-all duration-200 p-6 border border-gray-200 dark:border-gray-700 group-hover:border-primary-300 dark:group-hover:border-primary-600 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800" />
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isFav
              ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
              : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`h-5 w-5 transition-transform duration-200 ${
              isFav ? 'fill-current scale-110' : 'hover:scale-110'
            }`}
          />
        </button>

        {/* Pokemon image */}
        <div className="relative flex justify-center mb-4">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            )}
            <Image
              src={getImageSrc()}
              alt={pokemonName}
              width={96}
              height={96}
              className={`transition-all duration-300 group-hover:scale-110 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={pokemon.id <= 20} // Prioritize loading for first 20 Pokemon
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>
        </div>

        {/* Pokemon info */}
        <div className="text-center relative z-10">
          {/* Name */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {pokemonName}
          </h3>

          {/* ID */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            #{pokemon.id.toString().padStart(3, '0')}
          </p>

          {/* Types */}
          <div className="flex justify-center space-x-1 mb-4">
            {pokemon.types.map((type) => (
              <span
                key={type.type.name}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: utils.getTypeColor(type.type.name) }}
              >
                {utils.formatPokemonName(type.type.name)}
              </span>
            ))}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="text-center">
              <span className="block font-medium text-gray-900 dark:text-gray-100">
                {pokemon.height / 10}m
              </span>
              <span>Height</span>
            </div>
            <div className="text-center">
              <span className="block font-medium text-gray-900 dark:text-gray-100">
                {pokemon.weight / 10}kg
              </span>
              <span>Weight</span>
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </Link>
  );
}