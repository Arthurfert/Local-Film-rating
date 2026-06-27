import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

export interface StreamProviderConfig {
  name: string;
  type: 'embed' | 'direct';
  movieUrlPattern: string;
  tvUrlPattern: string;
}

export interface AppConfig {
  tmdbApiKey: string;
  tmdbApiReadAccessToken: string;
  streamProvider: string;
  streamMovieUrlPattern: string;
  streamTvUrlPattern: string;
  streamProviders: StreamProviderConfig[];
  appSecret: string;
}

function envDefaults(): AppConfig {
  return {
    tmdbApiKey: process.env.TMDB_API_KEY || '',
    tmdbApiReadAccessToken: process.env.TMDB_API_READ_ACCESS_TOKEN || '',
    streamProvider: process.env.STREAM_PROVIDER || 'embed',
    streamMovieUrlPattern: process.env.STREAM_MOVIE_URL_PATTERN || '',
    streamTvUrlPattern: process.env.STREAM_TV_URL_PATTERN || '',
    streamProviders: [],
    appSecret: process.env.APP_SECRET || '',
  };
}

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readConfig(): Promise<AppConfig> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    const saved = JSON.parse(data);
    const config: AppConfig = { ...envDefaults(), ...saved };
    if (!config.streamProviders || config.streamProviders.length === 0) {
      if (config.streamMovieUrlPattern || config.streamTvUrlPattern) {
        config.streamProviders = [
          {
            name: 'Principal',
            type: (config.streamProvider as 'embed' | 'direct') || 'embed',
            movieUrlPattern: config.streamMovieUrlPattern,
            tvUrlPattern: config.streamTvUrlPattern,
          },
        ];
      }
    }
    return config;
  } catch {
    return envDefaults();
  }
}

export async function writeConfig(config: AppConfig): Promise<void> {
  await ensureDataDir();
  const toSave = { ...config };
  if (toSave.streamProviders && toSave.streamProviders.length > 0) {
    const p = toSave.streamProviders[0];
    toSave.streamProvider = p.type;
    toSave.streamMovieUrlPattern = p.movieUrlPattern;
    toSave.streamTvUrlPattern = p.tvUrlPattern;
  }
  await fs.writeFile(CONFIG_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
}
