'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton';

// Code-split the Pokemon detail component
const PokemonDetail = dynamic(() => import('@/components/pokemon/PokemonDetail'), {
  loading: () => <DetailSkeleton />,
  ssr: false,
});

export default function PokemonDetailPage() {
  const params = useParams();
  const pokemonId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="relative">
        <Suspense fallback={<DetailSkeleton />}>
          <PokemonDetail pokemonId={pokemonId} />
        </Suspense>
      </main>
    </div>
  );
}