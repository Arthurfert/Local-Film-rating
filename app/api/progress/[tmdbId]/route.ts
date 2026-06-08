import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getProgress } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest, context: any) {
  const authError = await requireAuth(request);
  if (authError) return authError;
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
