import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

export interface AppConfig {
  tmdbApiKey: string;
  tmdbApiReadAccessToken: string;
  streamProvider: string;
  streamMovieUrlPattern: string;
  streamTvUrlPattern: string;
}

function envDefaults(): AppConfig {
  return {
    tmdbApiKey: process.env.TMDB_API_KEY || '',
    tmdbApiReadAccessToken: process.env.TMDB_API_READ_ACCESS_TOKEN || '',
    streamProvider: process.env.STREAM_PROVIDER || 'embed',
    streamMovieUrlPattern: process.env.STREAM_MOVIE_URL_PATTERN || '',
    streamTvUrlPattern: process.env.STREAM_TV_URL_PATTERN || '',
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
    return { ...envDefaults(), ...saved };
  } catch {
    return envDefaults();
  }
}

export async function writeConfig(config: AppConfig): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}
