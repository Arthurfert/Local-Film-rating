'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TMDBTVShowDetails, ReviewFormData, Review } from '@/lib/types';
import RatingForm from '@/components/RatingForm';

interface TVRatingFormClientProps {
  tvShow: TMDBTVShowDetails;
  existingReview?: Review | null;
}

export default function TVRatingFormClient({
  tvShow,
  existingReview,
}: TVRatingFormClientProps) {
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
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  // Calculer la durée moyenne d'un épisode
  const avgEpisodeRuntime = tvShow.episode_run_time.length > 0
    ? Math.round(tvShow.episode_run_time.reduce((a, b) => a + b, 0) / tvShow.episode_run_time.length)
    : null;

  // Adapter les données de la série au format attendu par RatingForm
  const adaptedTVShow = {
    id: tvShow.id,
    title: tvShow.name,
    original_title: tvShow.original_name,
    overview: tvShow.overview,
    poster_path: tvShow.poster_path,
    backdrop_path: tvShow.backdrop_path,
    release_date: tvShow.first_air_date,
    vote_average: tvShow.vote_average,
    vote_count: tvShow.vote_count,
    popularity: tvShow.popularity,
    genres: tvShow.genres,
    runtime: avgEpisodeRuntime || 0,
    adult: false,
    original_language: tvShow.original_language,
    video: false,
    budget: 0,
    revenue: 0,
    status: tvShow.status,
    tagline: tvShow.tagline,
    production_companies: tvShow.production_companies,
    production_countries: [],
    spoken_languages: tvShow.spoken_languages,
    imdb_id: null,
    homepage: tvShow.homepage,
    // Champs spécifiques aux séries
    media_type: 'tv' as const,
    number_of_seasons: tvShow.number_of_seasons,
    number_of_episodes: tvShow.number_of_episodes,
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
          {error}
        </div>
      )}
      <RatingForm
        movie={adaptedTVShow}
        mediaType="tv"
        initialData={existingReview ? {
          tmdb_id: existingReview.tmdb_id,
          media_type: 'tv',
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
