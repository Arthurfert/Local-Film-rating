'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Film, Tv, Trash2, Search, X, Clapperboard } from 'lucide-react';
import type { WatchlistItem } from '@/lib/types';
import { getPosterUrl } from '@/lib/tmdb';
import SearchBar from '@/components/SearchBar';

type MediaFilter = 'all' | 'movie' | 'animation' | 'tv';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWatchlist(prev => prev.filter(item => item.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper pour détecter les films d'animation (genre ID 16 dans TMDB)
  const isAnimation = (item: WatchlistItem) => item.media_type !== 'tv' && item.genre_ids?.includes(16);
  const isClassicMovie = (item: WatchlistItem) => item.media_type !== 'tv' && !item.genre_ids?.includes(16);

  // Compter les items
  const classicMovieCount = watchlist.filter(isClassicMovie).length;
  const animationCount = watchlist.filter(isAnimation).length;
  const tvCount = watchlist.filter((item) => item.media_type === 'tv').length;

  // Filtrer par type de média
  const mediaFilteredWatchlist = mediaFilter === 'all'
    ? watchlist
    : watchlist.filter((item) => {
        if (mediaFilter === 'movie') return isClassicMovie(item);
        if (mediaFilter === 'animation') return isAnimation(item);
        return item.media_type === 'tv';
      });

  // Filtrer par recherche
  const filteredWatchlist = searchQuery.trim()
    ? mediaFilteredWatchlist.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mediaFilteredWatchlist;

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Chargement de la Watchlist...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <section className="mb-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Ma Watchlist
                </span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Vos films et séries à regarder.
                </p>
            </div>
            {/* Barre de recherche */}
            <div className="max-w-2xl mx-auto">
                <SearchBar onWatchlistChange={fetchWatchlist} />
            </div>
        </section>

      {watchlist.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Liste ({filteredWatchlist.length})</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Barre de recherche dans la watchlist */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-full sm:w-48"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtres par type de média */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg flex-wrap">
              <button
                onClick={() => setMediaFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-colors text-sm ${
                  mediaFilter === 'all'
                    ? 'bg-white/15 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Tout ({watchlist.length})
              </button>
              <button
                onClick={() => setMediaFilter('movie')}
                className={`px-3 py-1.5 rounded-md transition-colors text-sm flex items-center gap-1.5 ${
                  mediaFilter === 'movie'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                Films ({classicMovieCount})
              </button>
              <button
                onClick={() => setMediaFilter('animation')}
                className={`px-3 py-1.5 rounded-md transition-colors text-sm flex items-center gap-1.5 ${
                  mediaFilter === 'animation'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5" />
                Animation ({animationCount})
              </button>
              <button
                onClick={() => setMediaFilter('tv')}
                className={`px-3 py-1.5 rounded-md transition-colors text-sm flex items-center gap-1.5 ${
                  mediaFilter === 'tv'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                Séries ({tvCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {watchlist.length === 0 ? (
        <div className="text-center text-gray-400 text-lg mt-10">
          Votre liste est vide. Cherchez un film ou une série pour l'ajouter !
        </div>
      ) : filteredWatchlist.length === 0 ? (
        <div className="text-center text-gray-400 text-lg mt-10">
          Aucun résultat pour cette recherche ou ce filtre.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredWatchlist.map((item) => (
            <Link 
              key={item.id} 
              href={item.media_type === 'tv' ? `/rate-tv/${item.tmdb_id}` : `/rate/${item.tmdb_id}`}
              className="group relative bg-dark-200 rounded-xl overflow-hidden border border-white/5 transition-transform duration-300 hover:scale-105"
            >
              <div className="aspect-[2/3] relative overflow-hidden bg-white/5">
                {item.poster_path ? (
                  <Image
                    src={getPosterUrl(item.poster_path, 'w342')}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}

                <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                  item.media_type === 'tv' ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  {item.media_type === 'tv' ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                  {item.media_type === 'tv' ? 'Série' : 'Film'}
                </div>

                <button
                  onClick={(e) => removeFromWatchlist(item.id, e)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Retirer de la liste"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="absolute bottom-2 left-2 right-2 bg-blue-500 text-center text-sm font-bold py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Noter
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm truncate">{item.title}</h3>
                <p className="text-xs text-gray-500">
                  Ajouté le {new Date(item.added_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
