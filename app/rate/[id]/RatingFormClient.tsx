'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TMDBMovieDetails, ReviewFormData, Review } from '@/lib/types';
import RatingForm from '@/components/RatingForm';

interface RatingFormClientProps {
  movie: TMDBMovieDetails;
  existingReview?: Review | null;
}

export default function RatingFormClient({
  movie,
  existingReview,
}: RatingFormClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ReviewFormData) => {
    setError(null);

    try {
      const url = existingReview
        ? `/api/reviews/${existingReview.id}`
        : '/api/reviews';
      
      const method = existingReview ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      // Rediriger vers le dashboard
      router.push('/');
      router.refresh(); // Rafraîchir les données
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
          {error}
        </div>
      )}
      <RatingForm
        movie={movie}
        initialData={existingReview ? {
          tmdb_id: existingReview.tmdb_id,
          title: existingReview.title,
          rating_scenario: existingReview.rating_scenario,
          rating_visual: existingReview.rating_visual,
          rating_music: existingReview.rating_music,
          rating_acting: existingReview.rating_acting,
          review_text: existingReview.review_text || undefined,
          watched_date: existingReview.watched_date || undefined,
          is_favorite: existingReview.is_favorite,
        } : undefined}
        onSubmit={handleSubmit}
        isEditing={!!existingReview}
      />
    </div>
  );
}
