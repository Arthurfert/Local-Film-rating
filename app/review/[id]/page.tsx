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
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[40vh] md:h-[50vh]">
        {review.backdrop_path ? (
          <Image
            src={getBackdropUrl(review.backdrop_path)}
            alt={review.title}
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
        <Link
          href="/"
          className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-sm hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        {/* Badge Film/Série */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
          isTV ? 'bg-purple-600' : 'bg-blue-600'
        }`}>
          {isTV ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
          {isTV ? 'Série TV' : 'Film'}
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Link
            href={isTV ? `/rate-tv/${review.tmdb_id}` : `/rate/${review.tmdb_id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/80 backdrop-blur-sm rounded-full text-sm hover:bg-blue-500 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
          <DeleteReviewButton reviewId={review.id} />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Poster */}
          <div className="hidden md:block">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl">
              {review.poster_path ? (
                <Image
                  src={getPosterUrl(review.poster_path, 'w500')}
                  alt={review.title}
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

          {/* Info */}
          <div className="space-y-6">
            {/* Title */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{review.title}</h1>
                {review.original_title && review.original_title !== review.title && (
                  <p className="text-lg text-gray-400 mt-1">{review.original_title}</p>
                )}
              </div>
              {review.is_favorite && (
                <div className="p-2 bg-red-500 rounded-full flex-shrink-0">
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {review.release_date && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(review.release_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
              {/* Durée pour les films, saisons/épisodes pour les séries */}
              {isTV && review.number_of_seasons ? (
                <span className="flex items-center gap-1 text-gray-400">
                  <Tv className="w-4 h-4" />
                  {review.number_of_seasons} saison{review.number_of_seasons > 1 ? 's' : ''} • {review.number_of_episodes} épisodes
                </span>
              ) : review.runtime ? (
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-4 h-4" />
                  {Math.floor(review.runtime / 60)}h {review.runtime % 60}min
                </span>
              ) : null}
              {review.watched_date && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Eye className="w-4 h-4" />
                  Vu le {new Date(review.watched_date).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>

            {/* Genres */}
            {review.genres && review.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {review.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Note Globale */}
            <div
              className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl ${getRatingBgColor(
                review.rating_global
              )}`}
            >
              <Star
                className={`w-10 h-10 ${getRatingColor(review.rating_global)}`}
                fill="currentColor"
              />
              <div>
                <p className="text-sm text-gray-400">Note Globale</p>
                <p className={`text-4xl font-bold ${getRatingColor(review.rating_global)}`}>
                  {review.rating_global.toFixed(1)}
                  <span className="text-xl text-gray-500">/10</span>
                </p>
              </div>
            </div>

            {/* Ratings détaillés */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Review text */}
            {review.review_text && (
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="font-semibold mb-3">Mon avis</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{review.review_text}</p>
              </div>
            )}

            {/* Synopsis */}
            {review.overview && (
              <div>
                <h3 className="font-semibold mb-2">Synopsis</h3>
                <p className="text-gray-400 leading-relaxed">{review.overview}</p>
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
    <div className={`p-4 rounded-xl border ${getColor(value)}`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toFixed(1)}</p>
    </div>
  );
}
