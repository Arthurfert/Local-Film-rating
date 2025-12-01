'use client';

import { useState } from 'react';
import { BookOpen, Eye, Music, Users, Star, Heart, Save, Loader2 } from 'lucide-react';
import type { TMDBMovieDetails, MovieRating, ReviewFormData } from '@/lib/types';
import RatingSlider from './RatingSlider';

interface RatingFormProps {
  movie: TMDBMovieDetails;
  initialData?: Partial<ReviewFormData>;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  isEditing?: boolean;
}

const RATING_ICONS = {
  scenario: BookOpen,
  visual: Eye,
  music: Music,
  acting: Users,
};

const RATING_LABELS = {
  scenario: 'Scénario',
  visual: 'Visuel',
  music: 'Musique',
  acting: 'Acting',
};

const RATING_DESCRIPTIONS = {
  scenario: "Qualité de l'histoire, intrigue, dialogues",
  visual: 'Cinématographie, effets visuels, direction artistique',
  music: 'Bande originale, sound design, ambiance sonore',
  acting: 'Performance des acteurs, casting',
};

export default function RatingForm({
  movie,
  initialData,
  onSubmit,
  isEditing = false,
}: RatingFormProps) {
  const [ratings, setRatings] = useState<MovieRating>({
    scenario: initialData?.rating_scenario ?? 5,
    visual: initialData?.rating_visual ?? 5,
    music: initialData?.rating_music ?? 5,
    acting: initialData?.rating_acting ?? 5,
  });
  const [reviewText, setReviewText] = useState(initialData?.review_text ?? '');
  const [watchedDate, setWatchedDate] = useState(
    initialData?.watched_date ?? new Date().toISOString().split('T')[0]
  );
  const [isFavorite, setIsFavorite] = useState(initialData?.is_favorite ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcul de la note globale
  const globalRating =
    (ratings.scenario + ratings.visual + ratings.music + ratings.acting) / 4;

  const handleRatingChange = (key: keyof MovieRating, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData: ReviewFormData = {
        tmdb_id: movie.id,
        title: movie.title,
        original_title: movie.original_title,
        poster_path: movie.poster_path ?? undefined,
        backdrop_path: movie.backdrop_path ?? undefined,
        release_date: movie.release_date,
        overview: movie.overview,
        genres: movie.genres.map((g) => g.name),
        runtime: movie.runtime,
        rating_scenario: ratings.scenario,
        rating_visual: ratings.visual,
        rating_music: ratings.music,
        rating_acting: ratings.acting,
        review_text: reviewText || undefined,
        watched_date: watchedDate,
        is_favorite: isFavorite,
      };

      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Couleur de la note globale
  const getGlobalRatingColor = () => {
    if (globalRating >= 7) return 'text-green-400';
    if (globalRating >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Note Globale */}
      <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-sm text-gray-400 mb-2">Note Globale</p>
        <div className="flex items-center justify-center gap-2">
          <Star className={`w-8 h-8 ${getGlobalRatingColor()}`} fill="currentColor" />
          <span className={`text-5xl font-bold ${getGlobalRatingColor()}`}>
            {globalRating.toFixed(1)}
          </span>
          <span className="text-2xl text-gray-500">/10</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Calculée automatiquement à partir des 4 critères
        </p>
      </div>

      {/* Critères de notation */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Critères de notation
        </h3>

        <div className="grid gap-6">
          {(Object.keys(RATING_ICONS) as Array<keyof MovieRating>).map((key) => {
            const Icon = RATING_ICONS[key];
            return (
              <div
                key={key}
                className="p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{RATING_LABELS[key]}</h4>
                      <p className="text-xs text-gray-400">
                        {RATING_DESCRIPTIONS[key]}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {ratings[key].toFixed(1)}
                  </span>
                </div>
                <RatingSlider
                  value={ratings[key]}
                  onChange={(value) => handleRatingChange(key, value)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Commentaire */}
      <div className="space-y-3">
        <label htmlFor="review" className="block text-lg font-semibold">
          Votre avis (optionnel)
        </label>
        <textarea
          id="review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Qu'avez-vous pensé de ce film ?"
          rows={4}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white 
                   placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 
                   focus:border-red-500/50 resize-none transition-all"
        />
      </div>

      {/* Date de visionnage et Favori */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="watchedDate" className="block text-sm font-medium mb-2">
            Date de visionnage
          </label>
          <input
            type="date"
            id="watchedDate"
            value={watchedDate}
            onChange={(e) => setWatchedDate(e.target.value)}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white 
                     focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 
                     transition-all"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Favori</label>
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`w-full p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
              isFavorite
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
            />
            {isFavorite ? 'Dans mes favoris' : 'Ajouter aux favoris'}
          </button>
        </div>
      </div>

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl 
                 font-semibold text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 
                 transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {isEditing ? 'Modifier ma note' : 'Enregistrer ma note'}
          </>
        )}
      </button>
    </form>
  );
}
