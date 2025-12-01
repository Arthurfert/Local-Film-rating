// ============================================
// API Route: Détails d'un film TMDB
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetails } from '@/lib/tmdb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = parseInt(params.id, 10);
    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get('language') || 'fr-FR';

    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'ID de film invalide' },
        { status: 400 }
      );
    }

    const movie = await getMovieDetails(movieId, language);

    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails du film' },
      { status: 500 }
    );
  }
}
