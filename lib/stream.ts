import { readConfig } from './config';
import type { StreamProviderConfig } from './config';

export type StreamProvider = 'embed' | 'direct';

export interface StreamResponse {
  url: string;
  provider: StreamProvider;
  providerName?: string;
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

export async function getStreamUrl(
  type: 'movie' | 'tv',
  id: number,
  season?: number,
  ep?: number,
  providerName?: string
): Promise<{ url: string; provider: StreamProvider; providerName: string } | null> {
  const config = await readConfig();
  const providers = config.streamProviders || [];

  let p: StreamProviderConfig | undefined;
  if (providerName) {
    p = providers.find((sp) => sp.name === providerName);
  }
  if (!p && providers.length > 0) {
    p = providers[0];
  }
  if (!p) return null;

  const pattern = type === 'movie' ? p.movieUrlPattern : p.tvUrlPattern;
  const url = formatUrl(pattern, id, season, ep);
  if (!url) return null;

  return { url, provider: p.type, providerName: p.name };
}

export async function buildStreamResponse(
  type: 'movie' | 'tv',
  id: number,
  season?: number,
  ep?: number,
  providerName?: string
): Promise<StreamResponse | null> {
  const result = await getStreamUrl(type, id, season, ep, providerName);
  if (!result) return null;

  return {
    url: result.url,
    provider: result.provider,
    providerName: result.providerName,
    type,
    id,
    embed: result.provider === 'embed',
    ...(type === 'tv' ? { season, ep } : {}),
  };
}
