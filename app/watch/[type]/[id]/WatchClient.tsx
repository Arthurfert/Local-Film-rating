'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import type { StreamResponse } from '@/lib/stream';
import { saveProgress } from '@/lib/seriesProgress';
import type { SeasonEpisodeItem } from '@/lib/types';
import { AlertCircle, Loader2, ChevronDown, Check, Clock } from 'lucide-react';

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

function EpisodeSelect({
  seriesId,
  seasonNumber,
  episodeCount,
  value,
  onChange,
}: {
  seriesId: number;
  seasonNumber: number;
  episodeCount: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cacheRef = useRef(new Map<number, SeasonEpisodeItem[]>());
  const [episodes, setEpisodes] = useState<SeasonEpisodeItem[] | null>(
    cacheRef.current.get(seasonNumber) ?? null
  );
  const [loading, setLoading] = useState(false);

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

  // Charger les détails des épisodes (1 seul appel par saison, mis en cache)
  useEffect(() => {
    const cached = cacheRef.current.get(seasonNumber);
    if (cached) {
      setEpisodes(cached);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/tv/${seriesId}/season/${seasonNumber}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('fetch failed'))))
      .then((data) => {
        if (cancelled) return;
        const list: SeasonEpisodeItem[] = data.episodes || [];
        cacheRef.current.set(seasonNumber, list);
        setEpisodes(list);
      })
      .catch(() => {
        if (!cancelled) setEpisodes(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [seriesId, seasonNumber]);

  const current = episodes?.find((e) => e.episode_number === value);

  const fallbackOptions = Array.from({ length: episodeCount }, (_, i) => i + 1);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-dark-200 border border-white/10 rounded-xl px-4 py-2.5 pr-3 text-sm text-white/90 font-medium focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer whitespace-nowrap max-w-[16rem]"
      >
        <span className="truncate">
          Épisode {value}
          {current?.name ? <span className="text-white/50"> — {current.name}</span> : ''}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-white/40 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-[min(28rem,90vw)] max-h-[50vh] overflow-y-auto bg-dark-300/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl z-50 animate-fade-in">
          {loading && !episodes ? (
            <div className="p-2 space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3 p-3">
                  <div className="skeleton w-9 h-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/3 rounded" />
                    <div className="skeleton h-3 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : episodes && episodes.length > 0 ? (
            episodes.map((ep) => {
              const isCurrent = ep.episode_number === value;
              return (
                <button
                  key={ep.episode_number}
                  type="button"
                  onClick={() => {
                    onChange(ep.episode_number);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 p-3 text-left transition-colors duration-200 border-b border-white/5 last:border-0 ${
                    isCurrent ? 'bg-red-500/15' : 'hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`flex w-9 h-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      isCurrent ? 'bg-red-500 text-white' : 'bg-white/5 text-white/60'
                    }`}
                  >
                    {ep.episode_number}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-white' : 'text-white/90'}`}>
                        {ep.name || `Épisode ${ep.episode_number}`}
                      </span>
                      {isCurrent && <Check className="w-4 h-4 shrink-0 text-red-400" />}
                    </span>
                    {ep.overview && (
                      <span className="mt-0.5 block text-xs text-white/50 line-clamp-2 leading-relaxed">
                        {ep.overview}
                      </span>
                    )}
                    <span className="mt-1 flex items-center gap-3 text-[11px] text-white/40">
                      {ep.runtime ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ep.runtime} min
                        </span>
                      ) : null}
                      {ep.air_date ? <span>{new Date(ep.air_date).toLocaleDateString('fr-FR')}</span> : null}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            fallbackOptions.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  onChange(n);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-1.5 text-sm transition-colors duration-200 ${
                  n === value
                    ? 'text-white bg-red-500/15'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {n}
              </button>
            ))
          )}
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
  const searchParams = useSearchParams();

  const initialSeasonIdx = (() => {
    if (seasons) {
      const sNum = parseInt(searchParams.get('season') ?? '', 10);
      if (!isNaN(sNum)) {
        const idx = seasons.findIndex((s) => s.seasonNumber === sNum);
        if (idx >= 0) return idx;
      }
    }
    return 0;
  })();

  const [seasonIdx, setSeasonIdx] = useState(initialSeasonIdx);
  const [ep, setEp] = useState(1);
  const [stream, setStream] = useState<StreamResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  const currentSeason = seasons?.[seasonIdx];
  const seasonNumber = currentSeason?.seasonNumber ?? 1;
  const maxEp = currentSeason?.episodeCount ?? 1;

  const computedInitialEp = (() => {
    const epParam = parseInt(searchParams.get('ep') ?? '', 10);
    if (!isNaN(epParam) && epParam >= 1 && epParam <= maxEp) return epParam;
    return 1;
  })();

  const [epInitialized, setEpInitialized] = useState(false);

  useEffect(() => {
    if (!epInitialized) {
      setEp(computedInitialEp);
      setEpInitialized(true);
    }
  }, [computedInitialEp, epInitialized]);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((c) => {
        const names: string[] = (c.streamProviders || []).map((p: any) => p.name).filter(Boolean);
        setProviders(names);
        if (names.length > 0 && !selectedProvider) {
          setSelectedProvider(names[0]);
        }
      })
      .catch(() => {});
  }, []);

  const fetchStream = async (s: number, e: number, prov?: string) => {
    try {
      setLoading(true);
      setError(null);
      let params = type === 'tv' ? `?season=${s}&ep=${e}` : '?';
      if (prov) {
        params += (params.includes('=') ? '&' : '') + `provider=${encodeURIComponent(prov)}`;
      }
      const url = `/api/stream/${type}/${id}${params}`;
      const res = await fetch(url);
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
    if (epInitialized) {
      fetchStream(seasonNumber, ep, selectedProvider);
    }
  }, [type, id, seasonNumber, ep, epInitialized, selectedProvider]);

  const handleSeasonChange = (idx: number) => {
    setSeasonIdx(idx);
    setEp(1);
    const s = seasons?.[idx];
    if (s) saveProgress(id, s.seasonNumber, 1);
  };

  const handleEpisodeChange = (newEp: number) => {
    setEp(newEp);
    saveProgress(id, seasonNumber, newEp);
  };

  const handleProviderChange = (name: string) => {
    setSelectedProvider(name);
  };

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

      <div className="flex items-center gap-4 mt-4 px-2 flex-wrap">
        {providers.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-white/50 tracking-wide uppercase">Source</label>
            <CustomSelect
              value={providers.indexOf(selectedProvider)}
              onChange={(idx) => handleProviderChange(providers[idx])}
              options={providers.map((name, i) => ({ value: i, label: name }))}
            />
          </div>
        )}

        {type === 'tv' && seasons && seasons.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-white/50 tracking-wide uppercase">Saison</label>
              <CustomSelect
                value={seasonIdx}
                onChange={handleSeasonChange}
                options={seasons.map((s, i) => ({ value: i, label: `Saison ${s.seasonNumber}` }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-white/50 tracking-wide uppercase">Épisode</label>
              <EpisodeSelect
                seriesId={id}
                seasonNumber={seasonNumber}
                episodeCount={maxEp}
                value={ep}
                onChange={handleEpisodeChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
