import { notFound } from 'next/navigation';
import OptimizedImage from '@/components/OptimizedImage';
import { Calendar, Clock, Star, ArrowLeft, Film } from 'lucide-react';
import { getMovieDetails } from '@/lib/tmdb.server';
import { getPosterUrl, getBackdropUrl } from '@/lib/tmdb';
import { getReviewByTmdbId } from '@/lib/db';
import RatingFormClient from './RatingFormClient';

interface RatePageProps {
  params: Promise<{ id: string }>;
}

// Page de notation d'un film - Server Component
export default async function RatePage({ params }: RatePageProps) {
  const resolvedParams = await params;
  const movieId = parseInt(resolvedParams.id, 10);

  if (isNaN(movieId)) {
    notFound();
  }

  let movie;
  try {
    movie = await getMovieDetails(movieId);
  } catch (error) {
    console.error('Error fetching movie:', error);
    notFound();
  }

  // Vérifier si le film a déjà été noté
  const existingReview = await getReviewByTmdbId(movieId, 'movie');

  return (
    <div className="min-h-screen relative flex flex-col justify-end pb-12">
      {/* Backdrop */}
      <div className="fixed inset-0 z-0">
        {movie.backdrop_path ? (
          <OptimizedImage
            src={getBackdropUrl(movie.backdrop_path)}
            alt={movie.title}
            fill
            className="object-cover object-top"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-200 to-dark-300" />
        )}
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-100/80 via-dark-100/40 to-transparent" />
      </div>

      {/* Header (Back button) */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-start pointer-events-none">
        <a
          href="/"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors drop-shadow-md pointer-events-auto bg-black/30 hover:bg-black/50 backdrop-blur-md p-3 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </a>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-[40vh] md:pt-[50vh]">
        <div className="flex flex-col md:flex-row gap-8 items-start relative">
          {/* Poster */}
          <div className="hidden md:block w-48 lg:w-64 shrink-0 sticky top-24">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              {movie.poster_path ? (
                <OptimizedImage
                  src={getPosterUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Info & Form */}
          <div className="flex-1 space-y-4 max-w-4xl w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
              {movie.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90 drop-shadow">
              <span>Film</span>
              
              {movie.vote_average > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}

              {movie.release_date && (
                <span>
                  {movie.release_date.split('-')[0]}
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-red-950/60 border border-red-900/50 rounded-full text-xs font-medium text-red-200"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {movie.overview && (
              <p className="text-white/80 text-sm md:text-base leading-relaxed drop-shadow max-w-3xl py-2">
                {movie.overview}
              </p>
            )}

            {/* Form */}
            <div className="mt-8 pt-4 w-full">
              <h2 className="text-xl font-bold mb-4 drop-shadow">
                {existingReview ? 'Modifier ma note' : 'Noter ce film'}
              </h2>
              {existingReview && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-yellow-400 text-sm backdrop-blur-md">
                  Vous avez déjà noté ce film. Vous pouvez modifier votre note ci-dessous.
                </div>
              )}
              <div className="w-full bg-dark-200/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                <RatingFormClient movie={movie} existingReview={existingReview} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
