'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Review, ReviewFormData } from '@/lib/types';
import { fetchProgress, computeNextEpisode, type SeriesProgress } from '@/lib/seriesProgress';
import RatingForm from '@/components/RatingForm';
import MediaActionsClient from './MediaActionsClient';
import {
  Play,
  Star,
  Calendar,
  Heart,
  Plus,
  Check,
  Pencil,
} from 'lucide-react';

interface MediaContentProps {
  media: any;
  mediaType: 'movie' | 'tv';
  mediaId: number;
  existingReview?: Review | null;
  tmdbRating?: number;
  releaseDate?: string;
  title: string;
  genres?: { id: number; name: string }[];
  overview?: string;
}

export default function MediaContent({
  media,
  mediaType,
  mediaId,
  existingReview,
  tmdbRating,
  releaseDate,
  title,
  genres,
  overview,
}: MediaContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showEdit = searchParams.get('edit') === '1';
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [nextEpisode, setNextEpisode] = useState<SeriesProgress | null>(null);

  useEffect(() => {
    if (mediaType === 'tv') {
      fetchProgress(mediaId).then((progress) => {
        if (progress && media.seasons) {
          setNextEpisode(computeNextEpisode(progress, media.seasons));
        }
      });
    }
  }, [mediaType, mediaId, media.seasons]);

  useEffect(() => {
    const checkWatchlist = async () => {
      try {
        const res = await fetch('/api/watchlist');
        if (res.ok) {
          const watchlist = await res.json();
          const found = watchlist.some(
            (item: any) => item.tmdb_id === mediaId && item.media_type === mediaType
          );
          setIsInWatchlist(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setWatchlistLoading(false);
      }
    };
    checkWatchlist();
  }, [mediaId, mediaType]);

  const handleAddToWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: mediaId,
          media_type: mediaType,
          title: media.title || media.name,
          poster_path: media.poster_path,
          release_date: media.release_date || media.first_air_date,
          genre_ids: media.genres?.map((g: any) => g.id) || [],
        }),
      });
      if (res.ok) {
        setIsInWatchlist(true);
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to add to watchlist', err);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    try {
      const res = await fetch(`/api/watchlist/${mediaId}?mediaType=${mediaType}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIsInWatchlist(false);
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to remove from watchlist', err);
    }
  };

  const openForm = () => {
    router.push(`?edit=1`, { scroll: false });
  };

  const closeForm = () => {
    router.push(window.location.pathname, { scroll: false });
  };

  // Adapt media for TV shows (RatingForm expects TMDBMovieDetails shape)
  const adaptedMedia =
    mediaType === 'tv'
      ? {
          ...media,
          title: media.name,
          original_title: media.original_name,
          release_date: media.first_air_date,
          runtime:
            media.episode_run_time?.length > 0
              ? Math.round(
                  media.episode_run_time.reduce((a: number, b: number) => a + b, 0) /
                    media.episode_run_time.length
                )
              : 0,
          media_type: 'tv' as const,
        }
      : media;

  const handleSubmit = async (data: ReviewFormData) => {
    try {
      const url = existingReview ? `/api/reviews/${existingReview.id}` : '/api/reviews';
      const method = existingReview ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      router.refresh();
      closeForm();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 space-y-5 lg:space-y-6 max-w-4xl w-full">
      <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-lg">
        {title}
      </h1>

      {/* Meta info + Action buttons */}
      <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm lg:text-base font-medium text-white/90 drop-shadow">
        <span>{mediaType === 'movie' ? 'Film' : 'Série'}</span>

        {tmdbRating && tmdbRating > 0 && (
          <span className="flex items-center gap-1.5">
            <Star className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" fill="currentColor" />
            {tmdbRating.toFixed(1)}
          </span>
        )}

        {releaseDate && <span>{releaseDate.split('-')[0]}</span>}

        {/* Regarder - always visible */}
        <a
          href={
            mediaType === 'tv' && nextEpisode
              ? `/watch/${mediaType}/${mediaId}?season=${nextEpisode.seasonNumber}&ep=${nextEpisode.episodeNumber}`
              : `/watch/${mediaType}/${mediaId}`
          }
          className="flex items-center gap-2 px-5 lg:px-6 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-colors backdrop-blur-md"
        >
          <Play className="w-4 h-4 lg:w-5 lg:h-5" />
          {mediaType === 'tv' && nextEpisode
            ? `Continuer (S${nextEpisode.seasonNumber} E${nextEpisode.episodeNumber})`
            : 'Regarder'}
        </a>

        {/* Modifier / Noter */}
        {existingReview && !showEdit && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 px-5 lg:px-6 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-colors backdrop-blur-md"
          >
            <Pencil className="w-4 h-4 lg:w-5 lg:h-5" />
            Modifier ma note
          </button>
        )}

        {!existingReview && !showEdit && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 px-5 lg:px-6 py-2 bg-red-600 hover:bg-red-500 text-white border border-red-500/50 rounded-xl transition-colors shadow-lg"
          >
            <Star className="w-4 h-4 lg:w-5 lg:h-5" />
            Noter
          </button>
        )}

        {/* Watchlist - only for unrated */}
        {!existingReview && !watchlistLoading && !isInWatchlist && (
          <button
            onClick={handleAddToWatchlist}
            className="flex items-center gap-2 px-5 lg:px-6 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-colors backdrop-blur-md"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            Watchlist
          </button>
        )}

        {!existingReview && !watchlistLoading && isInWatchlist && (
          <button
            onClick={handleRemoveFromWatchlist}
            className="flex items-center gap-2 px-5 lg:px-6 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-xl transition-colors backdrop-blur-md cursor-pointer"
          >
            <Check className="w-4 h-4 lg:w-5 lg:h-5" />
            Dans la watchlist
          </button>
        )}
      </div>

      {/* Watched date & Favorite (only for rated films) */}
      {existingReview && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 drop-shadow">
          {existingReview.watched_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Vu le {new Date(existingReview.watched_date).toLocaleDateString('fr-FR')}
            </span>
          )}
          {existingReview.is_favorite && (
            <span className="flex items-center gap-1.5 text-red-400">
              <Heart className="w-4 h-4 fill-red-400" />
              Favori
            </span>
          )}
        </div>
      )}

      {/* Genres */}
      {genres && genres.length > 0 && (
        <div className="flex flex-wrap gap-2 lg:gap-3 pt-1">
          {genres.map((genre: any) => (
            <span
              key={genre.id}
              className="px-3 lg:px-4 py-1.5 lg:py-2 bg-red-950/60 border border-red-900/50 rounded-full text-xs lg:text-sm font-medium text-red-200"
            >
              {genre.name}
            </span>
          ))}
        </div>
      )}

      {/* Synopsis */}
      {overview && (
        <p className="text-white/80 text-sm md:text-base lg:text-lg leading-relaxed drop-shadow max-w-3xl py-2">
          {overview}
        </p>
      )}

      {/* Form / Ratings Display */}
      {showEdit ? (
        <div className="mt-8 lg:mt-10 pt-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold drop-shadow text-white">
              {existingReview ? 'Modifier ma note' : 'Noter ' + (mediaType === 'movie' ? 'ce film' : 'cette série')}
            </h2>
            <button
              onClick={closeForm}
              className="text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Annuler
            </button>
          </div>
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
      ) : existingReview ? (
        <div className="mt-8 lg:mt-10 pt-4 w-full">
          <MediaActionsClient
            media={adaptedMedia}
            mediaType={mediaType}
            existingReview={existingReview}
          />
        </div>
      ) : null}
    </div>
  );
}
