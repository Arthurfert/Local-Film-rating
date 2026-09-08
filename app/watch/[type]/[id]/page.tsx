import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Film, Tv, Loader2, Pencil } from 'lucide-react';
import { getMovieDetails, getTVShowDetails } from '@/lib/tmdb.server';
import { getPosterUrl } from '@/lib/tmdb';
import { getReviewByTmdbId } from '@/lib/db';
import { WatchClientLazy as WatchClient } from './DynamicWatchClient';
import { Suspense } from 'react';

interface WatchPageProps {
  params: Promise<{ type: string; id: string }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const resolvedParams = await params;
  const { type, id } = resolvedParams;
  const mediaId = parseInt(id, 10);

  if (isNaN(mediaId) || (type !== 'movie' && type !== 'tv')) {
    notFound();
  }

  let media: any;
  try {
    if (type === 'movie') {
      media = await getMovieDetails(mediaId);
    } else {
      media = await getTVShowDetails(mediaId);
    }
  } catch (error) {
    console.error('Error fetching media:', error);
    notFound();
  }

  const existingReview = await getReviewByTmdbId(mediaId, type as 'movie' | 'tv');
  const title = media.title || media.name;
  const releaseDate = media.release_date || media.first_air_date;

  const seasons = type === 'tv' && media.seasons
    ? media.seasons
        .filter((s: { season_number: number; episode_count: number }) => s.season_number >= 1 && s.episode_count > 0)
        .sort((a: { season_number: number }, b: { season_number: number }) => a.season_number - b.season_number)
        .map((s: { season_number: number; episode_count: number }) => ({
          seasonNumber: s.season_number,
          episodeCount: s.episode_count,
        }))
    : undefined;

  return (
    <div className="min-h-screen bg-dark-100">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 lg:p-6 flex justify-between items-start pointer-events-none">
        <a
          href={`/media/${type}/${id}`}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors drop-shadow-md pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md p-3 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
        </a>
      </div>

      {/* Player Section */}
      <div className="w-full bg-dark-100 pt-16">
        <div className="max-w-7xl mx-auto px-0 lg:px-4 py-4">
          <Suspense fallback={
            <div className="aspect-video bg-dark-200/80 rounded-2xl flex flex-col items-center justify-center gap-4 border border-white/5">
              <div className="relative">
                <Film className="w-10 h-10 text-white/15" />
                <Loader2 className="w-5 h-5 text-red-400 absolute -bottom-1 -right-1 animate-spin" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm text-white/40 font-medium">Chargement du lecteur</span>
                <span className="text-[11px] text-white/20">Récupération du flux en cours...</span>
              </div>
            </div>
          }>
            <WatchClient
              type={type as 'movie' | 'tv'}
              id={mediaId}
              title={title}
              poster={media.poster_path ? getPosterUrl(media.poster_path, 'w500') : undefined}
              seasons={seasons}
            />
          </Suspense>
        </div>
      </div>

      {/* Media Info */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white flex-1 min-w-0">
                {title}
              </h1>
              {existingReview ? (
                <a
                  href={`/media/${type}/${id}?edit=1`}
                  className="flex items-center gap-2 px-5 lg:px-6 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-colors backdrop-blur-md shrink-0"
                >
                  <Pencil className="w-4 h-4 lg:w-5 lg:h-5" />
                  Modifier ma note
                </a>
              ) : (
                <a
                  href={`/media/${type}/${id}?edit=1`}
                  className="flex items-center gap-2 px-5 lg:px-6 py-2 bg-red-600 hover:bg-red-500 text-white border border-red-500/50 rounded-xl transition-colors shadow-lg shrink-0"
                >
                  <Star className="w-4 h-4 lg:w-5 lg:h-5" />
                  Noter
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/70 mb-4">
              <span className="flex items-center gap-1.5">
                {type === 'movie' ? (
                  <Film className="w-4 h-4" />
                ) : (
                  <Tv className="w-4 h-4" />
                )}
                {type === 'movie' ? 'Film' : 'Série'}
              </span>

              {media.vote_average > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  {media.vote_average.toFixed(1)}
                </span>
              )}

              {releaseDate && (
                <span>{releaseDate.split('-')[0]}</span>
              )}

              {type === 'tv' && media.number_of_seasons && (
                <span>{media.number_of_seasons}S / {media.number_of_episodes}E</span>
              )}
            </div>

            {media.overview && (
              <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-3xl">
                {media.overview}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
