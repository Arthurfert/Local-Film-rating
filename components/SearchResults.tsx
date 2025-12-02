'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, Star, ChevronDown, ChevronUp, Check, Film, Tv } from 'lucide-react';
import type { TMDBMediaItem, Review } from '@/lib/types';
import { getPosterUrl } from '@/lib/tmdb';

interface SearchResultsProps {
  results: TMDBMediaItem[];
  existingReviews: Review[];
  onSelect: (media: TMDBMediaItem) => void;
  onClose: () => void;
}

const INITIAL_RESULTS = 8;
const LOAD_MORE_COUNT = 8;

export default function SearchResults({
  results,
  existingReviews,
  onSelect,
  onClose,
}: SearchResultsProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_RESULTS);

  // Créer un map pour trouver rapidement si un média est déjà noté
  // La clé combine tmdb_id et media_type pour distinguer un film d'une série avec le même ID
  const reviewsByKey = new Map(
    existingReviews.map((r) => [`${r.media_type || 'movie'}-${r.tmdb_id}`, r])
  );

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, results.length));
  };

  const showLess = () => {
    setVisibleCount(INITIAL_RESULTS);
  };

  const visibleResults = results.slice(0, visibleCount);
  const remainingCount = results.length - visibleCount;

  return (
    <div className="absolute w-full mt-2 bg-dark-200 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
      <ul className="divide-y divide-white/5">
        {visibleResults.map((media) => {
          const reviewKey = `${media.media_type}-${media.id}`;
          const existingReview = reviewsByKey.get(reviewKey);
          const isRated = !!existingReview;
          const isTV = media.media_type === 'tv';
          
          return (
            <li key={`${media.media_type}-${media.id}`}>
              <button
                onClick={() => onSelect(media)}
                className={`w-full p-3 flex gap-4 hover:bg-white/5 transition-colors text-left ${
                  isRated ? 'bg-green-900/10' : ''
                }`}
              >
                {/* Poster */}
                <div className="flex-shrink-0 w-16 h-24 relative rounded-lg overflow-hidden bg-white/5">
                  {media.poster_path ? (
                    <Image
                      src={getPosterUrl(media.poster_path, 'w92')}
                      alt={media.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <span className="text-xs text-center px-1">No Image</span>
                    </div>
                  )}
                  
                  {/* Badge "Déjà noté" sur le poster */}
                  {isRated && (
                    <div className="absolute top-0 right-0 bg-green-600 rounded-bl-lg p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  {/* Badge Film/Série en bas du poster */}
                  <div className={`absolute bottom-0 left-0 right-0 py-0.5 text-center text-[10px] font-medium ${
                    isTV ? 'bg-purple-600' : 'bg-blue-600'
                  }`}>
                    {isTV ? 'SÉRIE' : 'FILM'}
                  </div>
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {isTV ? (
                        <Tv className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      ) : (
                        <Film className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      )}
                      <h4 className="font-semibold text-white truncate">
                        {media.title}
                      </h4>
                    </div>
                    
                    {/* Badge avec la note si déjà noté */}
                    {isRated && existingReview && (
                      <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-green-600/90 rounded-lg shadow-lg">
                        <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                        <span className="text-xs font-bold text-white">
                          {existingReview.rating_global.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {media.original_title !== media.title && (
                    <p className="text-sm text-gray-400 truncate">
                      {media.original_title}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    {/* Année de sortie */}
                    {media.release_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(media.release_date).getFullYear()}
                      </span>
                    )}
                    
                    {/* Note TMDB */}
                    {media.vote_average > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {media.vote_average.toFixed(1)}
                      </span>
                    )}
                    
                    {/* Indicateur "Déjà noté" */}
                    {isRated && (
                      <span className="text-green-400 text-xs font-medium">
                        Déjà noté
                      </span>
                    )}
                  </div>

                  {/* Overview tronqué */}
                  {media.overview && (
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                      {media.overview}
                    </p>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer avec boutons voir plus/moins */}
      {results.length > INITIAL_RESULTS && (
        <div className="p-2 bg-white/5 border-t border-white/5">
          {remainingCount > 0 ? (
            <button
              onClick={showMore}
              className="w-full p-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ChevronDown className="w-4 h-4" />
              Voir {Math.min(remainingCount, LOAD_MORE_COUNT)} autres résultats
              {remainingCount > LOAD_MORE_COUNT && ` (${remainingCount} restants)`}
            </button>
          ) : (
            <button
              onClick={showLess}
              className="w-full p-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ChevronUp className="w-4 h-4" />
              Réduire la liste
            </button>
          )}
        </div>
      )}
    </div>
  );
}
