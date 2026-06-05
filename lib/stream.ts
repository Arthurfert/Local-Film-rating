export type StreamProvider = 'embed' | 'direct';

export interface StreamResponse {
  url: string;
  provider: StreamProvider;
  type: 'movie' | 'tv';
  id: number;
  embed?: boolean;
  season?: number;
  ep?: number;
}

const DEFAULT_MOVIE_PATTERN = process.env.STREAM_MOVIE_URL_PATTERN || '';
const DEFAULT_TV_PATTERN = process.env.STREAM_TV_URL_PATTERN || '';
const STREAM_PROVIDER = (process.env.STREAM_PROVIDER || 'embed') as StreamProvider;

function formatUrl(pattern: string, id: number, season?: number, ep?: number): string {
  if (!pattern) return '';
  let url = pattern.replace('{id}', String(id));
  if (season !== undefined) url = url.replace('{season}', String(season));
  if (ep !== undefined) url = url.replace('{ep}', String(ep));
  return url;
}

export function getStreamUrl(type: 'movie' | 'tv', id: number, season?: number, ep?: number): string {
  if (type === 'movie') {
    return formatUrl(DEFAULT_MOVIE_PATTERN, id);
  }
  return formatUrl(DEFAULT_TV_PATTERN, id, season, ep);
}

export function buildStreamResponse(
  type: 'movie' | 'tv',
  id: number,
  season?: number,
  ep?: number
): StreamResponse | null {
  const url = getStreamUrl(type, id, season, ep);
  if (!url) return null;

  return {
    url,
    provider: STREAM_PROVIDER,
    type,
    id,
    embed: STREAM_PROVIDER === 'embed',
    ...(type === 'tv' ? { season, ep } : {}),
  };
}
