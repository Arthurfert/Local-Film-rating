import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Tv, Star, ArrowLeft } from 'lucide-react';
import { getTVShowDetails, getPosterUrl, getBackdropUrl } from '@/lib/tmdb';
import { getReviewByTmdbId } from '@/lib/db';
import TVRatingFormClient from './TVRatingFormClient';

interface RateTVPageProps {
  params: { id: string };
}

// Page de notation d'une série TV - Server Component
export default async function RateTVPage({ params }: RateTVPageProps) {
  const tvId = parseInt(params.id, 10);

  if (isNaN(tvId)) {
    notFound();
  }

  let tvShow;
  try {
    tvShow = await getTVShowDetails(tvId);
  } catch (error) {
    console.error('Error fetching TV show:', error);
    notFound();
  }

  // Vérifier si la série a déjà été notée
  const existingReview = await getReviewByTmdbId(tvId, 'tv');

  // Calculer la durée moyenne d'un épisode
  const avgEpisodeRuntime = tvShow.episode_run_time.length > 0
    ? Math.round(tvShow.episode_run_time.reduce((a, b) => a + b, 0) / tvShow.episode_run_time.length)
    : null;

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[40vh] md:h-[50vh]">
        {tvShow.backdrop_path ? (
          <Image
            src={getBackdropUrl(tvShow.backdrop_path)}
            alt={tvShow.name}
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

        {/* Badge Série TV */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-purple-600 rounded-full text-sm font-medium flex items-center gap-1.5">
          <Tv className="w-4 h-4" />
          Série TV
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Poster */}
          <div className="hidden md:block">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl">
              {tvShow.poster_path ? (
                <Image
                  src={getPosterUrl(tvShow.poster_path, 'w500')}
                  alt={tvShow.name}
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

          {/* TV Show Info + Rating Form */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{tvShow.name}</h1>
              {tvShow.original_name !== tvShow.name && (
                <p className="text-lg text-gray-400 mt-1">{tvShow.original_name}</p>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {tvShow.first_air_date && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(tvShow.first_air_date).getFullYear()}
                  {tvShow.last_air_date && tvShow.status !== 'Ended' && ' - En cours'}
                  {tvShow.last_air_date && tvShow.status === 'Ended' && ` - ${new Date(tvShow.last_air_date).getFullYear()}`}
                </span>
              )}
              <span className="flex items-center gap-1 text-gray-400">
                <Tv className="w-4 h-4" />
                {tvShow.number_of_seasons} saison{tvShow.number_of_seasons > 1 ? 's' : ''} • {tvShow.number_of_episodes} épisodes
              </span>
              {avgEpisodeRuntime && (
                <span className="text-gray-400">
                  ~{avgEpisodeRuntime}min/épisode
                </span>
              )}
              {tvShow.vote_average > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg text-yellow-400">
                  <Star className="w-4 h-4" fill="currentColor" />
                  {tvShow.vote_average.toFixed(1)} TMDB
                </span>
              )}
            </div>

            {/* Networks */}
            {tvShow.networks && tvShow.networks.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-gray-500 text-sm">Diffusé sur :</span>
                {tvShow.networks.map((network) => (
                  <span
                    key={network.id}
                    className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-300"
                  >
                    {network.name}
                  </span>
                ))}
              </div>
            )}

            {/* Genres */}
            {tvShow.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tvShow.genres.map((genre) => (
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
            {tvShow.overview && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
                <p className="text-gray-400 leading-relaxed">{tvShow.overview}</p>
              </div>
            )}

            {/* Separator */}
            <hr className="border-white/10" />

            {/* Rating Form */}
            <div>
              <h2 className="text-xl font-bold mb-4">
                {existingReview ? 'Modifier ma note' : 'Noter cette série'}
              </h2>
              {existingReview && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-yellow-400 text-sm">
                  Vous avez déjà noté cette série. Vous pouvez modifier votre note ci-dessous.
                </div>
              )}
              <TVRatingFormClient tvShow={tvShow} existingReview={existingReview} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
