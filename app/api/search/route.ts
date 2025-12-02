// ============================================
// API Route: Recherche multi (films + séries) TMDB
// ============================================

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { searchMulti } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const language = searchParams.get('language') || 'fr-FR';

    // Validation des paramètres
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le paramètre "query" est requis' },
        { status: 400 }
      );
    }

    if (query.length < 2) {
      return NextResponse.json(
        { error: 'La recherche doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    // Appel à l'API TMDB (côté serveur)
    const data = await searchMulti(query.trim(), page, language);

    // Réponse formatée
    return NextResponse.json({
      results: data.results,
      totalResults: data.total_results,
      totalPages: data.total_pages,
      page: data.page,
    });
  } catch (error) {
    console.error('Error searching media:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}
