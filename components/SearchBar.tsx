'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import type { TMDBMediaItem, SearchMediaResponse, Review } from '@/lib/types';
import SearchResults from './SearchResults';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMediaItem[]>([]);
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les reviews existantes au montage
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (response.ok) {
          const data = await response.json();
          setExistingReviews(data.reviews || []);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  // Debounced search (films + séries)
  const searchMedia = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data: SearchMediaResponse = await response.json();
      setResults(data.results);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMedia(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchMedia]);

  // Fermer les résultats si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleSelectMedia = (media: TMDBMediaItem) => {
    setIsOpen(false);
    // Naviguer vers la page de notation appropriée
    if (media.media_type === 'tv') {
      window.location.href = `/rate-tv/${media.id}`;
    } else {
      window.location.href = `/rate/${media.id}`;
    }
  };

  return (
    <div className="search-container relative w-full">
      <div className="relative">
        {/* Input de recherche */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Rechercher un film ou une série..."
            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl 
                     text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                     focus:ring-red-500/50 focus:border-red-500/50 transition-all"
          />
          
          {/* Icône de chargement ou bouton clear */}
          {isLoading ? (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          ) : query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <p className="absolute mt-2 text-sm text-red-400">{error}</p>
        )}

        {/* Dropdown des résultats */}
        {isOpen && results.length > 0 && (
          <SearchResults
            results={results}
            existingReviews={existingReviews}
            onSelect={handleSelectMedia}
            onClose={() => setIsOpen(false)}
          />
        )}

        {/* Message si aucun résultat */}
        {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
          <div className="absolute w-full mt-2 p-4 bg-dark-200 border border-white/10 rounded-xl text-center text-gray-400">
            Aucun résultat trouvé pour "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
