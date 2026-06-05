'use client';

import type { Review } from '@/lib/types';
import {
  BookOpen,
  Eye,
  Music,
  Users,
  Star,
} from 'lucide-react';

interface MediaActionsClientProps {
  media: any;
  mediaType: 'movie' | 'tv';
  existingReview: Review;
}

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
    <div className={`p-4 lg:p-5 rounded-xl border backdrop-blur-md shadow-lg flex flex-col justify-center ${getColor(value)}`}>
      <div className="flex items-center gap-2 mb-1 lg:mb-2 opacity-80">
        {icon}
        <span className="text-xs lg:text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl lg:text-3xl font-bold drop-shadow-sm">{value.toFixed(1)}</p>
    </div>
  );
}

export default function MediaActionsClient({
  media: _media,
  mediaType: _mediaType,
  existingReview,
}: MediaActionsClientProps) {
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Ratings section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6">
        <div
          className={`md:col-span-2 flex flex-col justify-center items-center gap-2 p-6 lg:p-8 rounded-2xl backdrop-blur-xl border border-white/10 ${getRatingBgColor(
            existingReview.rating_global
          )} shadow-2xl`}
        >
          <p className="text-xs lg:text-sm text-white/70 font-medium tracking-wide uppercase">Note Globale</p>
          <div className="flex items-center gap-3">
            <Star
              className={`w-10 h-10 lg:w-14 lg:h-14 ${getRatingColor(existingReview.rating_global)} drop-shadow-md`}
              fill="currentColor"
            />
            <p className={`text-5xl lg:text-6xl font-bold ${getRatingColor(existingReview.rating_global)} drop-shadow-md`}>
              {existingReview.rating_global.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="md:col-span-3 grid grid-cols-2 gap-3 lg:gap-4">
          <RatingCard
            icon={<BookOpen className="w-4 h-4 lg:w-5 lg:h-5" />}
            label="Scénario"
            value={existingReview.rating_scenario}
          />
          <RatingCard
            icon={<Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
            label="Visuel"
            value={existingReview.rating_visual}
          />
          <RatingCard
            icon={<Music className="w-4 h-4 lg:w-5 lg:h-5" />}
            label="Musique"
            value={existingReview.rating_music}
          />
          <RatingCard
            icon={<Users className="w-4 h-4 lg:w-5 lg:h-5" />}
            label="Acting"
            value={existingReview.rating_acting}
          />
        </div>
      </div>

      {/* Review text */}
      {existingReview.review_text && (
        <div className="p-5 lg:p-6 bg-dark-200/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl mt-4">
          <h3 className="font-semibold text-base lg:text-lg text-white mb-3">Mon avis</h3>
          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{existingReview.review_text}</p>
        </div>
      )}
    </div>
  );
}
