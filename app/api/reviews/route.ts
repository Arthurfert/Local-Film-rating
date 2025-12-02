// ============================================
// API Route: Liste et création des reviews
// ============================================

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getAllReviews, createReview, getStats, getMonthlyReviews } from '@/lib/db';

// GET - Récupérer toutes les reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get('stats') === 'true';

    const reviews = await getAllReviews();

    if (includeStats) {
      const stats = await getStats();
      const monthlyReviews = await getMonthlyReviews();
      return NextResponse.json({
        reviews,
        stats: {
          ...stats,
          monthly_count: monthlyReviews.length,
        },
      });
    }

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des reviews' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation basique
    if (!body.tmdb_id || !body.title) {
      return NextResponse.json(
        { error: 'tmdb_id et title sont requis' },
        { status: 400 }
      );
    }

    // S'assurer que media_type est défini (par défaut 'movie' pour la rétrocompatibilité)
    if (!body.media_type) {
      body.media_type = 'movie';
    }

    const review = await createReview(body);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error instanceof Error && (
      error.message === 'Ce film a déjà été noté' || 
      error.message === 'Cette série a déjà été notée'
    )) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la review' },
      { status: 500 }
    );
  }
}
