// ============================================
// Utilitaires pour les images
// ============================================

const TMDB_BASE_URL = 'https://image.tmdb.org/t/p';

export const TMDB_IMAGE_BASE_URL = TMDB_BASE_URL;

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
