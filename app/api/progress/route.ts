import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { upsertProgress } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  try {
    const data = await request.json();
    const tmdbId = parseInt(data.tmdb_id, 10);
    const seasonNumber = parseInt(data.season_number, 10);
    const episodeNumber = parseInt(data.episode_number, 10);

    if (isNaN(tmdbId) || isNaN(seasonNumber) || isNaN(episodeNumber) || seasonNumber < 1 || episodeNumber < 1) {
      return NextResponse.json({ error: 'tmdb_id, season_number et episode_number doivent être des nombres valides supérieurs à 0' }, { status: 400 });
    }

    const entry = await upsertProgress(tmdbId, seasonNumber, episodeNumber);
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
