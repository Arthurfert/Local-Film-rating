// ============================================
// API Route: Détails d'une série TV TMDB
// ============================================

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getTVShowDetails } from '@/lib/tmdb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tvId = parseInt(params.id, 10);
    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get('language') || 'fr-FR';

    if (isNaN(tvId)) {
      return NextResponse.json(
        { error: 'ID de série invalide' },
        { status: 400 }
      );
    }

    const tvShow = await getTVShowDetails(tvId, language);

    return NextResponse.json(tvShow);
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails de la série' },
      { status: 500 }
    );
  }
}
