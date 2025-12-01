'use client';

import { Film } from 'lucide-react';
import type { Review } from '@/lib/types';
import MovieCard from './MovieCard';

interface MovieGridProps {
  reviews: Review[];
  onSelectReview?: (review: Review) => void;
}

export default function MovieGrid({ reviews, onSelectReview }: MovieGridProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Film className="w-10 h-10 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          Aucun film noté
        </h3>
        <p className="text-gray-500 max-w-md">
          Commencez par rechercher un film et ajoutez votre première notation !
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {reviews.map((review) => (
        <MovieCard
          key={review.id}
          review={review}
          onSelect={onSelectReview}
        />
      ))}
    </div>
  );
}
