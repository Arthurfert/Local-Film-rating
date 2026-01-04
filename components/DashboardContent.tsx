'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Film, Tv, Clapperboard } from 'lucide-react';
import type { Review, MediaType } from '@/lib/types';
import MovieGrid from './MovieGrid';

type SortOption = 'recent' | 'top-rated' | 'favorites';
type MediaFilter = 'all' | 'movie' | 'animation' | 'tv';

interface DashboardContentProps {
  initialReviews: Review[];
}

export default function DashboardContent({ initialReviews }: DashboardContentProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  // Helper pour détecter les films d'animation
  const isAnimation = (r: Review) => r.media_type !== 'tv' && r.genres?.includes('Animation');
  const isClassicMovie = (r: Review) => r.media_type !== 'tv' && !r.genres?.includes('Animation');

  // Compter les films, animations et séries
  const classicMovieCount = reviews.filter(isClassicMovie).length;
  const animationCount = reviews.filter(isAnimation).length;
  const tvCount = reviews.filter((r) => r.media_type === 'tv').length;

  // Filtrer par type de média
  const mediaFilteredReviews = mediaFilter === 'all'
    ? reviews
    : reviews.filter((r) => {
        if (mediaFilter === 'movie') return isClassicMovie(r);
        if (mediaFilter === 'animation') return isAnimation(r);
        return r.media_type === 'tv';
      });

  // Filtrer par recherche
  const filteredReviews = searchQuery.trim()
    ? mediaFilteredReviews.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mediaFilteredReviews;
 
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

  const handleFavoriteToggle = (reviewId: string, isFavorite: boolean) => {
    // Mettre à jour localement l'état
    setReviews((prevReviews) =>
      prevReviews.map((r) =>
        r.id === reviewId ? { ...r, is_favorite: isFavorite } : r
      )
    );
  };

  return (
    <section>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Ma Collection</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Barre de recherche dans les films notés */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-full sm:w-48"
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

          {/* Filtres par type de média */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
            <button
              onClick={() => setMediaFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors text-sm ${
                mediaFilter === 'all'
                  ? 'bg-white/15 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tout ({initialReviews.length})
            </button>
            <button
              onClick={() => setMediaFilter('movie')}
              className={`px-3 py-1.5 rounded-md transition-colors text-sm flex items-center gap-1.5 ${
                mediaFilter === 'movie'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Films ({classicMovieCount})
            </button>
            <button
              onClick={() => setMediaFilter('animation')}
              className={`px-3 py-1.5 rounded-md transition-colors text-sm flex items-center gap-1.5 ${
                mediaFilter === 'animation'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5" />
              Animation ({animationCount})
            </button>
            <button
              onClick={() => setMediaFilter('tv')}
              className={`px-3 py-1.5 rounded-md transition-colors text-sm flex items-center gap-1.5 ${
                mediaFilter === 'tv'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Séries ({tvCount})
            </button>
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
      {displayedReviews.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {searchQuery 
            ? `Aucun résultat pour "${searchQuery}"`
            : mediaFilter === 'tv' 
              ? 'Aucune série notée'
              : mediaFilter === 'movie'
                ? 'Aucun film noté'
                : 'Aucun contenu noté'
          }
        </div>
      )}

      <MovieGrid 
        reviews={displayedReviews} 
        onSelectReview={handleSelectReview} 
        onFavoriteToggle={handleFavoriteToggle}
      />
    </section>
  );
}
