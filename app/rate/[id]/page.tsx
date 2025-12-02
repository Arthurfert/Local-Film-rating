import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Clock, Star, ArrowLeft, Film } from 'lucide-react';
import { getMovieDetails, getPosterUrl, getBackdropUrl } from '@/lib/tmdb';
import { getReviewByTmdbId } from '@/lib/db';
import RatingFormClient from './RatingFormClient';

interface RatePageProps {
  params: { id: string };
}

// Page de notation d'un film - Server Component
export default async function RatePage({ params }: RatePageProps) {
  const movieId = parseInt(params.id, 10);

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
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[40vh] md:h-[50vh]">
        {movie.backdrop_path ? (
          <Image
            src={getBackdropUrl(movie.backdrop_path)}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-200 to-dark-300" />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/80 to-transparent" />
        
        {/* Back button */}
        <a
          href="/"
          className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-sm hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </a>

        {/* Badge Film */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-blue-600 rounded-full text-sm font-medium flex items-center gap-1.5">
          <Film className="w-4 h-4" />
          Film
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Poster */}
          <div className="hidden md:block">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl">
              {movie.poster_path ? (
                <Image
                  src={getPosterUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Movie Info + Rating Form */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
              {movie.original_title !== movie.title && (
                <p className="text-lg text-gray-400 mt-1">{movie.original_title}</p>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {movie.release_date && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(movie.release_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
              {movie.runtime > 0 && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-4 h-4" />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}min
                </span>
              )}
              {movie.vote_average > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg text-yellow-400">
                  <Star className="w-4 h-4" fill="currentColor" />
                  {movie.vote_average.toFixed(1)} TMDB
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {movie.overview && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
                <p className="text-gray-400 leading-relaxed">{movie.overview}</p>
              </div>
            )}

            {/* Separator */}
            <hr className="border-white/10" />

            {/* Rating Form */}
            <div>
              <h2 className="text-xl font-bold mb-4">
                {existingReview ? 'Modifier ma note' : 'Noter ce film'}
              </h2>
              {existingReview && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-yellow-400 text-sm">
                  Vous avez déjà noté ce film. Vous pouvez modifier votre note ci-dessous.
                </div>
              )}
              <RatingFormClient movie={movie} existingReview={existingReview} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
