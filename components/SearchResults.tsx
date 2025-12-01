'use client';

import Image from 'next/image';
import { Calendar, Star } from 'lucide-react';
import type { TMDBMovie } from '@/lib/types';
import { getPosterUrl } from '@/lib/tmdb';

interface SearchResultsProps {
  results: TMDBMovie[];
  onSelect: (movie: TMDBMovie) => void;
  onClose: () => void;
}

export default function SearchResults({
  results,
  onSelect,
  onClose,
}: SearchResultsProps) {
  return (
    <div className="absolute w-full mt-2 bg-dark-200 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
      <ul className="divide-y divide-white/5">
        {results.slice(0, 8).map((movie) => (
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

      {/* Footer avec nombre de résultats */}
      {results.length > 8 && (
        <div className="p-3 bg-white/5 text-center text-sm text-gray-400">
          {results.length - 8} autres résultats...
        </div>
      )}
    </div>
  );
}
