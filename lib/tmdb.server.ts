// ============================================
// Utilitaires TMDB côté serveur (fetch + cache)
// ============================================

import type {
    TMDBSearchResponse,
    TMDBMovieDetails,
    TMDBTVSearchResponse,
    TMDBTVShowDetails,
    TMDBSeasonDetails,
    TMDBMediaItem,
    MediaType,
} from './types';
import { readConfig } from './config';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Timeout par requête TMDB (ms). Sans ça, une requête bloquée
// laisse le spinner tourner indéfiniment.
const TMDB_TIMEOUT_MS = 10_000;

type Creds = { apiKey: string; accessToken: string };

// Les credentials sont lus depuis data/config.json (disque).
// On les met en cache brièvement pour éviter 1 lecture disque
// par frappe clavier dans la barre de recherche.
let credsCache: { expiresAt: number; value: Creds } | null = null;
const CREDS_TTL_MS = 60_000;

async function getCreds(): Promise<Creds> {
    if (credsCache && credsCache.expiresAt > Date.now()) {
        return credsCache.value;
    }
    let value: Creds;
    try {
        const config = await readConfig();
        value = {
            apiKey: config.tmdbApiKey || process.env.TMDB_API_KEY || '',
            accessToken: config.tmdbApiReadAccessToken || process.env.TMDB_API_READ_ACCESS_TOKEN || '',
        };
    } catch {
        value = {
            apiKey: process.env.TMDB_API_KEY || '',
            accessToken: process.env.TMDB_API_READ_ACCESS_TOKEN || '',
        };
    }
    credsCache = { expiresAt: Date.now() + CREDS_TTL_MS, value };
    return value;
}

type CacheEntry<T> = {
    expiresAt: number;
    value: T;
};

const responseCache = new Map<string, CacheEntry<unknown>>();
const CACHE_MAX_SIZE = 500;

function getHeaders(accessToken: string): Record<string, string> {
    if (accessToken) {
        return {
            authorization: `Bearer ${accessToken}`,
            accept: 'application/json',
        };
    }

    return {
        accept: 'application/json',
    };
}

function buildUrl(endpoint: string, accessToken: string, apiKey: string, params: Record<string, string> = {}): string {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

    if (!accessToken && apiKey) {
        url.searchParams.set('api_key', apiKey);
    }

    // IMPORTANT : passer les valeurs brutes ici.
    // URLSearchParams s'occupe déjà de l'encodage — un
    // encodeURIComponent() en amont double-encode la requête
    // (ex. "star wars" -> "star%2520wars") et TMDB renvoie
    // des résultats vides ou hors sujet.
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    return url.toString();
}

function getCacheKey(url: string, hasAccessToken: boolean): string {
    return `${hasAccessToken ? 'bearer' : 'api-key'}:${url}`;
}

function cacheGet<T>(key: string): T | undefined {
    const cached = responseCache.get(key) as CacheEntry<T> | undefined;
    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }
    if (cached) responseCache.delete(key);
    return undefined;
}

function cacheSet<T>(key: string, value: T, revalidateSeconds: number): void {
    if (responseCache.size >= CACHE_MAX_SIZE) {
        const firstKey = responseCache.keys().next().value;
        if (firstKey) responseCache.delete(firstKey);
    }
    responseCache.set(key, {
        expiresAt: Date.now() + revalidateSeconds * 1000,
        value,
    });
}

async function requestJson<T>(url: string, accessToken: string, revalidateSeconds: number): Promise<T> {
    const cacheKey = getCacheKey(url, !!accessToken);
    const cached = cacheGet<T>(cacheKey);
    if (cached !== undefined) return cached;

    let response: Response;
    try {
        response = await fetch(url, {
            headers: getHeaders(accessToken),
            // AbortSignal.timeout évite les requêtes pendantes qui
            // donnaient l'impression d'une API "très lente".
            signal: AbortSignal.timeout(TMDB_TIMEOUT_MS),
        });
    } catch (error) {
        throw new Error(`TMDB API Error: request failed - ${(error as Error).message}`);
    }

    if (!response.ok) {
        const body = (await response.text().catch(() => '')).slice(0, 500);
        throw new Error(`TMDB API Error: ${response.status} ${body || response.statusText}`);
    }

    let value: T;
    try {
        value = (await response.json()) as T;
    } catch (error) {
        throw new Error(`TMDB API Error: invalid JSON response - ${(error as Error).message}`);
    }
    cacheSet(cacheKey, value, revalidateSeconds);
    return value;
}

async function tmdbGet<T>(endpoint: string, params: Record<string, string>, revalidateSeconds: number): Promise<T> {
    const { apiKey, accessToken } = await getCreds();
    const url = buildUrl(endpoint, accessToken, apiKey, params);
    return requestJson<T>(url, accessToken, revalidateSeconds);
}

export async function searchMovies(
    query: string,
    page: number = 1,
    language: string = 'fr-FR'
    ): Promise<TMDBSearchResponse> {
    return tmdbGet<TMDBSearchResponse>('/search/movie', {
        query,
        page: page.toString(),
        language,
        include_adult: 'false',
    }, 300);
}

export async function getMovieDetails(
    movieId: number,
    language: string = 'fr-FR'
    ): Promise<TMDBMovieDetails> {
    const details = await tmdbGet<TMDBMovieDetails>(`/movie/${movieId}`, {
        language,
    }, 86400);

    // Fallback images : TMDB peut renvoyer poster/backdrop null pour
    // la langue demandée alors qu'un visuel existe en anglais
    // (le site tmdb.org fait ce fallback, l'app affichait "No Image").
    if ((details.poster_path === null || details.backdrop_path === null) && language !== 'en-US') {
        try {
            const fallback = await tmdbGet<TMDBMovieDetails>(`/movie/${movieId}`, {
                language: 'en-US',
            }, 86400);
            return {
                ...details,
                poster_path: details.poster_path ?? fallback.poster_path,
                backdrop_path: details.backdrop_path ?? fallback.backdrop_path,
            };
        } catch {
            return details;
        }
    }

    return details;
}

export async function getPopularMovies(
    page: number = 1,
    language: string = 'fr-FR'
    ): Promise<TMDBSearchResponse> {
    return tmdbGet<TMDBSearchResponse>('/movie/popular', {
        page: page.toString(),
        language,
    }, 3600);
}

export async function getTrendingMovies(
    timeWindow: 'day' | 'week' = 'week',
    language: string = 'fr-FR'
    ): Promise<TMDBSearchResponse> {
    return tmdbGet<TMDBSearchResponse>(`/trending/movie/${timeWindow}`, {
        language,
    }, 3600);
}

export async function searchTVShows(
    query: string,
    page: number = 1,
    language: string = 'fr-FR'
    ): Promise<TMDBTVSearchResponse> {
    return tmdbGet<TMDBTVSearchResponse>('/search/tv', {
        query,
        page: page.toString(),
        language,
        include_adult: 'false',
    }, 300);
}

export async function getTVShowDetails(
    tvId: number,
    language: string = 'fr-FR'
    ): Promise<TMDBTVShowDetails> {
    const details = await tmdbGet<TMDBTVShowDetails>(`/tv/${tvId}`, {
        language,
    }, 86400);

    if ((details.poster_path === null || details.backdrop_path === null) && language !== 'en-US') {
        try {
            const fallback = await tmdbGet<TMDBTVShowDetails>(`/tv/${tvId}`, {
                language: 'en-US',
            }, 86400);
            return {
                ...details,
                poster_path: details.poster_path ?? fallback.poster_path,
                backdrop_path: details.backdrop_path ?? fallback.backdrop_path,
            };
        } catch {
            return details;
        }
    }

    return details;
}

export async function getSeasonDetails(
    tvId: number,
    seasonNumber: number,
    language: string = 'fr-FR'
    ): Promise<TMDBSeasonDetails> {
    // Un seul appel retourne TOUS les épisodes de la saison
    // (nom, résumé, durée, date de diffusion) — inutile d'appeler
    // la route episode N fois.
    const details = await tmdbGet<TMDBSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`, {
        language,
    }, 86400);

    // Fallback en-US pour les épisodes sans titre/résumé traduit
    // (fréquent sur les séries récentes ou confidentielles).
    if (language !== 'en-US' && details.episodes.some((e) => !e.name || !e.overview)) {
        try {
            const fallback = await tmdbGet<TMDBSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`, {
                language: 'en-US',
            }, 86400);
            const fallbackByNumber = new Map(fallback.episodes.map((e) => [e.episode_number, e]));
            details.episodes = details.episodes.map((e) => {
                const f = fallbackByNumber.get(e.episode_number);
                if (!f) return e;
                return {
                    ...e,
                    name: e.name || f.name,
                    overview: e.overview || f.overview,
                };
            });
        } catch {
            // On garde la version française partielle
        }
    }

    return details;
}

// Réponse brute de /search/multi : mélange films, séries et personnes.
interface TMDBMultiRawItem {
    id: number;
    media_type?: string;
    // Champs film
    title?: string;
    original_title?: string;
    release_date?: string;
    // Champs série / personne
    name?: string;
    original_name?: string;
    first_air_date?: string;
    overview?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    genre_ids?: number[];
    original_language?: string;
}

interface TMDBMultiRawResponse {
    page: number;
    results: TMDBMultiRawItem[];
    total_pages: number;
    total_results: number;
}

export async function searchMulti(
    query: string,
    page: number = 1,
    language: string = 'fr-FR'
    ): Promise<{ results: TMDBMediaItem[]; total_results: number; total_pages: number; page: number }> {
    // Un seul appel /search/multi au lieu de 2 appels (movie + tv) :
    // on divise la latence par ~2 et on garde le classement par
    // pertinence de TMDB (le tri manuel par popularité cassait ce
    // classement et donnait des résultats surprenants).
    const response = await tmdbGet<TMDBMultiRawResponse>('/search/multi', {
        query,
        page: page.toString(),
        language,
        include_adult: 'false',
    }, 300);

    const results: TMDBMediaItem[] = [];
    for (const item of response.results) {
        if (item.media_type === 'movie') {
            results.push({
                id: item.id,
                title: item.title ?? '',
                original_title: item.original_title ?? item.title ?? '',
                overview: item.overview ?? '',
                poster_path: item.poster_path ?? null,
                backdrop_path: item.backdrop_path ?? null,
                release_date: item.release_date ?? '',
                vote_average: item.vote_average ?? 0,
                vote_count: item.vote_count ?? 0,
                popularity: item.popularity ?? 0,
                genre_ids: item.genre_ids ?? [],
                original_language: item.original_language ?? '',
                media_type: 'movie' as MediaType,
            });
        } else if (item.media_type === 'tv') {
            results.push({
                id: item.id,
                title: item.name ?? '',
                original_title: item.original_name ?? item.name ?? '',
                overview: item.overview ?? '',
                poster_path: item.poster_path ?? null,
                backdrop_path: item.backdrop_path ?? null,
                release_date: item.first_air_date ?? '',
                vote_average: item.vote_average ?? 0,
                vote_count: item.vote_count ?? 0,
                popularity: item.popularity ?? 0,
                genre_ids: item.genre_ids ?? [],
                original_language: item.original_language ?? '',
                media_type: 'tv' as MediaType,
            });
        }
        // On ignore les personnes ("person") : pas de poster film/série.
    }

    return {
        results,
        total_results: response.total_results,
        total_pages: response.total_pages,
        page: response.page,
    };
}
