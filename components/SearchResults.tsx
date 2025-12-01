'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, Star, ChevronDown, ChevronUp } from 'lucide-react';
import type { TMDBMovie } from '@/lib/types';
import { getPosterUrl } from '@/lib/tmdb';

interface SearchResultsProps {
  results: TMDBMovie[];
  onSelect: (movie: TMDBMovie) => void;
  onClose: () => void;
}

const INITIAL_RESULTS = 8;
const LOAD_MORE_COUNT = 8;

export default function SearchResults({
  results,
  onSelect,
  onClose,
}: SearchResultsProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_RESULTS);

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
        {visibleResults.map((movie) => (
          <li key={movie.id}>
            <button
              onClick={() => onSelect(movie)}
              className="w-full p-3 flex gap-4 hover:bg-white/5 transition-colors text-left"
            >
              {/* Poster */}
              <div className="flex-shrink-0 w-16 h-24 relative rounded-lg overflow-hidden bg-white/5">
                {movie.poster_path ? (
                  <Image
                    src={getPosterUrl(movie.poster_path, 'w92')}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <span className="text-xs text-center px-1">No Image</span>
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate">
                  {movie.title}
                </h4>
                {movie.original_title !== movie.title && (
                  <p className="text-sm text-gray-400 truncate">
                    {movie.original_title}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  {/* Année de sortie */}
                  {movie.release_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  )}
                  
                  {/* Note TMDB */}
                  {movie.vote_average > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Overview tronqué */}
                {movie.overview && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                    {movie.overview}
                  </p>
                )}
              </div>
            </button>
          </li>
        ))}
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
