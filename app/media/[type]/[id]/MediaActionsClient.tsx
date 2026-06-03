'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReviewFormData, Review } from '@/lib/types';
import RatingForm from '@/components/RatingForm';
import { Plus, Check } from 'lucide-react';

interface MediaActionsClientProps {
  media: any;
  mediaType: 'movie' | 'tv';
  existingReview?: Review | null;
}

export default function MediaActionsClient({
  media,
  mediaType,
  existingReview,
}: MediaActionsClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(!!existingReview);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  useEffect(() => {
    // Check if in watchlist
    const checkWatchlist = async () => {
      try {
        const res = await fetch('/api/watchlist');
        if (res.ok) {
          const watchlist = await res.json();
          const found = watchlist.some((item: any) => item.tmdb_id === media.id && item.media_type === mediaType);
          setIsInWatchlist(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setWatchlistLoading(false);
      }
    };
    checkWatchlist();
  }, [media.id, mediaType]);

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

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: media.id,
          media_type: mediaType,
          title: media.title || media.name,
          poster_path: media.poster_path,
          release_date: media.release_date || media.first_air_date,
          genre_ids: media.genres?.map((g: any) => g.id) || []
        })
      });
      if (res.ok) {
        setIsInWatchlist(true);
        // Refresh the router to potentially update global watchlist state if needed
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to add to watchlist', err);
    }
  };

  // Adapt media data for RatingForm
  let adaptedMedia = media;
  if (mediaType === 'tv') {
    const avgEpisodeRuntime = media.episode_run_time?.length > 0
      ? Math.round(media.episode_run_time.reduce((a: number, b: number) => a + b, 0) / media.episode_run_time.length)
      : null;

    adaptedMedia = {
      ...media,
      id: media.id,
      title: media.name,
      original_title: media.original_name,
      overview: media.overview,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      release_date: media.first_air_date,
      vote_average: media.vote_average,
      vote_count: media.vote_count,
      popularity: media.popularity,
      genres: media.genres,
      runtime: avgEpisodeRuntime || 0,
      adult: false,
      original_language: media.original_language,
      video: false,
      budget: 0,
      revenue: 0,
      status: media.status,
      tagline: media.tagline,
      production_companies: media.production_companies,
      production_countries: [],
      spoken_languages: media.spoken_languages,
      imdb_id: null,
      homepage: media.homepage,
      media_type: 'tv',
      number_of_seasons: media.number_of_seasons,
      number_of_episodes: media.number_of_episodes,
    };
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {!showRatingForm && (
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => setShowRatingForm(true)}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-red-600/20"
          >
            Noter
          </button>
          
          {!watchlistLoading && !isInWatchlist && (
            <button
              onClick={handleAddToWatchlist}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold border border-white/10 rounded-xl transition-colors flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Plus className="w-5 h-5" />
              Ajouter à la watchlist
            </button>
          )}

          {!watchlistLoading && isInWatchlist && (
             <div className="px-8 py-3 bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 rounded-xl flex items-center justify-center gap-2 backdrop-blur-md">
               <Check className="w-5 h-5" />
               Dans la watchlist
             </div>
          )}
        </div>
      )}

      {showRatingForm && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold mb-4 drop-shadow text-white">
            {existingReview ? 'Modifier ma note' : 'Noter ' + (mediaType === 'movie' ? 'ce film' : 'cette série')}
          </h2>
          {existingReview && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-yellow-400 text-sm backdrop-blur-md">
              {`Vous avez déjà noté ` + (mediaType === 'movie' ? 'ce film' : 'cette série') + `. Vous pouvez modifier votre note ci-dessous.`}
            </div>
          )}
          <div className="w-full bg-dark-200/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
            <RatingForm
              movie={adaptedMedia}
              mediaType={mediaType}
              initialData={existingReview ? {
                tmdb_id: existingReview.tmdb_id,
                media_type: mediaType,
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
        </div>
      )}
    </div>
  );
}
