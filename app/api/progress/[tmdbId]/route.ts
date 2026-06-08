import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getProgress } from '@/lib/db';

export async function GET(_request: NextRequest, context: any) {
  const params = await context.params;
  try {
    const tmdbId = parseInt(params.tmdbId, 10);
    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    const progress = await getProgress(tmdbId);
    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
