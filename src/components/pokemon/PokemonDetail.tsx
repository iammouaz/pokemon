'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Heart, 
  Ruler, 
  Weight, 
  Zap, 
  Shield, 
  Activity,
  Star,
  Eye
} from 'lucide-react';
import { usePokemon, usePokemonSpecies } from '@/hooks/usePokemon';
import { useFavorites } from '@/hooks/useFavorites';
import { utils } from '@/lib/api';
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';

interface PokemonDetailProps {
  pokemonId: string;
}

export default function PokemonDetail({ pokemonId }: PokemonDetailProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [activeImageVariant, setActiveImageVariant] = useState<'default' | 'shiny'>('default');
  const { isFavorite, toggleFavorite } = useFavorites();

  // Fetch Pokemon data
  const {
    data: pokemon,
    isLoading: isPokemonLoading,
    error: pokemonError,
    refetch: refetchPokemon,
  } = usePokemon(pokemonId);

  // Fetch Pokemon species data for description
  const {
    data: species,
    isLoading: isSpeciesLoading,
    error: speciesError,
  } = usePokemonSpecies(pokemonId);

  const isLoading = isPokemonLoading || isSpeciesLoading;
  const error = pokemonError || speciesError;

  // Get Pokemon description
  const description = useMemo(() => {
    if (!species?.flavor_text_entries) return null;
    
    // Find English description
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    
    if (englishEntry) {
      // Clean up the description text
      return englishEntry.flavor_text
        .replace(/\f/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/  +/g, ' ')
        .trim();
    }
    
    return null;
  }, [species]);

  // Get genus (category)
  const genus = useMemo(() => {
    if (!species?.genera) return null;
    
    const englishGenus = species.genera.find(
      genus => genus.language.name === 'en'
    );
    
    return englishGenus?.genus || null;
  }, [species]);

  const handleFavoriteToggle = () => {
    if (!pokemon) return;
    
    toggleFavorite({
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: utils.getPokemonImageUrl(pokemon.id, 'official'),
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !pokemon) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorState
          title="Pokémon not found"
          message="The Pokémon you're looking for doesn't exist or couldn't be loaded."
          onRetry={() => {
            refetchPokemon();
          }}
          type="not-found"
          className="min-h-96"
        />
      </div>
    );
  }

  const pokemonName = utils.formatPokemonName(pokemon.name);
  const imageUrl = activeImageVariant === 'shiny' 
    ? pokemon.sprites.front_shiny || pokemon.sprites.other['official-artwork'].front_shiny 
    : pokemon.sprites.other['official-artwork'].front_default;
  const fallbackImageUrl = activeImageVariant === 'shiny'
    ? pokemon.sprites.front_shiny
    : pokemon.sprites.front_default;

  const isFav = isFavorite(pokemon.id);

  // Calculate stats percentage for visualization
  const maxBaseStat = 255; // Maximum possible base stat
  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Navigation */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>

      {/* Main content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header section */}
        <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-8">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-800 dark:to-primary-900" />
          </div>

          <div className="relative z-10 text-center">
            {/* Pokemon image */}
            <div className="relative mb-6">
              <div className="relative w-48 h-48 mx-auto">
                <Image
                  src={imageError ? (fallbackImageUrl || '') : (imageUrl || '')}
                  alt={pokemonName}
                  fill
                  className="object-contain transition-all duration-300 drop-shadow-lg"
                  onError={handleImageError}
                  priority
                />
              </div>

              {/* Image variant toggle */}
              {(pokemon.sprites.front_shiny || pokemon.sprites.other['official-artwork'].front_shiny) && (
                <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-md">
                  <button
                    onClick={() => setActiveImageVariant(activeImageVariant === 'default' ? 'shiny' : 'default')}
                    className={`p-2 rounded-md text-sm font-medium transition-colors ${
                      activeImageVariant === 'shiny'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    aria-label={activeImageVariant === 'shiny' ? 'Show normal sprite' : 'Show shiny sprite'}
                  >
                    <Star className={`h-4 w-4 ${activeImageVariant === 'shiny' ? 'fill-current' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Pokemon info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {pokemonName}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  #{pokemon.id.toString().padStart(3, '0')}
                  {genus && ` • ${genus}`}
                </p>
              </div>

              {/* Types */}
              <div className="flex justify-center space-x-2">
                {pokemon.types.map((type) => (
                  <span
                    key={type.type.name}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm"
                    style={{ backgroundColor: utils.getTypeColor(type.type.name) }}
                  >
                    {utils.formatPokemonName(type.type.name)}
                  </span>
                ))}
              </div>

              {/* Favorite button */}
              <div className="flex justify-center">
                <button
                  onClick={handleFavoriteToggle}
                  className={`inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isFav
                      ? 'bg-red-100 text-red-700 border-2 border-red-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/50'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 mr-2 transition-transform duration-200 ${
                      isFav ? 'fill-current text-red-500 scale-110' : 'hover:scale-110'
                    }`}
                  />
                  {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details section */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic information */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Basic Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center">
                      <Ruler className="h-4 w-4 mr-2" />
                      Height
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {pokemon.height / 10}m ({Math.round(pokemon.height / 10 * 3.28)}ft)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center">
                      <Weight className="h-4 w-4 mr-2" />
                      Weight
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {pokemon.weight / 10}kg ({Math.round(pokemon.weight / 10 * 2.2)}lbs)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Base Experience
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {pokemon.base_experience || 'Unknown'}
                    </span>
                  </div>
                  {species && (
                    <>
                      {species.is_legendary && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Classification</span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">Legendary</span>
                        </div>
                      )}
                      {species.is_mythical && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Classification</span>
                          <span className="font-medium text-pink-600 dark:text-pink-400">Mythical</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Abilities */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Abilities
                </h2>
                <div className="space-y-2">
                  {pokemon.abilities.map((ability) => (
                    <div
                      key={ability.ability.name}
                      className={`flex items-center justify-between p-3 rounded-md ${
                        ability.is_hidden
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {utils.formatPokemonName(ability.ability.name)}
                      </span>
                      {ability.is_hidden && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Base Stats
                </h2>
                <div className="space-y-4">
                  {pokemon.stats.map((stat) => {
                    const percentage = (stat.base_stat / maxBaseStat) * 100;
                    const statName = stat.stat.name
                      .replace('special-', 'sp. ')
                      .replace('-', ' ')
                      .replace(/\b\w/g, l => l.toUpperCase());
                    
                    return (
                      <div key={stat.stat.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {statName}
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {stat.base_stat}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Total stats */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Total Stats
                      </span>
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {totalStats}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="mt-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Navigation to adjacent Pokemon */}
          <div className="mt-8 flex justify-between items-center">
            <div>
              {pokemon.id > 1 && (
                <Link
                  href={`/pokemon/${pokemon.id - 1}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous (#{pokemon.id - 1})
                </Link>
              )}
            </div>
            <div>
              <Link
                href={`/pokemon/${pokemon.id + 1}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
              >
                Next (#{pokemon.id + 1})
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}