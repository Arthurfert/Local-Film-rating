// ============================================
// Utilitaires TMDB côté serveur avec HTTP/2
// ============================================

import http2 from 'node:http2';

import type {
    TMDBSearchResponse,
    TMDBMovieDetails,
    TMDBTVSearchResponse,
    TMDBTVShowDetails,
    TMDBMediaItem,
    MediaType,
} from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_ORIGIN = 'https://api.themoviedb.org';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_API_READ_ACCESS_TOKEN;

if (!TMDB_API_KEY && !TMDB_READ_ACCESS_TOKEN) {
    console.warn('Warning: TMDB API credentials not configured');
}

type CacheEntry<T> = {
    expiresAt: number;
    value: T;
};

const responseCache = new Map<string, CacheEntry<unknown>>();
let http2Session: http2.ClientHttp2Session | null = null;

function getHeaders(): Record<string, string> {
    if (TMDB_READ_ACCESS_TOKEN) {
        return {
        authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
        accept: 'application/json',
        };
    }

    return {
        accept: 'application/json',
    };
}

function buildUrl(endpoint: string, params: Record<string, string> = {}): string {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

    if (!TMDB_READ_ACCESS_TOKEN && TMDB_API_KEY) {
        url.searchParams.set('api_key', TMDB_API_KEY);
    }

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    return url.toString();
}

function getHttp2Session(): http2.ClientHttp2Session {
    if (http2Session && !http2Session.closed && !http2Session.destroyed) {
        return http2Session;
    }

    http2Session = http2.connect(TMDB_ORIGIN);

    http2Session.on('error', (error) => {
        console.error('TMDB HTTP/2 session error:', error);
    });

    http2Session.on('close', () => {
        http2Session = null;
    });

    return http2Session;
}

function getCacheKey(url: string): string {
    return `${TMDB_READ_ACCESS_TOKEN ? 'bearer' : 'api-key'}:${url}`;
}

async function requestJson<T>(url: string, revalidateSeconds: number): Promise<T> {
    const cacheKey = getCacheKey(url);
    const cached = responseCache.get(cacheKey) as CacheEntry<T> | undefined;

    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }

    const parsedUrl = new URL(url);
    const session = getHttp2Session();

    return new Promise<T>((resolve, reject) => {
        const request = session.request({
        ':method': 'GET',
        ':path': `${parsedUrl.pathname}${parsedUrl.search}`,
        ':authority': parsedUrl.host,
        ':scheme': parsedUrl.protocol.replace(':', ''),
        ...getHeaders(),
        });

    const chunks: Buffer[] = [];
    let statusCode = 0;

    request.on('response', (headers) => {
        statusCode = Number(headers[':status'] ?? 0);
    });

    request.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
    });

    request.on('error', (error) => {
        reject(error);
    });

    request.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');

        if (statusCode < 200 || statusCode >= 300) {
            reject(new Error(`TMDB API Error: ${statusCode} ${body || 'Unknown error'}`));
            return;
        }

        try {
            const value = JSON.parse(body) as T;
            responseCache.set(cacheKey, {
            expiresAt: Date.now() + revalidateSeconds * 1000,
            value,
            });
            resolve(value);
        } catch (error) {
            reject(new Error(`TMDB API Error: invalid JSON response - ${(error as Error).message}`));
        }
        });

        request.end();
    });
}

async function tmdbGet<T>(endpoint: string, params: Record<string, string>, revalidateSeconds: number): Promise<T> {
    const url = buildUrl(endpoint, params);
    return requestJson<T>(url, revalidateSeconds);
}

export async function searchMovies(
    query: string,
    page: number = 1,
    language: string = 'fr-FR'
    ): Promise<TMDBSearchResponse> {
    return tmdbGet<TMDBSearchResponse>('/search/movie', {
        query: encodeURIComponent(query),
        page: page.toString(),
        language,
        include_adult: 'false',
    }, 3600);
}

export async function getMovieDetails(
    movieId: number,
    language: string = 'fr-FR'
    ): Promise<TMDBMovieDetails> {
    return tmdbGet<TMDBMovieDetails>(`/movie/${movieId}`, {
        language,
    }, 86400);
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
        query: encodeURIComponent(query),
        page: page.toString(),
        language,
        include_adult: 'false',
    }, 3600);
}

export async function getTVShowDetails(
    tvId: number,
    language: string = 'fr-FR'
    ): Promise<TMDBTVShowDetails> {
    return tmdbGet<TMDBTVShowDetails>(`/tv/${tvId}`, {
        language,
    }, 86400);
}

export async function searchMulti(
    query: string,
    page: number = 1,
    language: string = 'fr-FR'
    ): Promise<{ results: TMDBMediaItem[]; total_results: number; total_pages: number; page: number }> {
    const [moviesResponse, tvResponse] = await Promise.all([
        searchMovies(query, page, language),
        searchTVShows(query, page, language),
    ]);

    const normalizedMovies: TMDBMediaItem[] = moviesResponse.results.map((movie) => ({
        id: movie.id,
        title: movie.title,
        original_title: movie.original_title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        popularity: movie.popularity,
        genre_ids: movie.genre_ids,
        original_language: movie.original_language,
        media_type: 'movie' as MediaType,
    }));

    const normalizedTV: TMDBMediaItem[] = tvResponse.results.map((tv) => ({
        id: tv.id,
        title: tv.name,
        original_title: tv.original_name,
        overview: tv.overview,
        poster_path: tv.poster_path,
        backdrop_path: tv.backdrop_path,
        release_date: tv.first_air_date,
        vote_average: tv.vote_average,
        vote_count: tv.vote_count,
        popularity: tv.popularity,
        genre_ids: tv.genre_ids,
        original_language: tv.original_language,
        media_type: 'tv' as MediaType,
    }));

    const combinedResults = [...normalizedMovies, ...normalizedTV].sort((a, b) => b.popularity - a.popularity);

    return {
        results: combinedResults,
        total_results: moviesResponse.total_results + tvResponse.total_results,
        total_pages: Math.max(moviesResponse.total_pages, tvResponse.total_pages),
        page,
    };
}