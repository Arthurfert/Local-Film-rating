// ============================================
// Utilitaires pour l'API TMDB (côté serveur uniquement)
// ============================================

import type { TMDBSearchResponse, TMDBMovieDetails } from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Cette clé n'est accessible que côté serveur
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_API_READ_ACCESS_TOKEN;

if (!TMDB_API_KEY && !TMDB_READ_ACCESS_TOKEN) {
  console.warn('Warning: TMDB API credentials not configured');
}

// ============================================
// Configuration des requêtes
// ============================================

function getHeaders(): HeadersInit {
  if (TMDB_READ_ACCESS_TOKEN) {
    return {
      Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}

function buildUrl(endpoint: string, params: Record<string, string> = {}): string {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  
  // Ajouter la clé API si on n'utilise pas le Bearer token
  if (!TMDB_READ_ACCESS_TOKEN && TMDB_API_KEY) {
    url.searchParams.set('api_key', TMDB_API_KEY);
  }
  
  // Ajouter les paramètres supplémentaires
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return url.toString();
}

// ============================================
// Fonctions API
// ============================================

export async function searchMovies(
  query: string,
  page: number = 1,
  language: string = 'fr-FR'
): Promise<TMDBSearchResponse> {
  const url = buildUrl('/search/movie', {
    query: encodeURIComponent(query),
    page: page.toString(),
    language,
    include_adult: 'false',
  });

  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 }, // Cache pendant 1 heure
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getMovieDetails(
  movieId: number,
  language: string = 'fr-FR'
): Promise<TMDBMovieDetails> {
  const url = buildUrl(`/movie/${movieId}`, {
    language,
  });

  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 86400 }, // Cache pendant 24 heures
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getPopularMovies(
  page: number = 1,
  language: string = 'fr-FR'
): Promise<TMDBSearchResponse> {
  const url = buildUrl('/movie/popular', {
    page: page.toString(),
    language,
  });

  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getTrendingMovies(
  timeWindow: 'day' | 'week' = 'week',
  language: string = 'fr-FR'
): Promise<TMDBSearchResponse> {
  const url = buildUrl(`/trending/movie/${timeWindow}`, {
    language,
  });

  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// Utilitaires pour les images
// ============================================

export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export type ImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';

export function getPosterUrl(
  posterPath: string | null,
  size: ImageSize = 'w342'
): string {
  if (!posterPath) {
    return '/placeholder-poster.svg';
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}

export function getBackdropUrl(
  backdropPath: string | null,
  size: BackdropSize = 'w1280'
): string {
  if (!backdropPath) {
    return '/placeholder-backdrop.svg';
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
}
