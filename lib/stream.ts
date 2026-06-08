import { readConfig } from './config';

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

function formatUrl(pattern: string, id: number, season?: number, ep?: number): string {
  if (!pattern) return '';
  let url = pattern.replace('{id}', String(id));
  if (season !== undefined) url = url.replace('{season}', String(season));
  if (ep !== undefined) url = url.replace('{ep}', String(ep));
  return url;
}

function envDefaults() {
  return {
    moviePattern: process.env.STREAM_MOVIE_URL_PATTERN || '',
    tvPattern: process.env.STREAM_TV_URL_PATTERN || '',
    provider: (process.env.STREAM_PROVIDER || 'embed') as StreamProvider,
  };
}

let streamConfig = envDefaults();
let streamConfigLoaded = false;

async function ensureStreamConfig(): Promise<void> {
  if (streamConfigLoaded) return;
  try {
    const config = await readConfig();
    streamConfig = {
      moviePattern: config.streamMovieUrlPattern || envDefaults().moviePattern,
      tvPattern: config.streamTvUrlPattern || envDefaults().tvPattern,
      provider: (config.streamProvider || envDefaults().provider) as StreamProvider,
    };
  } catch {
    streamConfig = envDefaults();
  }
  streamConfigLoaded = true;
}

export async function getStreamUrl(type: 'movie' | 'tv', id: number, season?: number, ep?: number): Promise<string> {
  await ensureStreamConfig();
  if (type === 'movie') {
    return formatUrl(streamConfig.moviePattern, id);
  }
  return formatUrl(streamConfig.tvPattern, id, season, ep);
}

export async function buildStreamResponse(
  type: 'movie' | 'tv',
  id: number,
  season?: number,
  ep?: number
): Promise<StreamResponse | null> {
  await ensureStreamConfig();
  const url = await getStreamUrl(type, id, season, ep);
  if (!url) return null;

  return {
    url,
    provider: streamConfig.provider,
    type,
    id,
    embed: streamConfig.provider === 'embed',
    ...(type === 'tv' ? { season, ep } : {}),
  };
}
