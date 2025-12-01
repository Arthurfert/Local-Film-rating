'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Review } from '@/lib/types';
import MovieGrid from './MovieGrid';

type SortOption = 'recent' | 'top-rated' | 'favorites';

interface DashboardContentProps {
  initialReviews: Review[];
}

export default function DashboardContent({ initialReviews }: DashboardContentProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Trier les reviews selon l'option sélectionnée
  const sortedReviews = [...initialReviews].sort((a, b) => {
    switch (sortBy) {
      case 'top-rated':
        return b.rating_global - a.rating_global;
      case 'favorites':
        // Favoris en premier, puis par note
        if (a.is_favorite && !b.is_favorite) return -1;
        if (!a.is_favorite && b.is_favorite) return 1;
        return b.rating_global - a.rating_global;
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Filtrer pour n'afficher que les favoris si l'option est sélectionnée
  const displayedReviews =
    sortBy === 'favorites'
      ? sortedReviews.filter((r) => r.is_favorite)
      : sortedReviews;

  const handleSelectReview = (review: Review) => {
    router.push(`/review/${review.id}`);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mes Films Notés</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              sortBy === 'recent'
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Plus récents
          </button>
          <button
            onClick={() => setSortBy('top-rated')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              sortBy === 'top-rated'
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Mieux notés
          </button>
          <button
            onClick={() => setSortBy('favorites')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              sortBy === 'favorites'
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Favoris
          </button>
        </div>
      </div>

      <MovieGrid reviews={displayedReviews} onSelectReview={handleSelectReview} />
    </section>
  );
}
