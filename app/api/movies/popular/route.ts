// ============================================
// API Route: Films populaires/tendances
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getPopularMovies, getTrendingMovies } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'popular';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const language = searchParams.get('language') || 'fr-FR';
    const timeWindow = (searchParams.get('timeWindow') || 'week') as 'day' | 'week';

    let data;

    if (type === 'trending') {
      data = await getTrendingMovies(timeWindow, language);
    } else {
      data = await getPopularMovies(page, language);
    }

    return NextResponse.json({
      movies: data.results,
      totalResults: data.total_results,
      totalPages: data.total_pages,
      page: data.page,
    });
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des films' },
      { status: 500 }
    );
  }
}
