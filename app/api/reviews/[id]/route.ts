// ============================================
// API Route: Opérations sur une review spécifique
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getReviewById, updateReview, deleteReview } from '@/lib/db';

// GET - Récupérer une review par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await getReviewById(params.id);

    if (!review) {
      return NextResponse.json(
        { error: 'Review non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la review' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une review
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const review = await updateReview(params.id, body);

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error updating review:', error);

    if (error instanceof Error && error.message === 'Review non trouvée') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la review' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteReview(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);

    if (error instanceof Error && error.message === 'Review non trouvée') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la review' },
      { status: 500 }
    );
  }
}
