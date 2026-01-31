'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, Heart, Calendar, Clock, Film, Tv, Clock3 } from 'lucide-react';
import type { Review } from '@/lib/types';
import { getPosterUrl } from '@/lib/tmdb';
import { formatRelativeTime } from '@/lib/utils';

interface MovieCardProps {
  review: Review;
  onSelect?: (review: Review) => void;
  onFavoriteToggle?: (reviewId: string, isFavorite: boolean) => void;
}

export default function MovieCard({ review, onSelect, onFavoriteToggle }: MovieCardProps) {
  const isTV = review.media_type === 'tv';
  const [isFavorite, setIsFavorite] = useState(review.is_favorite);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  
  // Couleur basée sur la note
  const getRatingColor = (rating: number) => {
    if (rating >= 7) return 'text-green-400 bg-green-500/20';
    if (rating >= 5) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la navigation vers la page de détail
    e.preventDefault(); // Empêcher tout comportement par défaut
    
    if (isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    const newFavoriteState = !isFavorite;
    
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_favorite: newFavoriteState,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      setIsFavorite(newFavoriteState);
      onFavoriteToggle?.(review.id, newFavoriteState);
    } catch (error) {
      console.error('Erreur lors du toggle favori:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <div
      onClick={() => onSelect?.(review)}
      className="movie-card group relative bg-dark-200 rounded-xl overflow-hidden border border-white/5 cursor-pointer"
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden">
        {review.poster_path ? (
          <Image
            src={getPosterUrl(review.poster_path, 'w342')}
            alt={review.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}

        {/* Badge Film/Série */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
          isTV ? 'bg-purple-600' : 'bg-blue-600'
        }`}>
          {isTV ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
          {isTV ? 'Série' : 'Film'}
        </div>

        {/* Badge favori - Toujours visible si favori, visible au hover sinon */}
        <button
          onClick={handleFavoriteClick}
          disabled={isTogglingFavorite}
          className={`absolute top-10 left-2 p-1.5 rounded-full transition-all z-10 ${
            isFavorite 
              ? 'bg-red-500 opacity-100' 
              : 'bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/20'
          }`}
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart 
            className={`w-4 h-4 transition-all ${
              isFavorite ? 'text-white fill-white' : 'text-gray-300'
            }`}
          />
        </button>

        {/* Badge note globale */}
        <div
          className={`absolute top-2 right-2 px-2.5 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1 shadow-lg backdrop-blur-sm border ${
            review.rating_global >= 7
              ? 'bg-green-600/90 text-white border-green-400/50'
              : review.rating_global >= 5
              ? 'bg-yellow-500/90 text-black border-yellow-300/50'
              : 'bg-red-600/90 text-white border-red-400/50'
          }`}
        >
          <Star className="w-3.5 h-3.5" fill="currentColor" />
          {review.rating_global.toFixed(1)}
        </div>

        {/* Overlay au hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
            {/* Notes détaillées */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Scénario</span>
                <span className="font-semibold">{review.rating_scenario.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Visuel</span>
                <span className="font-semibold">{review.rating_visual.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Musique</span>
                <span className="font-semibold">{review.rating_music.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Acting</span>
                <span className="font-semibold">{review.rating_acting.toFixed(1)}</span>
              </div>
            </div>

            {/* Date de publication */}
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 border-t border-white/10 pt-2">
              <Clock3 className="w-3 h-3" />
              <span>Posté {formatRelativeTime(review.created_at)}</span>
            </div>

            {/* Avis */}
            {review.review_text && (
              <p className="text-xs text-gray-300 line-clamp-2">
                {review.review_text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="p-3">
        <h3 className="font-semibold truncate" title={review.title}>
          {review.title}
        </h3>
        
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          {review.release_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(review.release_date).getFullYear()}
            </span>
          )}
          {/* Durée pour les films, saisons/épisodes pour les séries */}
          {isTV && review.number_of_seasons ? (
            <span className="flex items-center gap-1">
              <Tv className="w-3 h-3" />
              {review.number_of_seasons}S • {review.number_of_episodes}E
            </span>
          ) : review.runtime ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.floor(review.runtime / 60)}h{review.runtime % 60}m
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
