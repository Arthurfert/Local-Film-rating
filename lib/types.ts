// ============================================
// Types TypeScript pour l'application
// ============================================

// ============================================
// Types TMDB API
// ============================================

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  video: boolean;
}

export interface TMDBMovieDetails extends Omit<TMDBMovie, 'genre_ids'> {
  genres: TMDBGenre[];
  runtime: number;
  budget: number;
  revenue: number;
  status: string;
  tagline: string;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  spoken_languages: TMDBSpokenLanguage[];
  imdb_id: string | null;
  homepage: string | null;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

// ============================================
// Types Application
// ============================================

export interface MovieRating {
  scenario: number;
  visual: number;
  music: number;
  acting: number;
}

export interface Review {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  original_title: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  overview: string | null;
  genres: string[];
  runtime: number | null;
  rating_scenario: number;
  rating_visual: number;
  rating_music: number;
  rating_acting: number;
  rating_global: number;
  review_text: string | null;
  watched_date: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewFormData {
  tmdb_id: number;
  title: string;
  original_title?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  overview?: string;
  genres?: string[];
  runtime?: number;
  rating_scenario: number;
  rating_visual: number;
  rating_music: number;
  rating_acting: number;
  review_text?: string;
  watched_date?: string;
  is_favorite?: boolean;
}

export interface UserStats {
  user_id: string;
  total_reviews: number;
  avg_rating: number;
  favorites_count: number;
  last_review_date: string | null;
}

// ============================================
// Types pour les composants UI
// ============================================

export interface RatingCriterion {
  key: keyof MovieRating;
  label: string;
  icon: string;
  description: string;
}

export const RATING_CRITERIA: RatingCriterion[] = [
  {
    key: 'scenario',
    label: 'Scénario',
    icon: 'BookOpen',
    description: 'Qualité de l\'histoire, intrigue, dialogues',
  },
  {
    key: 'visual',
    label: 'Visuel',
    icon: 'Eye',
    description: 'Cinématographie, effets visuels, direction artistique',
  },
  {
    key: 'music',
    label: 'Musique',
    icon: 'Music',
    description: 'Bande originale, sound design, ambiance sonore',
  },
  {
    key: 'acting',
    label: 'Acting',
    icon: 'Users',
    description: 'Performance des acteurs, casting',
  },
];

// ============================================
// Types pour les réponses API
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface SearchMoviesResponse {
  movies: TMDBMovie[];
  totalResults: number;
  totalPages: number;
  page: number;
}
