'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import type { StreamResponse } from '@/lib/stream';
import { AlertCircle, Loader2 } from 'lucide-react';

interface WatchClientProps {
  type: 'movie' | 'tv';
  id: number;
  title?: string;
  poster?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
}

export default function WatchClient({
  type,
  id,
  title,
  poster,
  numberOfSeasons,
  numberOfEpisodes,
}: WatchClientProps) {
  const [season, setSeason] = useState(1);
  const [ep, setEp] = useState(1);
  const [stream, setStream] = useState<StreamResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStream = async (s: number, e: number) => {
    try {
      setLoading(true);
      setError(null);
      const params = type === 'tv' ? `?season=${s}&ep=${e}` : '';
      const res = await fetch(`/api/stream/${type}/${id}${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors du chargement du flux');
      }
      const data = await res.json();
      setStream(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStream(season, ep);
  }, [type, id, season, ep]);

  if (error && !loading) {
    return (
      <div className="flex items-center justify-center aspect-video bg-black/80 rounded-2xl">
        <div className="flex flex-col items-center gap-3 text-center px-6 max-w-md">
          <AlertCircle className="w-10 h-10 text-yellow-500" />
          <p className="text-white/80 text-sm">{error}</p>
          <p className="text-white/40 text-xs">
            Configurez les variables STREAM_MOVIE_URL_PATTERN ou STREAM_TV_URL_PATTERN dans .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Player */}
      {loading ? (
        <div className="flex items-center justify-center aspect-video bg-black/80 rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-white/60">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Chargement du lecteur...</span>
          </div>
        </div>
      ) : stream ? (
        <VideoPlayer
          stream={stream}
          title={title}
          poster={poster}
        />
      ) : null}

      {/* TV Show Season/Episode Selector */}
      {type === 'tv' && numberOfSeasons && (
        <div className="flex items-center gap-4 mt-4 px-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-white/60">Saison</label>
            <select
              value={season}
              onChange={(e) => {
                const s = parseInt(e.target.value, 10);
                setSeason(s);
                setEp(1);
              }}
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              {Array.from({ length: numberOfSeasons }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s} className="bg-dark-200">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-white/60">Épisode</label>
            <select
              value={ep}
              onChange={(e) => setEp(parseInt(e.target.value, 10))}
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              {Array.from(
                { length: numberOfEpisodes ?? 1 },
                (_, i) => i + 1
              ).map((e) => (
                <option key={e} value={e} className="bg-dark-200">
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
