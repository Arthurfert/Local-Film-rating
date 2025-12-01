// ============================================
// API Route: Vérifier si un film est déjà noté
// ============================================

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getReviewByTmdbId } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { tmdbId: string } }
) {
  try {
    const tmdbId = parseInt(params.tmdbId, 10);

    if (isNaN(tmdbId)) {
      return NextResponse.json(
        { error: 'ID TMDB invalide' },
        { status: 400 }
      );
    }

    const review = await getReviewByTmdbId(tmdbId);

    return NextResponse.json({
      exists: !!review,
      review: review || null,
    });
  } catch (error) {
    console.error('Error checking review:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
