'use client';

import Image from 'next/image';
import { Star, Heart, Calendar, Clock } from 'lucide-react';
import type { Review } from '@/lib/types';
import { getPosterUrl } from '@/lib/tmdb';

interface MovieCardProps {
  review: Review;
  onSelect?: (review: Review) => void;
}

export default function MovieCard({ review, onSelect }: MovieCardProps) {
  // Couleur basée sur la note
  const getRatingColor = (rating: number) => {
    if (rating >= 7) return 'text-green-400 bg-green-500/20';
    if (rating >= 5) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
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

        {/* Badge favori */}
        {review.is_favorite && (
          <div className="absolute top-2 left-2 p-1.5 bg-red-500 rounded-full">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        )}

        {/* Badge note globale */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-lg ${getRatingColor(
            review.rating_global
          )} font-bold text-sm flex items-center gap-1`}
        >
          <Star className="w-3 h-3" fill="currentColor" />
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
          {review.runtime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.floor(review.runtime / 60)}h{review.runtime % 60}m
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
