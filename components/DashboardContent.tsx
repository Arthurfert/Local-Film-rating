'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import type { Review } from '@/lib/types';
import MovieGrid from './MovieGrid';

type SortOption = 'recent' | 'top-rated' | 'favorites';

interface DashboardContentProps {
  initialReviews: Review[];
}

export default function DashboardContent({ initialReviews }: DashboardContentProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer par recherche
  const filteredReviews = searchQuery.trim()
    ? initialReviews.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : initialReviews;

  // Trier les reviews selon l'option sélectionnée
  const sortedReviews = [...filteredReviews].sort((a, b) => {
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Mes Films Notés</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Barre de recherche dans les films notés */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans mes films..."
              className="pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-full sm:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Boutons de tri */}
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
      </div>

      {/* Message si aucun résultat */}
      {searchQuery && displayedReviews.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Aucun film trouvé pour "{searchQuery}"
        </div>
      )}

      <MovieGrid reviews={displayedReviews} onSelectReview={handleSelectReview} />
    </section>
  );
}
