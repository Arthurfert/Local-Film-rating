import { notFound } from 'next/navigation';
import OptimizedImage from '@/components/OptimizedImage';
import { ArrowLeft } from 'lucide-react';
import { getMovieDetails, getTVShowDetails } from '@/lib/tmdb.server';
import { getPosterUrl, getBackdropUrl } from '@/lib/tmdb';
import { getReviewByTmdbId } from '@/lib/db';
import MediaContent from './MediaContent';

interface MediaPageProps {
  params: Promise<{ type: string; id: string }>;
}

export default async function MediaPage({ params }: MediaPageProps) {
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

  return (
    <div className="min-h-screen relative flex flex-col justify-end pb-12">
      {/* Backdrop */}
      <div className="fixed inset-0 z-0">
        {media.backdrop_path ? (
          <OptimizedImage
            src={getBackdropUrl(media.backdrop_path)}
            alt={title}
            fill
            className="object-cover object-top"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-200 to-dark-300" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-100/80 via-dark-100/40 to-transparent" />
      </div>

      {/* Header (Back button) */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 lg:p-8 flex justify-between items-start pointer-events-none">
        <a
          href="/"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors drop-shadow-md pointer-events-auto bg-black/30 hover:bg-black/50 backdrop-blur-md p-3 lg:p-4 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 lg:w-8 lg:h-8" />
        </a>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pt-[40vh] md:pt-[50vh]">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start relative">
          {/* Poster */}
          <div className="hidden md:block w-48 lg:w-72 xl:w-80 shrink-0 sticky top-24">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              {media.poster_path ? (
                <OptimizedImage
                  src={getPosterUrl(media.poster_path, 'w500')}
                  alt={title}
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

          {/* Info & Actions */}
          <MediaContent
            media={media}
            mediaType={type as 'movie' | 'tv'}
            mediaId={mediaId}
            existingReview={existingReview}
            tmdbRating={media.vote_average}
            releaseDate={releaseDate}
            title={title}
            genres={media.genres}
            overview={media.overview}
          />
        </div>
      </div>
    </div>
  );
}
