'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import type { StreamResponse } from '@/lib/stream';
import { AlertCircle, Loader2, ChevronDown } from 'lucide-react';

interface SeasonInfo {
  seasonNumber: number;
  episodeCount: number;
}

interface WatchClientProps {
  type: 'movie' | 'tv';
  id: number;
  title?: string;
  poster?: string;
  seasons?: SeasonInfo[];
}

function CustomSelect({
  value,
  onChange,
  options,
  renderOption,
}: {
  value: number;
  onChange: (v: number) => void;
  options: { value: number; label: string }[];
  renderOption?: (label: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  const selected = options.find((o) => o.value === value);
  const displayValue = renderOption ? renderOption(selected?.label ?? '') : selected?.label ?? '';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-dark-200 border border-white/10 rounded-xl px-4 py-2.5 pr-3 text-sm text-white/90 font-medium focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer whitespace-nowrap"
      >
        {displayValue}
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 min-w-full bg-dark-300 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl z-50 animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-1.5 text-sm transition-colors duration-200 ${
                opt.value === value
                  ? 'text-white bg-red-500/15'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {renderOption ? renderOption(opt.label) : opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WatchClient({
  type,
  id,
  title,
  poster,
  seasons,
}: WatchClientProps) {
  const [seasonIdx, setSeasonIdx] = useState(0);
  const [ep, setEp] = useState(1);
  const [stream, setStream] = useState<StreamResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const currentSeason = seasons?.[seasonIdx];
  const seasonNumber = currentSeason?.seasonNumber ?? 1;
  const maxEp = currentSeason?.episodeCount ?? 1;

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
    if (ep > maxEp) {
      setEp(maxEp);
    }
  }, [seasonIdx, maxEp, ep]);

  useEffect(() => {
    fetchStream(seasonNumber, ep);
  }, [type, id, seasonNumber, ep]);

  if (error && !loading) {
    return (
      <div className="flex items-center justify-center aspect-video bg-dark-200/80 rounded-2xl">
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
        <div className="flex items-center justify-center aspect-video bg-dark-200/80 rounded-2xl">
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
      {type === 'tv' && seasons && seasons.length > 0 && (
        <div className="flex items-center gap-4 mt-4 px-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-white/50 tracking-wide uppercase">Saison</label>
            <CustomSelect
              value={seasonIdx}
              onChange={(idx) => { setSeasonIdx(idx); setEp(1); }}
              options={seasons.map((s, i) => ({ value: i, label: `Saison ${s.seasonNumber}` }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-white/50 tracking-wide uppercase">Épisode</label>
            <CustomSelect
              value={ep}
              onChange={setEp}
              options={Array.from({ length: maxEp }, (_, i) => ({ value: i + 1, label: `${i + 1}` }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
