import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Star,
  ArrowLeft,
  Heart,
  BookOpen,
  Eye,
  Music,
  Users,
  Edit,
  Trash2,
  Film,
  Tv,
} from 'lucide-react';
import { getReviewById } from '@/lib/db';
import { getPosterUrl, getBackdropUrl } from '@/lib/tmdb';
import DeleteReviewButton from './DeleteReviewButton';

interface ReviewPageProps {
  params: { id: string };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const review = await getReviewById(params.id);

  if (!review) {
    notFound();
  }

  const isTV = review.media_type === 'tv';

  // Couleur basée sur la note
  const getRatingColor = (rating: number) => {
    if (rating >= 7) return 'text-green-400';
    if (rating >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 7) return 'bg-green-500/20';
    if (rating >= 5) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-end pb-12">
      {/* Backdrop */}
      <div className="fixed inset-0 z-0">
        {review.backdrop_path ? (
          <Image
            src={getBackdropUrl(review.backdrop_path)}
            alt={review.title}
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

      {/* Header (Back button & Actions) */}
      <div className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-start pointer-events-none">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors drop-shadow-md pointer-events-auto bg-black/30 hover:bg-black/50 backdrop-blur-md p-3 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>

        {/* Actions right aligned, must be grouped with pointer-events-auto */}
        <div className="flex gap-2 pointer-events-auto">
          <Link
            href={isTV ? `/rate-tv/${review.tmdb_id}` : `/rate/${review.tmdb_id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/80 backdrop-blur-md rounded-full text-sm hover:bg-blue-500 transition-colors shadow-lg"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
          <DeleteReviewButton reviewId={review.id} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-[40vh] md:pt-[50vh]">
        <div className="flex flex-col md:flex-row gap-8 items-start relative">
          {/* Poster */}
          <div className="hidden md:block w-48 lg:w-64 shrink-0 sticky top-24">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              {review.poster_path ? (
                <Image
                  src={getPosterUrl(review.poster_path, 'w500')}
                  alt={review.title}
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

          {/* Info */}
          <div className="flex-1 space-y-4 max-w-4xl w-full mt-8 md:mt-0">
            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                  {review.title}
                </h1>
                {review.original_title && review.original_title !== review.title && (
                  <p className="text-lg text-white/70 mt-1 drop-shadow">{review.original_title}</p>
                )}
              </div>
              {review.is_favorite && (
                <div className="p-3 bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-full flex-shrink-0 shadow-lg">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                </div>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90 drop-shadow">
              <span>{isTV ? 'Série TV' : 'Film'}</span>
              
              {review.release_date && (
                <span>
                  {new Date(review.release_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
              {/* Durée pour les films, saisons/épisodes pour les séries */}
              {isTV && review.number_of_seasons ? (
                <span>
                  {review.number_of_seasons} saison{review.number_of_seasons > 1 ? 's' : ''} • {review.number_of_episodes} épisodes
                </span>
              ) : review.runtime ? (
                <span>
                  {Math.floor(review.runtime / 60)}h {review.runtime % 60}min
                </span>
              ) : null}
              {review.watched_date && (
                <span className="text-white/70">
                  • Vu le {new Date(review.watched_date).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>

            {/* Genres */}
            {review.genres && review.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {review.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-red-950/60 border border-red-900/50 rounded-full text-xs font-medium text-red-200"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Ratings section */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-4">
              {/* Note Globale */}
              <div
                className={`md:col-span-2 flex flex-col justify-center items-center gap-2 p-6 rounded-2xl backdrop-blur-xl border border-white/10 ${getRatingBgColor(
                  review.rating_global
                )} shadow-2xl`}
              >
                <p className="text-sm text-white/70 font-medium tracking-wide uppercase">Note Globale</p>
                <div className="flex items-center gap-3">
                  <Star
                    className={`w-12 h-12 ${getRatingColor(review.rating_global)} drop-shadow-md`}
                    fill="currentColor"
                  />
                  <p className={`text-6xl font-bold ${getRatingColor(review.rating_global)} drop-shadow-md`}>
                    {review.rating_global.toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Ratings détaillés */}
              <div className="md:col-span-3 grid grid-cols-2 gap-4">
                <RatingCard
                  icon={<BookOpen className="w-5 h-5" />}
                  label="Scénario"
                  value={review.rating_scenario}
                />
                <RatingCard
                  icon={<Eye className="w-5 h-5" />}
                  label="Visuel"
                  value={review.rating_visual}
                />
                <RatingCard
                  icon={<Music className="w-5 h-5" />}
                  label="Musique"
                  value={review.rating_music}
                />
                <RatingCard
                  icon={<Users className="w-5 h-5" />}
                  label="Acting"
                  value={review.rating_acting}
                />
              </div>
            </div>

            {/* Review text */}
            {review.review_text && (
              <div className="p-6 md:p-8 bg-dark-200/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl mt-6">
                <h3 className="font-semibold text-lg text-white mb-4">Mon avis</h3>
                <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{review.review_text}</p>
              </div>
            )}

            {/* Synopsis */}
            {review.overview && (
              <div className="pt-4">
                <h3 className="font-semibold text-lg text-white mb-2 drop-shadow">Synopsis</h3>
                <p className="text-white/80 leading-relaxed drop-shadow max-w-3xl">{review.overview}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher une note
function RatingCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const getColor = (rating: number) => {
    if (rating >= 7) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (rating >= 5) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col justify-center ${getColor(value)}`}>
      <div className="flex items-center gap-2 mb-2 opacity-80">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold drop-shadow-sm">{value.toFixed(1)}</p>
    </div>
  );
}
